// @ts-nocheck

import 'websocket-polyfill'
import * as Sphinx from 'sphinx-bot'
import { finalAction } from '../controllers/botapi'
import { models } from '../models'
import constants from '../constants'
import { getTribeOwnersChatByUUID } from '../utils/tribes'
import { sphinxLogger } from '../utils/logger'
import * as secp256k1 from 'secp256k1'
import * as crypto from 'crypto'
import {
  relayInit,
  generatePrivateKey,
  getPublicKey,
  getEventHash,
  signEvent,
} from 'nostr-tools'

const { RelayPool } = require('nostr')

const msg_types = Sphinx.MSG_TYPE

let initted = false

export function init() {
  if (initted) return
  initted = true

  const client = new Sphinx.Client()
  client.login('_', finalAction)

  //TODO: build NOSTR relay event
  const privateKey =
    'nsec16edq3d340n7kh0wfjypsy0yu6s22k004grhmgy326z2ufk88kafqh4ghqw'
  const jb55 =
    '252e08a0151b33451435b1d41075e821e05550c0d50e7a334b76844235294667'
  const damus = 'wss://relay.damus.io'
  const scsi = 'wss://nostr-pub.wellorder.net'
  const relays = [damus, scsi]

  const pool = RelayPool(relays)

  pool.on('open', (relay) => {
    relay.subscribe('djlksafhjkdslajkdfhjksajk', {
      limit: 10,
      authors: [jb55],
    })
  })

  pool.on('eose', (relay) => {
    relay.close()
  })

  pool.on('event', (relay, sub_id, ev) => {
    console.log('Event happend', ev)
    /*
    const nostrBot = await models.ChatBot.findOne({
      where: {
        chatId: chat.id,
        botPrefix: '/nostr',
        botType: constants.bot_types.builtin,
        tenant: chat.tenant,
      },
    })

    if (!nostrBot) return
    let nostrBotMessage = ev.content
    if (nostrBot && nostrBot.meta) {
      nostrBotMessage = nostrBot.meta
    }
    const resEmbed = new Sphinx.MessageEmbed()
      .setAuthor('NostrBot')
      .setDescription(nostrBotMessage)
    setTimeout(() => {
      message.channel.send({ embed: resEmbed })
    }, 2500)
									*/
  })

  client.on(msg_types.MESSAGE, async (message: Sphinx.Message) => {
    const isNormalMessage = message.type === constants.message_types.message
    const messageText = message && message.content

    // Return if its anything besides a regular message type
    if (!isNormalMessage) return

    try {
      const chat = await getTribeOwnersChatByUUID(message.channel.id)

      if (!(chat && chat.id)) return sphinxLogger.error(`=> nostrBot no chat`)
      const nostrBot = await models.ChatBot.findOne({
        where: {
          chatId: chat.id,
          botPrefix: '/nostr',
          botType: constants.bot_types.builtin,
          tenant: chat.tenant,
        },
      })

      if (!nostrBot) return
      let nostrBotMessage = 'sending nostr message'
      if (nostrBot && nostrBot.meta) {
        nostrBotMessage = nostrBot.meta
      }
      const resEmbed = new Sphinx.MessageEmbed()
        .setAuthor('NostrBot')
        .setDescription(nostrBotMessage)
      setTimeout(() => {
        message.channel.send({ embed: resEmbed })
      }, 2500)

      //TODO: send NOSTR relay event
      // We need id to be generated
      /* We
						 *{
  "id": <32-bytes sha256 of the the serialized event data>
  "pubkey": <32-bytes hex-encoded public key of the event creator>,
  "created_at": <unix timestamp in seconds>,
  "kind": <integer>,
  "tags": [
    ["e", <32-bytes hex of the id of another event>, <recommended relay URL>],
    ["p", <32-bytes hex of the key>, <recommended relay URL>],
    ... // other kinds of tags may be included later
  ],
  "content": <arbitrary string>,
  "sig": <64-bytes signature of the sha256 hash of the serialized event data, which is the same as the "id" field>
}
						*/
      //

      /*
      console.log('Building nostr object: ')
      const currentTime = Date.now()
      const serializedEventData = [
        0,
        '252e08a0151b33451435b1d41075e821e05550c0d50e7a334b76844235294667',
        currentTime,
        1,
        [],
        messageText,
      ]
      const bufferSerializedEventData = Buffer.from(serializedEventData)

      console.log('Creating id')
      const id = crypto
        .createHash('sha256')
        .update(bufferSerializedEventData)
        .digest('base64')

      console.log('ID: ', typeof id, id)
      const bufferId = Buffer.from(id, 'utf-8')

      console.log('Type of bufferId: ', typeof bufferId, bufferId)
      const sig = secp256k1.sign(id, privateKey)
      console.log('signed message: Sig: ', sig)
      let nostrObject = {
        id: id,
        pubkey:
          '252e08a0151b33451435b1d41075e821e05550c0d50e7a334b76844235294667',
        created_at: currentTime,
        kind: 1,
        tags: [],
        content: messageText,
        sig: sig,
      }
      console.log('nostr object: ', nostrObject)
			*/

      await sendEvent()
      let nostrBotMessageFinal = 'finished sending nostr message'
      if (nostrBot && nostrBot.meta) {
        nostrBotMessageFinal = nostrBot.meta
      }
      const resEmbedFinal = new Sphinx.MessageEmbed()
        .setAuthor('NostrBot')
        .setDescription(nostrBotMessageFinal)
      setTimeout(() => {
        message.channel.send({ embed: resEmbedFinal })
      }, 2500)
      return
    } catch (e) {
      sphinxLogger.error(`NOSTR BOT ERROR ${e}`)
    }

    //Admin commands
    /*
    const isAdmin = message.member.roles.find((role) => role.name === 'Admin')
    if (!isAdmin) return

    switch (cmd) {
      case 'setmessage':
        if (arr.length < 3) return
        sphinxLogger.info(`setmsg ${arr[2]}`)
        const chat = await getTribeOwnersChatByUUID(message.channel.id)
        if (!(chat && chat.id))
          return sphinxLogger.error(`=> welcomebot no chat`)
        const chatBot = await models.ChatBot.findOne({
          where: {
            chatId: chat.id,
            botPrefix: '/welcome',
            botType: constants.bot_types.builtin,
            tenant: chat.tenant,
          },
        })
        if (!chatBot) return
        const meta = arr.slice(2, arr.length).join(' ')
        await chatBot.update({ meta })
        const resEmbed = new Sphinx.MessageEmbed()
          .setAuthor('WelcomeBot')
          .setDescription('Your welcome message has been updated')
        message.channel.send({ embed: resEmbed })
        return

      default:
        const embed = new Sphinx.MessageEmbed()
          .setAuthor('WelcomeBot')
          .setTitle('Bot Commands:')
          .addFields([
            {
              name: 'Set welcome message',
              value: '/welcome setmessage {MESSAGE}',
            },
            { name: 'Help', value: '/welcome help' },
          ])
          .setThumbnail(botSVG)
        message.channel.send({ embed })
        return
    }
		*/
  })
}

async function sendEvent() {
  try {
    console.log('Calling sendEvent')
    /*const pk =
      '252e08a0151b33451435b1d41075e821e05550c0d50e7a334b76844235294667'
    const sk = 'nsec16edq3d340n7kh0wfjypsy0yu6s22k004grhmgy326z2ufk88kafqh4ghqw'
		*/
    let sk = generatePrivateKey()
    let pk = getPublicKey(sk)
    console.log('Calling sendEvent', pk, '----', sk)
    const relay = relayInit('wss://nostr.bitcoiner.social')
    console.log('Calling sendEvent')
    await relay.connect()
    console.log('Calling sendEvent')

    relay.on('connect', () => {
      console.log(`connected to ${relay.url}`)
    })
    console.log('Calling sendEvent')
    relay.on('error', () => {
      console.log(`failed to connect to ${relay.url}`)
    })
    console.log('Calling sendEvent')

    let event: any = {
      kind: 1,
      pubkey: pk,
      created_at: Math.floor(Date.now() / 1000),
      tags: [],
      content: 'hello world',
    }
    console.log('Calling sendEvent')
    event.id = getEventHash(event)
    console.log('Calling sendEvent')
    event.sig = signEvent(event, sk)

    let pub = relay.publish(event)
    console.log('Calling sendEvent')
    pub.on('ok', () => {
      console.log(`${relay.url} has accepted our event`)
    })
    console.log('Calling sendEvent')
    pub.on('seen', () => {
      console.log(`we saw the event on ${relay.url}`)
    })
    console.log('Calling sendEvent')
    pub.on('failed', (reason) => {
      console.log(`failed to publish to ${relay.url}: ${reason}`)
    })

    console.log('Calling sendEvent')
    await relay.close()
  } catch (e) {
    console.log('sendEventError: ', e)
  }
}

const botSVG = `<svg viewBox="64 64 896 896" height="12" width="12" fill="white">
  <path d="M300 328a60 60 0 10120 0 60 60 0 10-120 0zM852 64H172c-17.7 0-32 14.3-32 32v660c0 17.7 14.3 32 32 32h680c17.7 0 32-14.3 32-32V96c0-17.7-14.3-32-32-32zm-32 660H204V128h616v596zM604 328a60 60 0 10120 0 60 60 0 10-120 0zm250.2 556H169.8c-16.5 0-29.8 14.3-29.8 32v36c0 4.4 3.3 8 7.4 8h729.1c4.1 0 7.4-3.6 7.4-8v-36c.1-17.7-13.2-32-29.7-32zM664 508H360c-4.4 0-8 3.6-8 8v60c0 4.4 3.6 8 8 8h304c4.4 0 8-3.6 8-8v-60c0-4.4-3.6-8-8-8z" />
</svg>`
