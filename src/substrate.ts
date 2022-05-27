import '@unique-nft/types/augment-api'

import {getPolkadotApi, uniqueRpcDefinitions} from './libs'

import type {Address, EthereumAddress, PolkadotSigner, SubstrateAddress, SubOrEthAddressObj} from './types';
import type {ApiPromise} from '@polkadot/api'

export const addressToObject = ({address}: { address: Address | string }): SubOrEthAddressObj => {
  if (typeof address === 'string') {
    return [40, 42].includes(address.length)
      ? {Ethereum: address as EthereumAddress}
      : {Substrate: address as SubstrateAddress}
  }
  return address
}


export interface ConnectToSubstrateOptions {
  dontAwaitApiIsReady?: boolean
}

export const connectToSubstrate = async (wsEndpoint: string, options: ConnectToSubstrateOptions = {}): Promise<ApiPromise> => {
  const polkadotApi = getPolkadotApi()

  const api = new polkadotApi.ApiPromise({
    provider: new polkadotApi.WsProvider(wsEndpoint),
    rpc: {
      unique: uniqueRpcDefinitions.rpc
    }
  })

  if (!options.dontAwaitApiIsReady) {
    await api.isReady
  }

  return api
}

export const transferCoinsToSubstrate = async (api: ApiPromise, signer: PolkadotSigner, to: SubstrateAddress, amount: bigint) => {
  await api.tx.balances.transfer(to, amount)
}

export const transferToken = async (api: ApiPromise, signer: PolkadotSigner, to: SubstrateAddress, amount: bigint) => {
  await api.tx.balances.transfer(to, amount)
}

export const getChainProperties = async(api: ApiPromise) => {
  const result = (await api.rpc.system.properties()).toHuman()
  return result
}
