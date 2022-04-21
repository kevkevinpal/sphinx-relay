import test, { ExecutionContext } from 'ava'
import { sendPayment } from '../utils/msg'
import nodes from '../nodes'
import { addContact } from '../utils/save'
import { NodeConfig } from '../types'

/*
 npx ava src/tests/controllers/ampMessage.test.ts --verbose --serial --timeout=2m
*/

interface Context {}

test.serial(
  'ampMessage: send more sats than one channel can handle to test AMP',
  async (t: ExecutionContext<Context>) => {
    t.true(Array.isArray(nodes))
    await ampMessage(t, nodes)
  }
)

async function ampMessage(t: ExecutionContext<Context>, nodes: NodeConfig[]) {
  //TWO NODES SEND PAYMENTS TO EACH OTHER IN A CHAT USING AMP ===>

  //Alice and Bob both keysend and amp enabled
  //Carol only keysend enabled

  //Test that we can send a payment with an amount larger than largest channel size
  //from Alice -> Bob and using Carol as liquidity as the second shard of the amp payment
  //Alice -> 1.5mil sats -> Bob (since Alice has two channels with 1 mil each)

  {
    const node1 = nodes[0]
    const node2 = nodes[1]

    console.log(`amp payment from ${node1.alias} to ${node2.alias}`)

    console.log('adding contact')
    const added = await addContact(t, node1, node2)
    t.true(added, 'n1 should add n2 as contact')
    console.log('contact added')

    console.log(`sending payment ${node1.alias} -> ${node2.alias}`)
    //NODE1 SENDS PAYMENT TO NODE2
    const amount = 1500000
    const paymentText = 'AMP test 1'
    const payment = await sendPayment(t, node1, node2, amount, paymentText)
    console.log(payment)
    t.true(payment, 'payment should be sent')
    console.log(`payment sent ${node1.alias} -> ${node2.alias}`)
  }

  //Test that Carol still can receive keysends

  {
    const node1 = nodes[1]
    const node2 = nodes[2]

    console.log(`amp payment from ${node1.alias} to ${node2.alias}`)

    console.log('adding contact')
    const added = await addContact(t, node1, node2)
    t.true(added, 'n1 should add n2 as contact')
    console.log('contact added')

    console.log(`sending payment ${node1.alias} -> ${node2.alias}`)
    //NODE1 SENDS PAYMENT TO NODE2
    const amount = 100000
    const paymentText = 'AMP test 2'
    const payment = await sendPayment(t, node1, node2, amount, paymentText)
    console.log(payment)
    t.true(payment, 'payment should be sent')
    console.log(`payment sent ${node1.alias} -> ${node2.alias}`)
  }

  //Test that Carol with only keysend enabled can send to amp node (Alice)

  {
    const node1 = nodes[2]
    const node2 = nodes[0]

    console.log(`amp payment from ${node1.alias} to ${node2.alias}`)

    console.log('adding contact')
    const added = await addContact(t, node1, node2)
    t.true(added, 'n1 should add n2 as contact')
    console.log('contact added')

    console.log(`sending payment ${node1.alias} -> ${node2.alias}`)
    //NODE1 SENDS PAYMENT TO NODE2
    const amount = 1500000
    const paymentText = 'AMP test 3'
    const payment = await sendPayment(t, node1, node2, amount, paymentText)
    console.log(payment)
    t.true(payment, 'payment should be sent')
    console.log(`payment sent ${node1.alias} -> ${node2.alias}`)
  }
}

module.exports = ampMessage
