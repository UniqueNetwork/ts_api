import '@unique-nft/types/augment-api'

import type * as PolkadotApiObjType from '@polkadot/api'
import type * as PolkadotKeyringObjType from '@polkadot/keyring'
import type * as PolkadotUtilCryptoObjType from '@polkadot/util-crypto'
import type * as PolkadotExtensionDappType from '@polkadot/extension-dapp'
import type * as EthersType from 'ethers'

import {unique as uniqueRpcDefinitions} from '@unique-nft/types/definitions'
import {getKeys} from './tsUtils'

type PolkadotApi = typeof PolkadotApiObjType
type PolkadotKeyring = typeof PolkadotKeyringObjType
type PolkadotUtilCrypto = typeof PolkadotUtilCryptoObjType
type PolkadotExtensionDapp = typeof PolkadotExtensionDappType
type Ethers = typeof EthersType

export {uniqueRpcDefinitions}

interface Libs {
  ethers: Ethers | null
  api: PolkadotApi | null
  keyring: PolkadotKeyring | null
  utilCrypto: PolkadotUtilCrypto | null
  extensionDapp: PolkadotExtensionDapp | null
}

const libs: Libs = {
  ethers: null,
  api: null,
  keyring: null,
  utilCrypto: null,
  extensionDapp: null,
}

export interface InitOptions {
  initLibs?: { [k in keyof Omit<Libs, 'ethers'>]: boolean }
  connectToPolkadotExtensionsAs?: string
}

const defaultInitOptions: InitOptions = {}

export async function init(options: InitOptions = defaultInitOptions) {
  const inBrowser = typeof window !== 'undefined'

  const libRequest = options.initLibs

  const tmpLibs: Libs = getKeys(libs)
    .reduce((acc, key) => {
      acc[key] = null;
      return acc;
    }, {} as Libs)

  ;[
    tmpLibs.ethers,
    tmpLibs.api,
    tmpLibs.keyring,
    tmpLibs.utilCrypto,
    tmpLibs.extensionDapp
  ] = await Promise.all([
    import('ethers'),
    libRequest && !libRequest?.api ? null : import('@polkadot/api'),
    libRequest && !libRequest?.keyring ? null : import('@polkadot/keyring'),
    libRequest && !libRequest?.utilCrypto ? null : import('@polkadot/util-crypto'),
    !inBrowser || (libRequest && !libRequest?.extensionDapp) ? null : import('@polkadot/extension-dapp'),
  ])

  // if (tmp) {
  //   //@ts-ignore
  //   globalThis.Web3 = Web3 = tmpWeb3.default ? tmpWeb3.default : tmpWeb3
  // }

  for (const key of getKeys(tmpLibs)) {
    //@ts-ignore
    if (tmpLibs[key]) libs[key] = tmpLibs[key]
  }

  if (libs.extensionDapp && options.connectToPolkadotExtensionsAs && libs.extensionDapp.isWeb3Injected) {
    await libs.extensionDapp.web3Enable(options.connectToPolkadotExtensionsAs)
  }
}


const checkModuleExists = <T>(moduleVar: T | null, moduleName: string): T => {
  if (!moduleVar) {
    throw new Error(`No ${moduleName} found. Please call \`init()\` first.`);
  }
  return moduleVar
}

export function getPolkadotApi() {
  return checkModuleExists(libs.api, `@polkadot/api`)
}

export function getEthers(): Ethers {
  return checkModuleExists(libs.ethers, `ethers`)
}

export function getPolkadotKeyring() {
  return checkModuleExists(libs.keyring, `@polkadot/keyring`)
}

export function getPolkadotUtilCrypto() {
  return checkModuleExists(libs.utilCrypto, `@polkadot/util-crypto`)
}

export function getPolkadotExtensionDapp() {
  return checkModuleExists(libs.extensionDapp, `@polkadot/extension-dapp`)
}
