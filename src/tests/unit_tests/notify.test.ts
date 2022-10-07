import { sendNotification } from '../../notify'
import {
  mockChat,
  mockName,
  mockNotificationType,
  mockContact,
} from './mockTypes'
import fetch from 'node-fetch'

jest.mock('node-fetch')
jest.mock('../../utils/config', () => {
  return {
    loadConfig: () => {
      return {
        logging_level: 1,
        logging: 'TRIBES,MEME,NOTIFICATION,EXPRESS,NETWORK,DB,PROXY,LSAT,BOTS',
        media_host: '',
      }
    },
  }
})

//const spy = jest.spyOn(sendNotification, 'message')
describe('tests for src/notify', () => {
  test('sendNotification', async () => {
    await sendNotification(
      mockChat,
      mockName,
      mockNotificationType,
      mockContact
    )
    await sleep(200)

    expect(fetch).toHaveBeenCalledTimes(1)
    //   expect(fetch).toHaveBeenCalledWith('', '', '', '')
  })
})

export async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
