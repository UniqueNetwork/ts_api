import '@unique-nft/types/augment-api'
import {getPolkadotApi, uniqueRpcDefinitions} from './libs'

export interface ConnectToSubstrateOptions {
  dontAwaitApiIsReady?: boolean
}

export const connectToSubstrate = async (wsEndpoint: string, options: ConnectToSubstrateOptions = {}) => {
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
