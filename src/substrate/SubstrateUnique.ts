import '@unique-nft/types/augment-api'

import {ISigner, SubOrEthAddress, SubstrateAddress, ApiPromise} from "../types";
import {getPolkadotApi, uniqueRpcDefinitions} from "../libs";
import {utils} from "../utils";
import {
  ExtrinsicTransferCoins,
  ExtrinsicTransferCoinsOptions,
  ExtrinsicTransferCoinsParams
} from "./extrinsics/common/ExtrinsicTransferCoins";
import {TransactionFromRawTx, ExtrinsicOptions} from "./extrinsics/AbstractExtrinsic";
import {Coin} from "../coin";
import {
  ExtrinsicCreateCollection,
  ExtrinsicCreateCollectionParams
} from "./extrinsics/unique/ExtrinsicCreateCollection";
import {SubmittableExtrinsic} from "@polkadot/api/promise/types";
import {SubstrateCommon} from "./SubstrateCommon";


const normalizeSubstrate = utils.address.normalizeSubstrateAddress


export interface ConnectToSubstrateOptions {
  dontAwaitApiIsReady?: boolean
}

export class SubstrateUnique extends SubstrateCommon {
  transferCoins(params: ExtrinsicTransferCoinsParams, options?: ExtrinsicTransferCoinsOptions) {
    const toAddress = utils.address.addressToAsIsOrSubstrateMirror(params.toAddress)
    return super.transferCoins({...params, toAddress}, options)
  }

  createCollection(params: ExtrinsicCreateCollectionParams, options?: ExtrinsicOptions) {
    return new ExtrinsicCreateCollection(this.api, params, options)
  }

  getBalance = async (address: string): Promise<bigint> => {
    const substrateAddress = utils.address.addressToAsIsOrSubstrateMirror(address)

    return await super.getBalance(substrateAddress)
  }
}
