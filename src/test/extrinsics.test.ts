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
