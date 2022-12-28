"use strict";
// @ts-nocheck
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.init = void 0;
const Sphinx = require("sphinx-bot");
const botapi_1 = require("../controllers/botapi");
const models_1 = require("../models");
const constants_1 = require("../constants");
const tribes_1 = require("../utils/tribes");
const logger_1 = require("../utils/logger");
const { RelayPool } = require('nostr');
const msg_types = Sphinx.MSG_TYPE;
let initted = false;
function init() {
    if (initted)
        return;
    initted = true;
    const client = new Sphinx.Client();
    client.login('_', botapi_1.finalAction);
    //TODO: build NOSTR relay event
    const jb55 = 'npub1y5hq3gq4rve529p4k82pqa0gy8s925xq65885v6tw6zyydffgensnn9myy';
    const damus = 'wss://relay.damus.io';
    const scsi = 'wss://nostr-pub.wellorder.net';
    const relays = [damus, scsi];
    const pool = RelayPool(relays);
    pool.on('open', (relay) => {
        relay.subscribe('djlksafhjkdslajkdfhjksajk', {
            limit: 10,
            authors: [jb55],
        });
    });
    pool.on('eose', (relay) => {
        relay.close();
    });
    pool.on('event', (relay, sub_id, ev) => {
        console.log('Event happend', ev);
    });
    client.on(msg_types.MESSAGE, (message) => __awaiter(this, void 0, void 0, function* () {
        const isNormalMessage = message.type === constants_1.default.message_types.message;
        const messageText = message && message.content;
        // Return if its anything besides a regular message type
        if (!isNormalMessage)
            return;
        try {
            const chat = yield (0, tribes_1.getTribeOwnersChatByUUID)(message.channel.id);
            if (!(chat && chat.id))
                return logger_1.sphinxLogger.error(`=> nostrBot no chat`);
            const nostrBot = yield models_1.models.ChatBot.findOne({
                where: {
                    chatId: chat.id,
                    botPrefix: '/nostr',
                    botType: constants_1.default.bot_types.builtin,
                    tenant: chat.tenant,
                },
            });
            if (!nostrBot)
                return;
            let nostrBotMessage = 'sending nostr message';
            if (nostrBot && nostrBot.meta) {
                nostrBotMessage = nostrBot.meta;
            }
            const resEmbed = new Sphinx.MessageEmbed()
                .setAuthor('NostrBot')
                .setDescription(nostrBotMessage);
            setTimeout(() => {
                message.channel.send({ embed: resEmbed });
            }, 2500);
            //TODO: send NOSTR relay event
            let nostrBotMessageFinal = 'finished sending nostr message';
            if (nostrBot && nostrBot.meta) {
                nostrBotMessageFinal = nostrBot.meta;
            }
            const resEmbedFinal = new Sphinx.MessageEmbed()
                .setAuthor('NostrBot')
                .setDescription(nostrBotMessageFinal);
            setTimeout(() => {
                message.channel.send({ embed: resEmbedFinal });
            }, 2500);
            return;
        }
        catch (e) {
            logger_1.sphinxLogger.error(`NOSTR BOT ERROR ${e}`);
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
    }));
}
exports.init = init;
const botSVG = `<svg viewBox="64 64 896 896" height="12" width="12" fill="white">
  <path d="M300 328a60 60 0 10120 0 60 60 0 10-120 0zM852 64H172c-17.7 0-32 14.3-32 32v660c0 17.7 14.3 32 32 32h680c17.7 0 32-14.3 32-32V96c0-17.7-14.3-32-32-32zm-32 660H204V128h616v596zM604 328a60 60 0 10120 0 60 60 0 10-120 0zm250.2 556H169.8c-16.5 0-29.8 14.3-29.8 32v36c0 4.4 3.3 8 7.4 8h729.1c4.1 0 7.4-3.6 7.4-8v-36c.1-17.7-13.2-32-29.7-32zM664 508H360c-4.4 0-8 3.6-8 8v60c0 4.4 3.6 8 8 8h304c4.4 0 8-3.6 8-8v-60c0-4.4-3.6-8-8-8z" />
</svg>`;
//# sourceMappingURL=nostr.js.map