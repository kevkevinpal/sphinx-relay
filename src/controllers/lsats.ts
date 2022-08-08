import { Lsat } from 'lsat-js'
import { models } from '../models'
import { logging, sphinxLogger } from '../utils/logger'
import { failure, success } from '../utils/res'
import * as Lightning from '../grpc/lightning'
import { Op } from 'sequelize'
import { Response, Request } from 'express'

export interface LsatRequestBody {
  paymentRequest: string
  macaroon: string
  issuer: string
  paths?: string
  metadata?: string
  [key: string]: string | undefined
}

export interface RelayRequest extends Request {
  owner: { id: number }
  body: LsatRequestBody
}

interface LsatResponse {
  paymentRequest: string
  macaroon: string
  issuer: string
  paths: string
  preimage: string
  metadata: string
}

const lsatResponseAttributes = [
  'macaroon',
  'paymentRequest',
  'paths',
  'preimage',
  'issuer',
  'metadata',
  'identifier',
]

async function lsatAlreadyExists(lsat): Promise<boolean> {
  const identifier = lsat.id
  const model = await models.Lsat.findOne({
    where: { identifier },
    attributes: lsatResponseAttributes,
  })

  if (model) return true
  return false
}

export async function payForLsat(
  paymentRequest: string
): Promise<string | void> {
  if (!paymentRequest) {
    sphinxLogger.error(
      '[pay invoice] "payment_request" is empty',
      logging.Lightning
    )
    return
  }

  sphinxLogger.info(`[pay invoice] ${paymentRequest}`, logging.Lightning)

  const response = await Lightning.sendPayment(paymentRequest)

  sphinxLogger.info(['[pay invoice data]', response], logging.Lightning)

  return response.payment_preimage.toString('hex')
}

export async function saveLsat(
  req: RelayRequest,
  res: Response
): Promise<void | Response> {
  const tenant: number = req.owner.id

  sphinxLogger.info(`=> saveLsat`, logging.Express)

  const { paymentRequest, macaroon, issuer, paths, metadata } = req.body

  if (!paymentRequest || !macaroon || !issuer) {
    return failure(res, 'Missing required LSAT data')
  }

  let lsat: Lsat
  try {
    lsat = Lsat.fromMacaroon(macaroon, paymentRequest)
  } catch (e) {
    sphinxLogger.error(
      ['[save lsat] Problem getting Lsat:', e.message],
      logging.Lsat
    )
    res.status(400)
    return res.json({ success: false, error: 'invalid lsat macaroon' })
  }

  const identifier = lsat.id

  if (await lsatAlreadyExists(lsat)) {
    sphinxLogger.info(
      ['[pay for lsat] Lsat already exists: ', identifier],
      logging.Lsat
    )
    return failure(res, `Could not save lsat. Already exists`)
  }

  let preimage: string | void

  try {
    preimage = await payForLsat(paymentRequest)
  } catch (e) {
    sphinxLogger.error(
      ['[pay for lsat] Problem paying for lsat:', e],
      logging.Lsat
    )

    res.status(500)
    return failure(res, 'Could not pay for lsat')
  }

  if (!preimage) {
    res.status(400)
    return failure(res, 'invoice could not be paid')
  }

  try {
    lsat.setPreimage(preimage)

    await models.Lsat.create({
      macaroon,
      identifier,
      paymentRequest,
      preimage,
      issuer,
      paths,
      metadata,
      tenant,
    })

    return success(res, { lsat: lsat.toToken() })
  } catch (e) {
    return failure(res, `failed to save lsat: ${e.message || e}`)
  }
}

export async function getLsat(
  req: RelayRequest,
  res: Response
): Promise<void | Response> {
  const tenant = req.owner.id
  const identifier = req.params.identifier
  const issuer = req.params.issuer
  const paths = req.params.paths

  let errorResponse = `LSAT with identifier ${identifier} not found`
  let whereEquals: { identifier?: string; issuer?: string; paths?: string } = {
    identifier,
  }
  if (!identifier) {
    errorResponse = `LSAT with issuer ${issuer} and path ${paths} not found`
    whereEquals = { issuer: issuer, paths: paths }
  }
  sphinxLogger.info(`=> getLsat`, logging.Express)

  try {
    const lsat: LsatResponse = await models.Lsat.findOne({
      where: {
        tenant,
        [Op.or]: [whereEquals],
      },
      attributes: lsatResponseAttributes,
    })
    if (!lsat)
      return res.status(404).json({
        success: false,
        error: errorResponse,
      })
    return success(res, { lsat })
  } catch (e) {
    return failure(res, errorResponse)
  }
}

export async function listLsats(
  req: RelayRequest,
  res: Response
): Promise<void | Response> {
  const tenant = req.owner.id

  sphinxLogger.info(`=> listLsats`, logging.Express)
  try {
    const lsats: LsatResponse[] = await models.Lsat.findAll({
      where: { tenant },
      attributes: lsatResponseAttributes,
    })
    return success(res, { lsats })
  } catch (e) {
    return failure(res, `could not retrieve lsats`)
  }
}

export async function updateLsat(
  req: RelayRequest,
  res: Response
): Promise<void | Response> {
  const tenant = req.owner.id
  const identifier = req.params.identifier
  const body = req.body
  sphinxLogger.info(`=> updateLsat ${identifier}`, logging.Express)
  try {
    await models.Lsat.update(body, {
      where: { tenant, identifier },
    })
    return success(res, 'lsat successfully updated')
  } catch (e) {
    return failure(res, `could not update lsat: ${e.message}`)
  }
}

export async function deleteLsat(
  req: RelayRequest,
  res: Response
): Promise<void | Response> {
  const tenant = req.owner.id
  const identifier = req.params.identifier
  sphinxLogger.info(`=> deleteLsat ${identifier}`, logging.Express)
  try {
    await models.Lsat.destroy({
      where: { tenant, identifier },
    })
    return success(res, 'lsat successfully deleted')
  } catch (e) {
    return failure(res, `could not delete lsat`)
  }
}
