import '@unique-nft/types/augment-api'

import {ISigner, SubOrEthAddress, SubstrateAddress, ApiPromise} from "../types";
import {getPolkadotApi, uniqueRpcDefinitions} from "../libs";
import {utils} from "../utils";
import {ExtrinsicTransferCoins, ExtrinsicTransferCoinsParams} from "./extrinsics/common/ExtrinsicTransferCoins";
import {TransactionFromRawTx, TransactionOptions} from "./Transaction";
import {Coin} from "../coin";
import {
  ExtrinsicCreateCollection,
  ExtrinsicCreateCollectionParams
} from "./extrinsics/unique/ExtrinsicCreateCollection";
import {SubmittableExtrinsic} from "@polkadot/api/promise/types";


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

    return this
  }

  async disconnect() {
    await this.#api?.disconnect()
    return this
  }



  getApi() {
    return this.#api
  }

  get isConnected(): boolean {
    return this.#api?.isConnected || false
  }

  transferCoins(params: ExtrinsicTransferCoinsParams, options?: TransactionOptions) {
    return new ExtrinsicTransferCoins(this.#apiSafe, params, options)
  }

  createCollection(params: ExtrinsicCreateCollectionParams, options?: TransactionOptions) {
    return new ExtrinsicCreateCollection(this.#apiSafe, params, options)
  }

  createTransactionFromRawTx(tx: SubmittableExtrinsic, options?: TransactionOptions) {
    return new TransactionFromRawTx(this.#apiSafe, tx, options)
  }

  getBalance = async (address: string): Promise<bigint> => {
    const substrateAddress = utils.address.addressToAsIsOrSubstrateMirror(address)

    const result = await this.#apiSafe.query.system.account(substrateAddress)
    try {
      return BigInt((result as any).data.free.toString())
    } catch(err) {
      throw new Error(`Cannot cast account result to free balance`)
    }
  }

  getChainProperties = async () => {
    const result = (await this.#apiSafe.rpc.system.properties()).toHuman()
    return result
  }
}
