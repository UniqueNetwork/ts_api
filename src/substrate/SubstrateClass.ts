import {ISigner, SubOrEthAddress, SubstrateAddress, ApiPromise} from "../types";
import {getPolkadotApi, uniqueRpcDefinitions} from "../libs";
import {utils} from "../utils";
import {ExtrinsicTransferCoins, ExtrinsicTransferCoinsParams} from "./extrinsics/common/ExtrinsicTransferCoins";
import {TransactionProcessorOptions} from "./TransactionProcessor";
import {Coin} from "../coin";


const normalizeSubstrate = utils.address.normalizeSubstrateAddress


export interface ConnectToSubstrateOptions {
  dontAwaitApiIsReady?: boolean
}

export class Substrate {
  #api: ApiPromise | undefined
  #ss58Prefix = 42
  #coin = Coin.createUnknown18DecimalsCoin()

  get #apiSafe() {
    if (!this.#api || !this.#api.isConnected) {
      throw new Error(`Not connected to the WS RPC. Please call 'connect' method first.`)
    }
    return this.#api
  }

  get ss58Prefix() {
    return this.#ss58Prefix
  }

  get coin() {
    return this.#coin
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

      this.#coin = new Coin({
        symbol: this.#api.registry.chainTokens[0],
        decimals: this.#api.registry.chainDecimals[0],
        weiSymbol: 'wei'
      })

      this.#ss58Prefix = this.#api.registry.chainSS58 || 42
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
