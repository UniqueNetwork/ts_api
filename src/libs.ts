import type Web3ClassType from "web3";
type Web3Type = typeof Web3ClassType

import type PolkadotApiObjType from '@polkadot/api'
type PolkadotApi = typeof PolkadotApiObjType

import type PolkadotUtilCryptoObjType from '@polkadot/util-crypto'
type PolkadotUtilCrypto = typeof PolkadotUtilCryptoObjType

import {unique as uniqueRpcDefinitions} from '@unique-nft/types/definitions'
export {uniqueRpcDefinitions}

let Web3: Web3Type | null = null
let polkadotApi: PolkadotApi | null = null
let polkadotUtilCrypto: PolkadotUtilCrypto | null = null

export interface InitOptions{
  Web3?: Web3Type
  dontLoadPolkadotApi?: boolean
  dontLoadPolkadotUtilCrypto?: boolean
}

export async function init(options: InitOptions) {
  if (options.Web3) {
    Web3 = options.Web3
    globalThis.Web3 = options.Web3
  }

  const [tmpPolkadotApi, tmpPolkadotUtilCrypto] = await Promise.all([
    options.dontLoadPolkadotApi ? console.log('no api') : import('@polkadot/api'),
    options.dontLoadPolkadotUtilCrypto ? console.log('no util crypto') : import('@polkadot/util-crypto'),
  ])

  if (tmpPolkadotApi) polkadotApi = tmpPolkadotApi
  if (tmpPolkadotUtilCrypto) polkadotUtilCrypto = tmpPolkadotUtilCrypto
}

export function getWeb3(): Web3Type {
  if (!Web3 && !globalThis.Web3) {
    throw new Error('No Web3 found. Please pass Web3 to `init` or provide window.Web3.')
  } else {
    return Web3 ? Web3 : globalThis.Web3
  }
}

const checkModuleExists = <T>(moduleVar: T | null, moduleName: string): T => {
  if (!moduleVar) {
    throw new Error(`No ${moduleName} found. Please call \`init()\`.`);
  }
  return moduleVar
}

export function getPolkadotApi(): PolkadotApi {
  return checkModuleExists(polkadotApi, `@polkadot/api`)
}

export function getPolkadotUtilCrypto(): PolkadotUtilCrypto {
  return checkModuleExists(polkadotUtilCrypto, `@polkadot/util-crypto`)
}

export function checkLibs() {
  return {
    Web3: !!Web3,
    polkadotApi: !!polkadotApi,
    polkadotUtilCrypto: !!polkadotUtilCrypto,
    uniqueRpcDefinitions: !!uniqueRpcDefinitions,
  }
}

export function getLibs() {
  return {
    Web3: getWeb3(),
    polkadotApi: getPolkadotApi(),
    polkadotUtilCrypto: getPolkadotUtilCrypto(),
    uniqueRpcDefinitions
  }
}



const libs = new Proxy({}, {
  get(target, prop) {

  }
})
