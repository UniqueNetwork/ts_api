import {afterAll, beforeAll, expect, suite, test} from 'vitest'
import * as dotenv from 'dotenv'
import fs from 'fs'
import {init, KeyringPair, Substrate, SubstrateUnique} from "../index";
import { normalizeSubstrateAddress } from '../utils/addressUtils';

declare module 'vitest' {
  export interface Suite {
    chain: SubstrateUnique
    keyring1: KeyringPair
    keyring2: KeyringPair
    keyringAlice: KeyringPair
    keyringBob: KeyringPair
  }
}

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

afterAll(async (context) => {
  const {chain, keyring1, keyring2} = context
  const [balance1, balance2] = await Promise.all([
    chain.getBalance(keyring1.address),
    chain.getBalance(keyring2.address),
  ])
  console.log(`After all balance of ${keyring1.address} is ${chain.coin.formatFullLength(balance1)}`)
  console.log(`After all balance of ${keyring2.address} is ${chain.coin.formatFullLength(balance2)}`)
})


const transferCoins = async (chain: SubstrateUnique, from: KeyringPair, to: KeyringPair) => {
  const threshold = chain.coin.coinsToWei(`1000`) // 1000 QTZ

  const balanceBefore = await chain.getBalance(to.address)
  const toSend = (balanceBefore < threshold) ? threshold - balanceBefore : 1n

  console.log(
    `Transferring ${chain.coin.formatFullLength(toSend)} ` +
    `from ${from.address} to ${to.address}. ` +
    `Balance before is ${chain.coin.format(balanceBefore, chain.coin.decimals)}`
  )

  await chain
    .transferCoins({toAddress: to.address, amountInWei: toSend})
    .signAndSend(from)

  const balanceAfter = await chain.getBalance(to.address)
  console.log(
    `Balance of ${to.address} after is ` +
    chain.coin.format(balanceAfter, chain.coin.decimals)
  )

  expect(balanceAfter - balanceBefore).toBe(toSend)
}


suite('extrinsics', async () => {
  test('isConnected', async (ctx) => {
    const {chain} = ctx.meta.suite.file!
    expect(chain.isConnected).toBe(true)
  })

  test('transfer tokens', async (ctx) => {
    const {chain, keyring1, keyring2, keyringAlice, keyringBob} = ctx.meta.suite.file!

    await Promise.all([
      transferCoins(chain, keyringAlice, keyring1),
      transferCoins(chain, keyringBob, keyring2)
    ])
  })
})


suite('CollectionSponsor tests', async () => {
  test('Set sponsor for collection', async (ctx) => {
    const {chain, keyring1} = ctx.meta.suite.file!


    const createCollectionResult = await chain.createCollection({
      collection: {
        name: 'test-name',
        description: 'test-descr',
        tokenPrefix: '0xff'
      }
    })
      .signAndSend(keyring1)

    const setCollectionSponsorResult = await chain.setCollectionSponsor({
      collectionId: createCollectionResult.collectionId,
      newSponsorAddress: keyring1.address
    })
      .signAndSend(keyring1);

    expect(setCollectionSponsorResult.isSuccess).toBe(true);
  })

  test('Remove collection sponsor', async (ctx) => {
    const {chain, keyring1} = ctx.meta.suite.file!


    const createCollectionResult = await chain.createCollection({
      collection: {
        name: 'test-name',
        description: 'test-descr',
        tokenPrefix: '0xff'
      }
    })
      .signAndSend(keyring1)

    const setCollectionSponsorResult = await chain.setCollectionSponsor({
      collectionId: createCollectionResult.collectionId,
      newSponsorAddress: keyring1.address
    })
      .signAndSend(keyring1);

    expect(setCollectionSponsorResult.isSuccess).toBe(true);

    const removeCollectionSponsorResult = await chain.removeCollectionSponsor({
      collectionId: createCollectionResult.collectionId
    })
    .signAndSend(keyring1)

    expect(removeCollectionSponsorResult.isSuccess).toBe(true)
  })

  test('Confirm sponsorship', async (ctx) => {
    const {chain, keyring1, keyringBob} = ctx.meta.suite.file!

    const createCollectionResult = await chain.createCollection({
      collection: {
        name: 'test-name',
        description: 'test-descr',
        tokenPrefix: '0xff'
      }
    })
      .signAndSend(keyring1)

    const setCollectionSponsorResult = await chain.setCollectionSponsor({
      collectionId: createCollectionResult.collectionId,
      newSponsorAddress: keyringBob.address
    })
      .signAndSend(keyring1)

    expect(setCollectionSponsorResult.isSuccess).toBe(true)

    const confirmCollectionSponsorResult = await chain.confirmSponsorship({collectionId: createCollectionResult.collectionId})
      .signAndSend(keyringBob)

    expect(confirmCollectionSponsorResult.isSuccess).toBe(true)
  })

  test('[Negative test]: Confirm sponsorship by another user', async (ctx) => {
    const {chain, keyring1, keyringBob} = ctx.meta.suite.file!

    const createCollectionResult = await chain.createCollection({
      collection: {
        name: 'test-name',
        description: 'test-descr',
        tokenPrefix: '0xff'
      }
    })
      .signAndSend(keyring1)

    const setCollectionSponsorResult = await chain.setCollectionSponsor({
      collectionId: createCollectionResult.collectionId,
      newSponsorAddress: keyringBob.address
    })
      .signAndSend(keyring1)

    expect(setCollectionSponsorResult.isSuccess).toBe(true)

    await expect(chain.confirmSponsorship({collectionId: createCollectionResult.collectionId})
      .signAndSend(keyring1))
      .rejects
      .toThrow('unique.ConfirmUnsetSponsorFail')
  })
})


suite('Add & remove collection Admin tests', async () => {
  test('Add & remove collection admin', async (ctx) => {
    const {chain, keyring1, keyring2} = ctx.meta.suite.file!

    const createCollectionResult = await chain.createCollection({
      collection: {
        name: 'test-name',
        description: 'test-descr',
        tokenPrefix: '0xff'
      }
    })
      .signAndSend(keyring1)

    const collectionId = createCollectionResult.collectionId;

    const addCollectionAdminResult = await chain.addCollectionAdmin({
      collectionId: collectionId,
      newAdminAddress: keyring2.address
    })
      .signAndSend(keyring1)

    expect(addCollectionAdminResult.isSuccess).toBe(true)

    const removeCollectionAdminResult = await chain.removeCollectionAdmin({
      collectionId: collectionId,
      adminAddress: keyring2.address
    })
      .signAndSend(keyring1)

    expect(removeCollectionAdminResult.isSuccess).toBe(true)
  })

  test('[Negative test] add collection admin by not an owner', async (ctx) => {
    const {chain, keyring1, keyring2} = ctx.meta.suite.file!

    const createCollectionResult = await chain.createCollection({
      collection: {
        name: 'test-name',
        description: 'test-descr',
        tokenPrefix: '0xff'
      }
    })
      .signAndSend(keyring1)

    const collectionId = createCollectionResult.collectionId;

    await expect(chain.addCollectionAdmin({collectionId: collectionId, newAdminAddress: keyring2.address})
      .signAndSend(keyring2))
      .rejects
      .toThrow('common.NoPermission')
  })

  test('[Negative test] Removing collection admin by non admin user', async (ctx) => {
    const {chain, keyring1, keyring2, keyringBob} = ctx.meta.suite.file!

    const createCollectionResult = await chain.createCollection({
      collection: {
        name: 'test-name',
        description: 'test-descr',
        tokenPrefix: '0xff'
      }
    })
      .signAndSend(keyring1)

    const collectionId = createCollectionResult.collectionId;

    const addCollectionAdminResult = await chain.addCollectionAdmin({
      collectionId: collectionId,
      newAdminAddress: keyring2.address
    })
      .signAndSend(keyring1)

    expect(addCollectionAdminResult.isSuccess).toBe(true)

    await expect(chain.removeCollectionAdmin({collectionId: collectionId, adminAddress: keyring2.address})
      .signAndSend(keyringBob))
      .rejects
      .toThrow('common.NoPermission')
  })
})

suite('ChangeCollectionOwner tests', async () => {
  test('ChangeCollectionOwner', async (ctx) => {
    const {chain, keyring1, keyring2, keyringBob} = ctx.meta.suite.file!

    const createCollectionResult = await chain.createCollection({
      collection: {
        name: 'test-name',
        description: 'test-descr',
        tokenPrefix: '0xff'
      }
    })
      .signAndSend(keyring1)

    const collectionId = createCollectionResult.collectionId;

    const changeOwnerResult = await chain.changeCollectionOwner({
      collectionId: collectionId,
      newOwnerAddress: keyring2.address
    }).signAndSend(keyring1)

    expect(changeOwnerResult.isSuccess).toBe(true)

    //FIXME: change collectionById method asap
    const collection = await chain.getCollection(collectionId)
    expect(keyring2.address).toBe(normalizeSubstrateAddress(collection.owner.toString()))
  })
})

suite('Allow list tests', async () => {
  test('Add and remove in/from allow list', async (ctx) => {
    const {chain, keyring1, keyring2, keyringBob} = ctx.meta.suite.file!

    const createCollectionResult = await chain.createCollection({
      collection: {
        name: 'test-name',
        description: 'test-descr',
        tokenPrefix: '0xff'
      }
    })
      .signAndSend(keyring1)

    const addToAllowListResult = await chain.addToAllowList({
      collectionId: createCollectionResult.collectionId,
      address: keyring2.address
    })
      .signAndSend(keyring1)

    expect(addToAllowListResult.isSuccess).toBe(true)

    const removeFromAllowListResult = await chain.removeFromAllowList({
      collectionId: createCollectionResult.collectionId,
      address: keyring2.address
    })
      .signAndSend(keyring1)

    expect(removeFromAllowListResult.isSuccess).toBe(true)
  })
})



