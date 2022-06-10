import '@unique-nft/types/augment-api'

import {utils} from "../utils";
import {
  ExtrinsicTransferCoinsOptions,
  ExtrinsicTransferCoinsParams
} from "./extrinsics/common/ExtrinsicTransferCoins";
import {ExtrinsicOptions} from "./extrinsics/AbstractExtrinsic";
import {
  ExtrinsicCreateCollection,
  ExtrinsicCreateCollectionParams
} from "./extrinsics/unique/ExtrinsicCreateCollection";
import {SubstrateCommon} from "./SubstrateCommon";

import {
  ExtrinsicSetCollectionSponsor,
  ExtrinsicSetCollectionSponsorParams
} from './extrinsics/unique/ExtrinsicSetCollectionSponsor';

import {
  ExtrinsicConfirmSponsorship,
  ExtrinsicConfirmSponsorshipParams
} from './extrinsics/unique/ExtrinsicConfirmSponsorship'

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

  async getBalance(address: string): Promise<bigint> {
    const substrateAddress = utils.address.addressToAsIsOrSubstrateMirror(address)

    return await super.getBalance(substrateAddress)
  }

  setCollectionSponsor(params: ExtrinsicSetCollectionSponsorParams, options?: ExtrinsicOptions) {
    return new ExtrinsicSetCollectionSponsor(this.api, params, options)
  }

  confirmSponsorship(params: ExtrinsicConfirmSponsorshipParams, options?: ExtrinsicOptions) {
    return new ExtrinsicConfirmSponsorship(this.api, params, options)
  }
}
