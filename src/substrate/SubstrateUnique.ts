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
import {hexStringToString, vec2str} from "../utils/common";
import {decodeUniqueCollectionFromProperties} from "../schema/tools/collection";
import {UniqueCollectionSchemaDecoded, SchemaTools, UniqueTokenDecoded} from "../schema";
import {decodeTokenFromProperties} from "../schema/tools/token";
import {
  CollectionLimits, CollectionPermissions, CollectionSponsorship,
  CollectionTokenPropertyPermissions,
  RawCollection,
  TokenPropertyPermission
} from "./extrinsics/unique/types";
import {
  CollectionId,
  EthereumAddress,
  HumanizedNftToken,
  PropertiesArray,
  SubOrEthAddressObj,
  SubstrateAddress
} from "../types";
import {ValidationError} from "../utils/errors";
import {UpDataStructsProperty, UpDataStructsRpcCollection} from "@unique-nft/opal-testnet-types/default/types";
import {Writeable} from "../tsUtils";
import {normalizeEthereumAddress, normalizeSubstrateAddress} from "../utils/addressUtils";
import {Vec} from "@polkadot/types-codec";
import {Bytes} from "@polkadot/types";
import {DecodingResult} from "../schema/schemaUtils";

type TokenOwner = {substrate: string, ethereum?: undefined} | {ethereum: string, substrate?: undefined}

const normalizeSubstrate = utils.address.normalizeSubstrateAddress

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
      key: hexStringToString(property.key),
      value: hexStringToString(property.value)
    }
  })
}

const parseTokenPropertyPermissions = (tokenPropertyPermissions: any): CollectionTokenPropertyPermissions => {
  if (!Array.isArray(tokenPropertyPermissions)) {
    return []
  }
  return tokenPropertyPermissions.map(tpp => {
    return {
      key: hexStringToString(tpp.key),
      permission: tpp.permission
    }
  })
}


export class SubstrateUnique extends SubstrateCommon {

  //////////////////////////////////////////
  // common methods
  //////////////////////////////////////////

  async getBalance(address: string): Promise<bigint> {
    const substrateAddress = utils.address.addressToAsIsOrSubstrateMirror(address)

    return await super.getBalance(substrateAddress)
  }

  async getCollection(collectionId: number, options?: IGetCollectionOptions) {
    const superRawCollection = await this.api.rpc.unique.collectionById(collectionId)
    if (!superRawCollection) {
      return null
    }

    const rawCollection = superRawCollection.toJSON() as any

    const collection = {
      collectionId: collectionId as CollectionId,
      owner: rawCollection.owner as SubstrateAddress,
      ownerNormalized: normalizeSubstrateAddress(rawCollection.owner) as SubstrateAddress,
      mode: rawCollection.mode as string,
      name: vec2str(rawCollection.name),
      description: vec2str(rawCollection.description),
      tokenPrefix: rawCollection.tokenPrefix as string,
      sponsorship: rawCollection.sponsorship as CollectionSponsorship,
      limits: rawCollection.limits as CollectionLimits,
      permissions: rawCollection.permissions as CollectionPermissions,
      tokenPropertyPermissions: parseTokenPropertyPermissions(rawCollection.tokenPropertyPermissions),
      properties: parseProperties(rawCollection.properties || []),
      readOnly: rawCollection.readOnly as boolean,


      effectiveLimits: null as CollectionLimits | null,
      adminList: [] as Array<SubOrEthAddressObj>,
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
      collection.adminList = (await this.api.rpc.unique.adminlist(collectionId)).toHuman() as Array<SubOrEthAddressObj>
    }

    if (options?.fetchAll || options?.fetchNextTokenId) {
      collection.lastTokenId = (await this.api.rpc.unique.lastTokenId(collectionId)).toNumber()
    }

    return collection
  }

  async getToken(collectionId: number, tokenId: number, options?: IGetTokenOptions) {
    const superRawToken = await this.api.rpc.unique.tokenData(collectionId, tokenId)

    if (!superRawToken || !superRawToken.owner) return null

    const rawToken = superRawToken.toJSON() as {owner: TokenOwner, properties: PropertiesArray}

    const owner: SubOrEthAddressObj = rawToken.owner.substrate
        ? {Substrate: rawToken.owner.substrate as SubstrateAddress}
        : {Ethereum: rawToken.owner.ethereum as EthereumAddress}

    const ownerNormalized: SubOrEthAddressObj = rawToken.owner.substrate
        ? {Substrate: normalizeSubstrateAddress(rawToken.owner.substrate)}
        : {Ethereum: rawToken.owner.ethereum as EthereumAddress}

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
