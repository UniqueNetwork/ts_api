import {expect, test, beforeAll, describe} from 'vitest'

// import nodetest from 'node:test'
// nodetest('test', (t) => {})

declare module 'vitest' {
  export interface Suite {
    // lib?: any
  }
}

import {libs, init} from "../../lib/bundle";

beforeAll(async(context) => {
  await init()
})

describe('init', function async (context) {
  test.concurrent('Ethers', () => {
    expect(libs.getEthers()).toBeTruthy()
  })
  test.concurrent('@polkadot libs', () => {
    expect(libs.getPolkadotApi()).toBeTruthy()
    expect(libs.getPolkadotUtilCrypto()).toBeTruthy()
    expect(libs.getPolkadotKeyring()).toBeTruthy()
  })
})
