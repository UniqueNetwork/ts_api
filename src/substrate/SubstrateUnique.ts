import {utils} from "../utils";
import {ExtrinsicTransferCoinsOptions, ExtrinsicTransferCoinsParams} from "./extrinsics/common/ExtrinsicTransferCoins";

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

import {
  ExtrinsicRemoveCollectionSponsor,
  ExtrinsicRemoveCollectionSponsorParams
} from './extrinsics/unique/ExtrinsicRemoveCollectionSponsor'

import {
  ExtrinsicRemoveFromAllowList,
  ExtrinsicRemoveFromAllowListParams
} from './extrinsics/unique/ExtrinsicRemoveFromAllowList'

import {ExtrinsicAddToAllowList, ExtrinsicAddToAllowListParams} from './extrinsics/unique/ExtrinsicAddToAllowList';
import {ExtrinsicCreateNftToken, ExtrinsicCreateNftTokenParams} from "./extrinsics/unique/ExtrinsicCreateNftToken";
import {
  ExtrinsicCreateMultipleNftTokens,
  ExtrinsicCreateMultipleNftTokensParams
} from "./extrinsics/unique/ExtrinsicCreateMultipleNftTokens";
import {vec2str} from "../utils/common";
import {decodeUniqueCollectionFromProperties} from "../schema/tools/collection";
import {UniqueCollectionSchemaDecoded, SchemaTools} from "../schema";
import {decodeTokenFromProperties} from "../schema/tools/token";
import {RawCollection} from "./extrinsics/unique/types";
import {HumanizedNftToken} from "../types";
import {ValidationError} from "../utils/errors";

const normalizeSubstrate = utils.address.normalizeSubstrateAddress


export interface ConnectToSubstrateOptions {
  dontAwaitApiIsReady?: boolean
}

export class SubstrateUnique extends SubstrateCommon {

  //////////////////////////////////////////
  // common methods
  //////////////////////////////////////////

  async getBalance(address: string): Promise<bigint> {
    const substrateAddress = utils.address.addressToAsIsOrSubstrateMirror(address)

    return await super.getBalance(substrateAddress)
  }

  async getCollectionById(collectionId: number) {
    const collection = (await this.api.rpc.unique.collectionById(collectionId)).toHuman() as any as RawCollection | null

    if (!collection) {
      return null
    }

    collection.properties = collection.properties || []

    return {
      ...collection,
      id: collectionId,
      name: vec2str(collection?.name),
      description: vec2str(collection?.description),
      uniqueSchema: await SchemaTools.decode.collectionSchema(collectionId, collection.properties),
      raw: collection
    }
  }

  async getTokenById(collectionId: number, tokenId: number, schema?: UniqueCollectionSchemaDecoded) {
    const rawToken = await this.api.rpc.unique.tokenData(collectionId, tokenId)
    const token: HumanizedNftToken = (rawToken).toHuman() as any as HumanizedNftToken

    if (!token || !token.owner) return null

    return {
      ...token,
      raw: rawToken,
      uniqueToken: await SchemaTools.decode.token(collectionId, tokenId, rawToken, schema as any),
    }
  }


  //////////////////////////////////////////
  // common extrinsics
  //////////////////////////////////////////

  //@overrides because it eats ethereum address too
  transferCoins(params: ExtrinsicTransferCoinsParams, options?: ExtrinsicTransferCoinsOptions) {
    const toAddress = utils.address.addressToAsIsOrSubstrateMirror(params.toAddress)
    return super.transferCoins({...params, toAddress}, options)
  }

  //////////////////////////////////////////
  // collection extrinsics
  //////////////////////////////////////////

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

  //////////////////////////////////////////
  // token extrinsics
  //////////////////////////////////////////

  createNftToken(params: ExtrinsicCreateNftTokenParams, options?: ExtrinsicOptions) {
    return new ExtrinsicCreateNftToken(this.api, params, options)
  }

  createMultipleNftTokens(params: ExtrinsicCreateMultipleNftTokensParams, options?: ExtrinsicOptions) {
    return new ExtrinsicCreateMultipleNftTokens(this.api, params, options)
  }
}
