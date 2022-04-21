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
const ava_1 = require("ava");
const msg_1 = require("../utils/msg");
const nodes_1 = require("../nodes");
const save_1 = require("../utils/save");
ava_1.default.serial('ampMessage: send more sats than one channel can handle to test AMP', (t) => __awaiter(void 0, void 0, void 0, function* () {
    t.true(Array.isArray(nodes_1.default));
    yield ampMessage(t, nodes_1.default);
}));
function ampMessage(t, nodes) {
    return __awaiter(this, void 0, void 0, function* () {
        //TWO NODES SEND PAYMENTS TO EACH OTHER IN A CHAT USING AMP ===>
        //Alice and Bob both keysend and amp enabled
        //Carol only keysend enabled
        //Test that we can send a payment with an amount larger than largest channel size
        //from Alice -> Bob and using Carol as liquidity as the second shard of the amp payment
        //Alice -> 1.5mil sats -> Bob (since Alice has two channels with 1 mil each)
        {
            const node1 = nodes[0];
            const node2 = nodes[1];
            console.log(`amp payment from ${node1.alias} to ${node2.alias}`);
            console.log('adding contact');
            const added = yield (0, save_1.addContact)(t, node1, node2);
            t.true(added, 'n1 should add n2 as contact');
            console.log('contact added');
            console.log(`sending payment ${node1.alias} -> ${node2.alias}`);
            //NODE1 SENDS PAYMENT TO NODE2
            const amount = 1500000;
            const paymentText = 'AMP test 1';
            const payment = yield (0, msg_1.sendPayment)(t, node1, node2, amount, paymentText);
            console.log(payment);
            t.true(payment, 'payment should be sent');
            console.log(`payment sent ${node1.alias} -> ${node2.alias}`);
        }
        //Test that Carol still can receive keysends
        {
            const node1 = nodes[1];
            const node2 = nodes[2];
            console.log(`amp payment from ${node1.alias} to ${node2.alias}`);
            console.log('adding contact');
            const added = yield (0, save_1.addContact)(t, node1, node2);
            t.true(added, 'n1 should add n2 as contact');
            console.log('contact added');
            console.log(`sending payment ${node1.alias} -> ${node2.alias}`);
            //NODE1 SENDS PAYMENT TO NODE2
            const amount = 100000;
            const paymentText = 'AMP test 2';
            const payment = yield (0, msg_1.sendPayment)(t, node1, node2, amount, paymentText);
            console.log(payment);
            t.true(payment, 'payment should be sent');
            console.log(`payment sent ${node1.alias} -> ${node2.alias}`);
        }
        //Test that Carol with only keysend enabled can send to amp node (Alice)
        {
            const node1 = nodes[2];
            const node2 = nodes[0];
            console.log(`amp payment from ${node1.alias} to ${node2.alias}`);
            console.log('adding contact');
            const added = yield (0, save_1.addContact)(t, node1, node2);
            t.true(added, 'n1 should add n2 as contact');
            console.log('contact added');
            console.log(`sending payment ${node1.alias} -> ${node2.alias}`);
            //NODE1 SENDS PAYMENT TO NODE2
            const amount = 1500000;
            const paymentText = 'AMP test 3';
            const payment = yield (0, msg_1.sendPayment)(t, node1, node2, amount, paymentText);
            console.log(payment);
            t.true(payment, 'payment should be sent');
            console.log(`payment sent ${node1.alias} -> ${node2.alias}`);
        }
    });
}
module.exports = ampMessage;
//# sourceMappingURL=ampMessage.test.js.map