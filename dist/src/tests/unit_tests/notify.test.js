"use strict";
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
exports.sleep = void 0;
const notify_1 = require("../../notify");
const mockTypes_1 = require("./mockTypes");
const node_fetch_1 = require("node-fetch");
jest.mock('node-fetch');
jest.mock('../../utils/config', () => {
    return {
        loadConfig: () => {
            return {
                logging_level: 1,
                logging: 'TRIBES,MEME,NOTIFICATION,EXPRESS,NETWORK,DB,PROXY,LSAT,BOTS',
                media_host: '',
            };
        },
    };
});
//const spy = jest.spyOn(sendNotification, 'message')
describe('tests for src/notify', () => {
    test('sendNotification', () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, notify_1.sendNotification)(mockTypes_1.mockChat, mockTypes_1.mockName, mockTypes_1.mockNotificationType, mockTypes_1.mockContact);
        yield sleep(200);
        expect(node_fetch_1.default).toHaveBeenCalledTimes(1);
        //   expect(fetch).toHaveBeenCalledWith('', '', '', '')
    }));
});
function sleep(ms) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve) => setTimeout(resolve, ms));
    });
}
exports.sleep = sleep;
//# sourceMappingURL=notify.test.js.map