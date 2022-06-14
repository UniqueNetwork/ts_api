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
  ExtrinsicAddCollectionAdmin,
  ExtrinsicAddCollectionAdminParams
} from "./extrinsics/unique/ExtrinsicAddCollectionAdmin";

import {
  ExtrinsicRemoveCollectionAdmin,
  ExtrinsicRemoveCollectionAdminParams
} from "./extrinsics/unique/ExtrinsicRemoveCollectionAdmin"

import {
  ExtrinsicSetCollectionSponsor,
  ExtrinsicSetCollectionSponsorParams
} from './extrinsics/unique/ExtrinsicSetCollectionSponsor';

import {
  ExtrinsicConfirmSponsorship,
  ExtrinsicConfirmSponsorshipParams
} from './extrinsics/unique/ExtrinsicConfirmSponsorship'

import {
  ExtrinsicChangeCollectionOwner,
  ExtrinsicChangeCollectionOwnerParams
} from './extrinsics/unique/ExtrinsicChangeCollectionOwner'
import { CollectionId } from 'src/types';

import {
  ExtrinsicRemoveCollectionSponsor,
  ExtrinsicRemoveCollectionSponsorParams
} from './extrinsics/unique/ExtrinsicRemoveCollectionSponsor'

import {
  ExtrinsicRemoveFromAllowList,
  ExtrinsicRemoveFromAllowListParams
} from './extrinsics/unique/ExtrinsicRemoveFromAllowList'

import {
  ExtrinsicAddToAllowList,
  ExtrinsicAddToAllowListParams
} from './extrinsics/unique/ExtrinsicAddToAllowList';

const normalizeSubstrate = utils.address.normalizeSubstrateAddress


export interface ConnectToSubstrateOptions {
  dontAwaitApiIsReady?: boolean
}

export class SubstrateUnique extends SubstrateCommon {
  async getBalance(address: string): Promise<bigint> {
    const substrateAddress = utils.address.addressToAsIsOrSubstrateMirror(address)

    return await super.getBalance(substrateAddress)
  }

  async __getRawCollectionById(collectionId: CollectionId) {
    const rawCollection = (await this.api.rpc.unique.collectionById(collectionId)).unwrap()

    return rawCollection
  }

  transferCoins(params: ExtrinsicTransferCoinsParams, options?: ExtrinsicTransferCoinsOptions) {
    const toAddress = utils.address.addressToAsIsOrSubstrateMirror(params.toAddress)
    return super.transferCoins({...params, toAddress}, options)
  }

  createCollection(params: ExtrinsicCreateCollectionParams, options?: ExtrinsicOptions) {
    return new ExtrinsicCreateCollection(this.api, params, options)
  }

  addCollectionAdmin(params: ExtrinsicAddCollectionAdminParams, options?: ExtrinsicOptions) {
    return new ExtrinsicAddCollectionAdmin(this.api, params, options)
  }

  removeCollectionAdmin(params: ExtrinsicRemoveCollectionAdminParams, options?: ExtrinsicOptions) {
    return new ExtrinsicRemoveCollectionAdmin(this.api, params, options)
  }

  setCollectionSponsor(params: ExtrinsicSetCollectionSponsorParams, options?: ExtrinsicOptions) {
    return new ExtrinsicSetCollectionSponsor(this.api, params, options)
  }

  confirmSponsorship(params: ExtrinsicConfirmSponsorshipParams, options?: ExtrinsicOptions) {
    return new ExtrinsicConfirmSponsorship(this.api, params, options)
  }

  changeCollectionOwner(params: ExtrinsicChangeCollectionOwnerParams, options?: ExtrinsicOptions) {
    return new ExtrinsicChangeCollectionOwner(this.api, params, options)
  }

  removeCollectionSponsor(params: ExtrinsicRemoveCollectionSponsorParams, options?: ExtrinsicOptions) {
    return new ExtrinsicRemoveCollectionSponsor(this.api, params, options)
  }

  addToAllowList(params: ExtrinsicAddToAllowListParams, options?: ExtrinsicOptions) {
    return new ExtrinsicAddToAllowList(this.api, params, options)
  }

  removeFromAllowList(params: ExtrinsicRemoveFromAllowListParams, options?: ExtrinsicOptions) {
    return new ExtrinsicRemoveFromAllowList(this.api, params, options)
  }
}
