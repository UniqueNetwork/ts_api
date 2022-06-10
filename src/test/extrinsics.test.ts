import {expect, test, beforeAll, suite, describe} from 'vitest'
import * as dotenv from 'dotenv'
import fs from 'fs'

declare module 'vitest' {
  export interface Suite {
    chain: SubstrateUnique
    keyring1: KeyringPair
    keyring2: KeyringPair
    keyringAlice: KeyringPair
    keyringBob: KeyringPair
  }
}

import {init, SubstrateUnique, Substrate, KeyringPair} from "../index";

beforeAll(async (context) => {
  const config = dotenv.parse(fs.readFileSync('./src/test/.test.env').toString('utf8'))

  await init()
  const chain = new Substrate.Unique()
  await chain.connect(config.NODE_SUB)

  context.chain = chain

  context.keyring1 = Substrate.signer.keyringFromSeed(config.SUB_SEED_1)
  context.keyring2 = Substrate.signer.keyringFromSeed(config.SUB_SEED_2)
  context.keyringAlice = Substrate.signer.keyringFromSeed(config.SUB_SEED_ALICE)
  context.keyringBob = Substrate.signer.keyringFromSeed(config.SUB_SEED_BOB)
})

suite('extrinsics', async () => {
  test('isConnected', async (ctx) => {
    const {chain} = ctx.meta.suite.file!
    expect(chain.isConnected).toBe(true)
  })

  test('transfer tokens', async (ctx) => {
    const {chain, keyring1, keyringAlice} = ctx.meta.suite.file!

    const threshold = chain.coin.coinsToWei(`1000`) // 1000 QTZ

    const balanceBefore = await chain.getBalance(keyring1.address)
    const toSend = (balanceBefore < threshold) ? threshold : 1n

    //sends `toSend` from Alice to keyring1
    await chain.transferCoins({toAddress: keyring1.address, amountInWei: toSend})
      .signAndSend(keyringAlice)

    const balanceAfter = await chain.getBalance(keyring1.address)

    expect(balanceAfter - balanceBefore).toBe(toSend)
  })
})

suite('Add & remove collection Admin tests', async () => {
  test('Add & remove collection admin', async (ctx) => {
    const {chain, keyring1, keyring2} = ctx.meta.suite.file!

    const createCollectionResult = await chain.createCollection({ collection: { name: 'test-name', description: 'test-descr', tokenPrefix: '0xff' }})
      .signAndSend(keyring1)

    const collectionId = createCollectionResult.collectionId;

    const addCollectionAdminResult = await chain.addCollectionAdmin({ collectionId: collectionId, newAdminAddress: keyring2.address})
      .signAndSend(keyring1)

    expect(addCollectionAdminResult.isSuccess).toBe(true)

    const removeCollectionAdminResult = await chain.removeCollectionAdmin({collectionId: collectionId, AdminAddress: keyring2.address})
      .signAndSend(keyring1)

    expect(removeCollectionAdminResult.isSuccess).toBe(true)
  })

  test('[Negative test] add collection admin by not an owner', async (ctx) => {
    const {chain, keyring1, keyring2} = ctx.meta.suite.file!

    const createCollectionResult = await chain.createCollection({ collection: { name: 'test-name', description: 'test-descr', tokenPrefix: '0xff' }})
      .signAndSend(keyring1)

    const collectionId = createCollectionResult.collectionId;

    await expect(chain.addCollectionAdmin({ collectionId: collectionId, newAdminAddress: keyring2.address})
      .signAndSend(keyring2))
      .rejects
      .toThrow(/common.NoPermission/)
  })

  test('[Negative test] Removing collection admin by non admin user', async (ctx) => {
    const {chain, keyring1, keyring2, keyringBob} = ctx.meta.suite.file!

    const createCollectionResult = await chain.createCollection({ collection: { name: 'test-name', description: 'test-descr', tokenPrefix: '0xff' }})
      .signAndSend(keyring1)

    const collectionId = createCollectionResult.collectionId;

    const addCollectionAdminResult = await chain.addCollectionAdmin({ collectionId: collectionId, newAdminAddress: keyring2.address})
      .signAndSend(keyring1)

    expect(addCollectionAdminResult.isSuccess).toBe(true)

    await expect(chain.removeCollectionAdmin({ collectionId: collectionId, AdminAddress: keyring2.address})
      .signAndSend(keyringBob))
      .rejects
      .toThrow(/common.NoPermission/)
  })
})
