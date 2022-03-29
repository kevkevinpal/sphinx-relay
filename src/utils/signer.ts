import * as grpc from 'grpc'
import * as Lightning from '../grpc/lightning'
import * as ByteBuffer from 'bytebuffer'
import { loadConfig } from './config'
import { sphinxLogger } from './logger'

// var protoLoader = require('@grpc/proto-loader')
const config = loadConfig()
const LND_IP = config.lnd_ip || 'localhost'

let signerClient = <any>null

export const loadSigner = () => {
  if (signerClient) {
    return signerClient
  } else {
    try {
      const credentials = Lightning.loadCredentials('signer.macaroon')
      const lnrpcDescriptor = grpc.load('proto/signer.proto')
      const signer: any = lnrpcDescriptor.signrpc
      signerClient = new signer.Signer(
        LND_IP + ':' + config.lnd_port,
        credentials
      )
      return signerClient
    } catch (e) {
      //only throw here
      sphinxLogger.warning('loadSigner has failed')
      throw e
    }
  }
}

export const signMessage = (msg) => {
  return new Promise(async (resolve, reject) => {
    const signer = await loadSigner()
    try {
      const options = {
        msg: ByteBuffer.fromHex(msg),
        key_loc: { key_family: 6, key_index: 0 },
      }
      signer.signMessage(options, function (err, sig) {
        if (err || !sig.signature) {
          reject(err)
        } else {
          const buf = ByteBuffer.wrap(sig.signature)
          resolve(buf.toBase64())
        }
      })
    } catch (e) {
      reject(e)
    }
  })
}

export const signBuffer = (msg) => {
  return new Promise(async (resolve, reject) => {
    const signer = await loadSigner()
    try {
      const options = { msg }
      signer.signMessage(options, function (err, sig) {
        if (err || !sig.signature) {
          reject(err)
        } else {
          const buf = ByteBuffer.wrap(sig.signature)
          resolve(buf.toBase64())
        }
      })
    } catch (e) {
      reject(e)
    }
  })
}

function verifyMessage(msg, sig, pubkey): Promise<{ [k: string]: any }> {
  return new Promise(async (resolve, reject) => {
    const signer = await loadSigner()
    if (msg.length === 0) {
      return reject('invalid msg')
    }
    if (sig.length !== 96) {
      return reject('invalid sig')
    }
    if (pubkey.length !== 66) {
      return reject('invalid pubkey')
    }
    try {
      const options = {
        msg: ByteBuffer.fromHex(msg),
        signature: ByteBuffer.fromBase64(sig),
        pubkey: ByteBuffer.fromHex(pubkey),
      }
      signer.verifyMessage(options, function (err, res) {
        if (err) {
          reject(err)
        } else {
          resolve(res)
        }
      })
    } catch (e) {
      reject(e)
    }
  })
}

export async function signAscii(ascii) {
  try {
    const sig = await signMessage(ascii_to_hexa(ascii))
    return sig
  } catch (e) {
    sphinxLogger.warning('signAscii has failed')
    throw e
  }
}

export async function verifyAscii(
  ascii: string,
  sig: Buffer,
  pubkey: string
): Promise<{ [k: string]: any }> {
  try {
    const r = await verifyMessage(ascii_to_hexa(ascii), sig, pubkey)
    return r
  } catch (e) {
    sphinxLogger.warning('verifyAscii has failed')
    throw e
  }
}

function ascii_to_hexa(str) {
  const arr1 = <string[]>[]
  for (let n = 0, l = str.length; n < l; n++) {
    const hex = Number(str.charCodeAt(n)).toString(16)
    arr1.push(hex)
  }
  return arr1.join('')
}
