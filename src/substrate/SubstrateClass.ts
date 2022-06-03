import {ISigner, SubOrEthAddress, SubstrateAddress, ApiPromise} from "../types";
import {getPolkadotApi, uniqueRpcDefinitions} from "../libs";
import {utils} from "../utils";
import {ExtrinsicTransferCoins, ExtrinsicTransferCoinsParams} from "./extrinsics/common/ExtrinsicTransferCoins";
import {TransactionProcessorOptions} from "./TransactionProcessor";


const normalizeSubstrate = utils.address.normalizeSubstrateAddress


export interface ConnectToSubstrateOptions {
  dontAwaitApiIsReady?: boolean
}

export class Substrate {
  #api: ApiPromise | undefined

  get #apiSafe() {
    if (!this.#api || !this.#api.isConnected) {
      throw new Error(`Not connected to the WS RPC. Please call 'connect' method first.`)
    }
    return this.#api
  }

  async connect(wsEndpoint: string, options?: ConnectToSubstrateOptions) {
    try {
      new URL(wsEndpoint) // just to test it in a quick way
    } catch {
      throw new Error(`Invalid WS RPC URL: ${wsEndpoint}`)
    }

    const polkadotApi = getPolkadotApi()

    this.#api = new polkadotApi.ApiPromise({
      provider: new polkadotApi.WsProvider(wsEndpoint),
      rpc: {
        unique: uniqueRpcDefinitions.rpc
      },
    })

    if (!options?.dontAwaitApiIsReady) {
      await this.#api.isReady
    }
  }

  async disconnect() {
    await this.#api?.disconnect()
  }



  getApi() {
    return this.#api
  }

  get isConnected(): boolean {
    return this.#api?.isConnected || false
  }

  transferCoins(params: ExtrinsicTransferCoinsParams, options?: TransactionProcessorOptions) {
    return new ExtrinsicTransferCoins(this.#apiSafe, params, options)
  }

  getChainProperties = async () => {
    const result = (await this.#apiSafe.rpc.system.properties()).toHuman()
    return result
  }
}
