import test from 'ava'
import { deleteTribe, leaveTribe } from '../utils/del'
import { createTribe, joinTribe } from '../utils/save'
import { sendImage } from '../utils/msg'
import { greenSquare, blueSquare, pinkSquare } from '../configs/b64-images.js'

import nodes from '../nodes'

/*
npx ava test-11-tribe3Imgs.js --verbose --serial --timeout=2m
*/

test('test-11-tribe3Imgs: create tribe, two nodes join tribe, send images, 2 nodes leave tribe, delete tribe', async (t) => {
  await tribe3Imgs(t, nodes[0], nodes[1], nodes[2])
})

export async function tribe3Imgs(t, node1, node2, node3) {
  //TWO NODES SEND TEXT MESSAGES WITHIN A TRIBE ===>

  t.truthy(node3, 'this test requires three nodes')

  console.log(`${node1.alias} and ${node2.alias} and ${node3.alias}`)

  //NODE1 CREATES A TRIBE
  let tribe = await createTribe(t, node1)
  t.truthy(tribe, 'tribe should have been created by node1')

  //NODE2 JOINS TRIBE CREATED BY NODE1
  if (node1.routeHint) tribe.owner_route_hint = node1.routeHint
  let join = await joinTribe(t, node2, tribe)
  t.true(join, 'node2 should join tribe')

  //NODE3 JOINS TRIBE CREATED BY NODE1
  if (node1.routeHint) tribe.owner_route_hint = node1.routeHint
  let join2 = await joinTribe(t, node3, tribe)
  t.true(join2, 'node3 should join tribe')

  console.log('HERE 1')
  //NODE1 SEND IMAGE, DECRYPT BY NODE2
  const greenImage = greenSquare
  const greenImageSent = await sendImage(t, node1, node2, greenImage, tribe)
  t.true(greenImageSent, 'message should have been sent')

  console.log('HERE 1')
  //NODE1 SEND IMAGE, DECRYPT BY NODE3
  const greenImage2 = greenSquare
  const greenImageSent2 = await sendImage(t, node1, node3, greenImage2, tribe)
  t.true(greenImageSent2, 'message should have been sent')

  //NODE2 SENDS AN IMAGE, DECRYPT BY NODE1
  console.log('HERE 1')
  const pinkImage = pinkSquare
  const pinkImageSent = await sendImage(t, node2, node1, pinkImage, tribe)
  t.true(pinkImageSent, 'message should have been sent')

  console.log('last 1')
  //NODE2 SENDS AN IMAGE, DECRYPT BY NODE3
  const pinkImage2 = pinkSquare
  const pinkImageSent2 = await sendImage(t, node2, node3, pinkImage2, tribe)
  t.true(pinkImageSent2, 'message should have been sent')

  console.log('last 1')
  //NODE3 SENDS AN IMAGE, DECRYPT BY NODE1
  const blueImage = blueSquare
  const blueImageSent = await sendImage(t, node3, node1, blueImage, tribe)
  t.true(blueImageSent, 'message should have been sent')

  console.log('HERE 1')
  //NODE3 SENDS AN IMAGE, DECRYPT BY NODE2
  const blueImage2 = blueSquare
  const blueImageSent2 = await sendImage(t, node3, node2, blueImage2, tribe)
  t.true(blueImageSent2, 'message should have been sent')

  //NODE2 LEAVES THE TRIBE
  let n2left = await leaveTribe(t, node2, tribe)
  t.true(n2left, 'node2 should leave tribe')

  //NODE3 LEAVES THE TRIBE
  let n3left = await leaveTribe(t, node3, tribe)
  t.true(n3left, 'node3 should leave tribe')

  //NODE1 DELETES THE TRIBE
  let delTribe = await deleteTribe(t, node1, tribe)
  t.true(delTribe, 'node1 should delete tribe')
}
