import '@unique-nft/types/augment-api'

import {ISigner, SubOrEthAddress, SubstrateAddress, ApiPromise} from "../types";
import {getPolkadotApi, uniqueRpcDefinitions} from "../libs";
import {utils} from "../utils";
import {ExtrinsicTransferCoins, ExtrinsicTransferCoinsParams} from "./extrinsics/common/ExtrinsicTransferCoins";
import {TransactionFromRawTx, ExtrinsicOptions} from "./extrinsics/AbstractExtrinsic";
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

export class SubstrateCommon {
  protected _api: ApiPromise | undefined
  protected _ss58Prefix = 42
  protected _coin = Coin.createUnknown18DecimalsCoin()

  protected get api() {
    if (!this._api || !this._api.isConnected) {
      throw new Error(`Not connected to the WS RPC. Please call 'connect' method first.`)
    }
    return this._api
  }

  get ss58Prefix() {
    return this._ss58Prefix
  }

  get coin() {
    return this._coin
  }


  async connect(wsEndpoint: string, options?: ConnectToSubstrateOptions) {
    try {
      new URL(wsEndpoint) // just to test it in a quick way
    } catch {
      throw new Error(`Invalid WS RPC URL: ${wsEndpoint}`)
    }

    const polkadotApi = getPolkadotApi()

    this._api = new polkadotApi.ApiPromise({
      provider: new polkadotApi.WsProvider(wsEndpoint),
      rpc: {
        unique: uniqueRpcDefinitions.rpc
      },
    })

    if (!options?.dontAwaitApiIsReady) {
      await this._api.isReady

      this._coin = new Coin({
        symbol: this._api.registry.chainTokens[0],
        decimals: this._api.registry.chainDecimals[0],
        weiSymbol: 'wei'
      })

      this._ss58Prefix = this._api.registry.chainSS58 || 42
    }

    return this
  }

  async disconnect() {
    await this._api?.disconnect()
    return this
  }



  getApi() {
    return this._api
  }

  get isConnected(): boolean {
    return this._api?.isConnected || false
  }

  transferCoins(params: ExtrinsicTransferCoinsParams, options?: ExtrinsicOptions) {
    return new ExtrinsicTransferCoins(this.api, params, options)
  }

  createCollection(params: ExtrinsicCreateCollectionParams, options?: ExtrinsicOptions) {
    return new ExtrinsicCreateCollection(this.api, params, options)
  }

  createTransactionFromRawTx(tx: SubmittableExtrinsic, options?: ExtrinsicOptions) {
    return new TransactionFromRawTx(this.api, tx, options)
  }

  getBalance = async (address: string): Promise<bigint> => {
    const substrateAddress = utils.address.addressToAsIsOrSubstrateMirror(address)

    const result = await this.api.query.system.account(substrateAddress)
    try {
      return BigInt((result as any).data.free.toString())
    } catch(err) {
      throw new Error(`Cannot cast account result to free balance`)
    }
  }

  getChainProperties = async () => {
    const result = (await this.api.rpc.system.properties()).toHuman()
    return result
  }
}
