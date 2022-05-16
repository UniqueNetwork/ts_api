import '@unique-nft/types/augment-api'

import type Web3ClassType from "web3";
import type PolkadotApiObjType from '@polkadot/api'
import type PolkadotUtilCryptoObjType from '@polkadot/util-crypto'
import type PolkadotExtensionDappType from '@polkadot/extension-dapp'
import {unique as uniqueRpcDefinitions} from '@unique-nft/types/definitions'
import {getKeys} from "./util";

type Web3Type = typeof Web3ClassType
type PolkadotApi = typeof PolkadotApiObjType
type PolkadotUtilCrypto = typeof PolkadotUtilCryptoObjType
type PolkadotExtensionDapp = typeof PolkadotExtensionDappType

export {uniqueRpcDefinitions}

let Web3: Web3Type | null = null

interface PolkadotLibs {
  api: PolkadotApi | null
  utilCrypto: PolkadotUtilCrypto | null
  extensionDapp: PolkadotExtensionDapp | null
}

const polkadotLibs: PolkadotLibs = {
  api: null,
  utilCrypto: null,
  extensionDapp: null,
}

export interface InitOptions {
  initPolkadotLibs?: { [k in keyof PolkadotLibs]?: boolean }
}

const defaultInitOptions: InitOptions = {}

type Web3Imported = {default: Web3Type} | Web3Type

export async function initWithWeb3(Web3Promise: Promise<Web3Imported> | Web3Imported | null, options: InitOptions = defaultInitOptions) {
  const inNode = typeof window === 'undefined'

  const libRequest = options.initPolkadotLibs

  const tmpPolkadotLibs: PolkadotLibs = getKeys(polkadotLibs)
    .reduce((acc, key) => {
      acc[key] = null;
      return acc;
    }, {} as PolkadotLibs)

  let tmpWeb3: Web3Imported | null = null

  ;[tmpWeb3, tmpPolkadotLibs.api, tmpPolkadotLibs.utilCrypto, tmpPolkadotLibs.extensionDapp] = await Promise.all([
    !Web3Promise ? null : await Web3Promise,
    libRequest && !libRequest?.api ? null : import('@polkadot/api'),
    libRequest && !libRequest?.utilCrypto ? null : import('@polkadot/util-crypto'),
    inNode || (libRequest && !libRequest?.api) ? null : import('@polkadot/extension-dapp'),
  ])

  if (tmpWeb3) {
    //@ts-ignore
    globalThis.Web3 = Web3 = tmpWeb3.default ? tmpWeb3.default : tmpWeb3
  }

  for (const key of getKeys(tmpPolkadotLibs)) {
    //@ts-ignore
    if (tmpPolkadotLibs[key]) polkadotLibs[key] = tmpPolkadotLibs[key]
  }
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

export function getPolkadotApi() {
  return checkModuleExists(polkadotLibs.api, `@polkadot/api`)
}

export function getPolkadotUtilCrypto() {
  return checkModuleExists(polkadotLibs.utilCrypto, `@polkadot/util-crypto`)
}

export function getPolkadotExtensionDapp() {
  return checkModuleExists(polkadotLibs.extensionDapp, `@polkadot/extension-dapp`)
}
