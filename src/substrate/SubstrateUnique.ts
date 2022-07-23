import {Address, UniqueUtils, string} from "../utils";
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
import {StringUtils} from "../utils";
import {SchemaTools, UniqueCollectionSchemaDecoded, UniqueTokenDecoded} from "../schema";
import {
  CollectionLimits,
  CollectionPermissions,
  CollectionSponsorship,
  CollectionTokenPropertyPermissions
} from "./extrinsics/unique/types";
import {CrossAccountId, PropertiesArray,} from "../types";
import {ValidationError} from "../utils/errors";
import {Bytes} from "@polkadot/types";
import {DecodingResult} from "../schema/schemaUtils";
import {substrateNormalizedWithMirrorIfEthereum} from "../utils/address/crossAccountId";

type TokenOwner = { substrate: string, ethereum?: undefined } | { ethereum: string, substrate?: undefined }

export interface IGetCollectionOptions {
  fetchAll?: boolean
  fetchEffectiveLimits?: boolean
  fetchAdmins?: boolean
  fetchNextTokenId?: boolean
}

export interface IGetTokenOptions {
  uniqueSchema?: UniqueCollectionSchemaDecoded | null
}

export type ParsedCollection = NonNullable<Awaited<ReturnType<SubstrateUnique['getCollection']>>>
export type ParsedToken = NonNullable<Awaited<ReturnType<SubstrateUnique['getToken']>>>

export interface ConnectToSubstrateOptions {
  dontAwaitApiIsReady?: boolean
}

const parseBytesToString = (bytes: Bytes): string => {
  return Array.from(bytes.toU8a()).map(el => String.fromCharCode(el)).join('')
}

const parseProperties = (rawProperties: PropertiesArray): PropertiesArray => {
  return rawProperties.map(property => {
    return {
      key: StringUtils.hexStringToString(property.key),
      value: StringUtils.hexStringToString(property.value)
    }
  })
}

const parseTokenPropertyPermissions = (tokenPropertyPermissions: any): CollectionTokenPropertyPermissions => {
  if (!Array.isArray(tokenPropertyPermissions)) {
    return []
  }
  return tokenPropertyPermissions.map(tpp => {
    return {
      key: StringUtils.hexStringToString(tpp.key),
      permission: tpp.permission
    }
  })
}


export class SubstrateUnique extends SubstrateCommon {

  //////////////////////////////////////////
  // common methods
  //////////////////////////////////////////

  async getBalance(address: string): Promise<bigint> {
    const substrateAddress = UniqueUtils.Address.to.substrateNormalizedOrMirrorIfEthereum(address)

    return await super.getBalance(substrateAddress)
  }

  async getCollection(collectionId: number, options?: IGetCollectionOptions) {
    const superRawCollection = await this.api.rpc.unique.collectionById(collectionId)
    if (!superRawCollection) {
      return null
    }

    const rawCollection = superRawCollection.toJSON() as any

    const collection = {
      id: collectionId,
      collectionId,
      owner: rawCollection.owner as string,
      ownerNormalized: Address.normalize.substrateAddress(rawCollection.owner) as string,
      mode: rawCollection.mode as string,
      name: StringUtils.vec2str(rawCollection.name),
      description: StringUtils.vec2str(rawCollection.description),
      tokenPrefix: StringUtils.hexStringToString(rawCollection.tokenPrefix),
      sponsorship: rawCollection.sponsorship as CollectionSponsorship,
      limits: rawCollection.limits as CollectionLimits,
      permissions: rawCollection.permissions as CollectionPermissions,
      tokenPropertyPermissions: parseTokenPropertyPermissions(rawCollection.tokenPropertyPermissions),
      properties: parseProperties(rawCollection.properties || []),
      readOnly: rawCollection.readOnly as boolean,

      effectiveLimits: null as CollectionLimits | null,
      adminList: [] as Array<CrossAccountId>,
      lastTokenId: null as number | null,

      uniqueSchema: null as UniqueCollectionSchemaDecoded | null,
      uniqueSchemaDecodingError: null as ValidationError | null,

      get raw() {
        return superRawCollection
      },
      get human() {
        return superRawCollection.toHuman()
      },
    }

    const uniqueSchema = await SchemaTools.decode.collectionSchema(collectionId, collection.properties)
    if (uniqueSchema.isValid) collection.uniqueSchema = uniqueSchema.decoded
    else collection.uniqueSchemaDecodingError = uniqueSchema.validationError

    if (options?.fetchAll || options?.fetchEffectiveLimits) {
      collection.effectiveLimits = (await this.api.rpc.unique.effectiveCollectionLimits(collectionId)).toHuman() as CollectionLimits
    }

    if (options?.fetchAll || options?.fetchAdmins) {
      collection.adminList = (await this.api.rpc.unique.adminlist(collectionId)).toHuman() as Array<CrossAccountId>
    }

    if (options?.fetchAll || options?.fetchNextTokenId) {
      collection.lastTokenId = (await this.api.rpc.unique.lastTokenId(collectionId)).toNumber()
    }

    return collection
  }

  async getToken(collectionId: number, tokenId: number, options?: IGetTokenOptions) {
    const superRawToken = await this.api.rpc.unique.tokenData(collectionId, tokenId)

    if (!superRawToken || !superRawToken.owner) return null

    const rawToken = superRawToken.toJSON() as { owner: TokenOwner, properties: PropertiesArray }

    const owner: CrossAccountId = Address.extract.crossAccountIdFromObject(rawToken.owner)
    const ownerNormalized: CrossAccountId = Address.extract.crossAccountIdFromObjectNormalized(rawToken.owner)

    const uniqueToken: DecodingResult<UniqueTokenDecoded> = options?.uniqueSchema
      ? await SchemaTools.decode.token(collectionId, tokenId, superRawToken, options?.uniqueSchema)
      : {isValid: false, validationError: new ValidationError('token parsing: no schema passed')}

    const token = {
      collectionId,
      tokenId,
      owner,
      ownerNormalized,
      properties: parseProperties(rawToken.properties),
      uniqueToken: uniqueToken.isValid ? uniqueToken.decoded : null,
      uniqueTokenDecodingError: uniqueToken.isValid ? null : uniqueToken.validationError,
      get raw() {
        return superRawToken
      },
      get human() {
        return superRawToken.toHuman()
      },
    }

    return token
  }


  //////////////////////////////////////////
  // common extrinsics
  //////////////////////////////////////////

  //@overrides because it eats ethereum address too
  transferCoins(params: ExtrinsicTransferCoinsParams, options?: ExtrinsicTransferCoinsOptions) {
    const toAddress = UniqueUtils.Address.to.substrateNormalizedOrMirrorIfEthereum(params.toAddress)
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
