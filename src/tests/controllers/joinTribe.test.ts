import test, { ExecutionContext } from 'ava'
import { randomText, iterate } from '../utils/helpers'
import nodes from '../nodes'
import { createTribe, joinTribe } from '../utils/save'
import { deleteTribe, leaveTribe } from '../utils/del'
import { sendTribeMessageAndCheckDecryption } from '../utils/msg'

/*
npx ava test-04-joinTribe.js --verbose --serial --timeout=2m
*/

interface Context {}

test.serial('checkContacts', async (t: ExecutionContext<Context>) => {
  t.true(Array.isArray(nodes))
  await iterate(nodes, async (node1, node2) => {
    await joinTribeTest(t, node1, node2)
  })
})

export async function joinTribeTest(t, node1, node2) {
  //TWO NODES SEND TEXT MESSAGES WITHIN A TRIBE ===>
  console.log(`${node1.alias} and ${node2.alias}`)

  //NODE1 CREATES A TRIBE
  let tribe = await createTribe(t, node1)
  t.truthy(tribe, 'tribe should have been created by node1')

  //NODE2 JOINS TRIBE CREATED BY NODE1
  if (node1.routeHint) tribe.owner_route_hint = node1.routeHint
  let join = await joinTribe(t, node2, tribe)
  t.true(join, 'node2 should join tribe')

  //NODE1 SENDS A TEXT MESSAGE IN TRIBE
  const text = randomText()
  let tribeMessage = await sendTribeMessageAndCheckDecryption(
    t,
    node1,
    node2,
    text,
    tribe
  )
  t.truthy(tribeMessage, 'node1 should send message to tribe')

  //NODE2 SENDS A TEXT MESSAGE IN TRIBE
  const text2 = randomText()
  let tribeMessage2 = await sendTribeMessageAndCheckDecryption(
    t,
    node2,
    node1,
    text2,
    tribe
  )
  t.truthy(tribeMessage2, 'node2 should send message to tribe')

  //NODE2 LEAVES THE TRIBE
  let left = await leaveTribe(t, node2, tribe)
  t.true(left, 'node2 should leave tribe')

  //NODE1 DELETES THE TRIBE
  let delTribe = await deleteTribe(t, node1, tribe)
  t.true(delTribe, 'node1 should delete tribe')
}
