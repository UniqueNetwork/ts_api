import {CollectionId, SubOrEthAddressObj, TokenId} from "../types";

export type InfixOrUrlOrCid =
  { url: string, urlInfix?: undefined, ipfsCid?: undefined }
  |
  { urlInfix: string, url?: undefined, ipfsCid?: undefined }
  |
  { ipfsCid: string, url?: undefined, urlInfix?: undefined }
export type InfixOrUrlOrCidAndHash = InfixOrUrlOrCid & { hash?: string }
export const URL_TEMPLATE_INFIX = <const>'{infix}'
export type UrlTemplateString = `${string}${typeof URL_TEMPLATE_INFIX}${string}`
export const AttributeTypeMask = {
  number: 0x100,
  string: 0x200,
  object: 0x400,
}

export enum AttributeType {
  integer = 0x101,                             // number
  float = 0x102,                               // number
  boolean = 0x103,                             // number
  timestamp = 0x104,                           // number // js, milliseconds from epoch
  string = 0x201,                              // string
  url = 0x203,                                 // string
  isoDate = 0x204,                             // string // ISO Date: YYYY-MM-DD
  time = 0x205,                                // string // 24h time: HH:mm:ss
  colorRgba = 0x206,                           // string // 'rrggbbaa'
  localizedStringDictionary = 0x401,           // object
}
export type ATTRIBUTE_TYPE_NAME = keyof typeof AttributeType


export interface LocalizedStringDictionary {
  [K: string]: string
}

export enum AttributeKind {
  enum = 0,
  enumMultiple = 1,
  freeValue = 2,
}
export type ATTRIBUTE_KIND_NAME = keyof typeof AttributeKind

export interface AttributeSchema {
  name: string | LocalizedStringDictionary
  optional?: boolean
  type: AttributeType
  kind: AttributeKind
  enumValues?: {[K: number]: number | string | LocalizedStringDictionary}
}

export interface EncodedTokenAttributes {
  [K: number]: number | Array<number> | string | LocalizedStringDictionary
}

export type CollectionAttributesSchema = {
  [K: number]: AttributeSchema
}

export enum COLLECTION_SCHEMA_NAME {
  unique = 'unique',
  old = '_old_',
}

export interface UniqueCollectionSchemaToCreate {
  schemaName: COLLECTION_SCHEMA_NAME
  schemaVersion: string // semver

  coverPicture: InfixOrUrlOrCidAndHash
  coverPicturePreview?: InfixOrUrlOrCidAndHash

  attributesSchemaVersion: string
  attributesSchema: CollectionAttributesSchema

  image: {
    urlTemplate: UrlTemplateString
  }

  imagePreview?: {
    urlTemplate?: UrlTemplateString
  }

  video?: {
    urlTemplate?: UrlTemplateString
  }

  audio?: {
    urlTemplate?: UrlTemplateString
    format: string
    isLossless?: boolean
  }

  spatialObject?: {
    urlTemplate?: UrlTemplateString
    format: string
  }
}

export type UniqueCollectionSchemaDecoded = Omit<UniqueCollectionSchemaToCreate, 'coverPicture' | 'coverPicturePreview'> & {
  collectionId: CollectionId
  coverPicture: DecodedInfixOrUrlOrCidAndHash
  coverPicturePreview?: DecodedInfixOrUrlOrCidAndHash
  oldProperties?: {
    _old_schemaVersion?: string
    _old_offchainSchema?: string
    _old_constOnChainSchema?: string
    _old_variableOnChainSchema?: string
  }
}

interface IToken<GenericInfixUrlOrCidWithHash> {
  name?: string | LocalizedStringDictionary
  description?: string | LocalizedStringDictionary
  image: GenericInfixUrlOrCidWithHash
  imagePreview?: GenericInfixUrlOrCidWithHash
  video?: GenericInfixUrlOrCidWithHash
  audio?: GenericInfixUrlOrCidWithHash
  spatialObject?: GenericInfixUrlOrCidWithHash
}

export interface UniqueTokenToCreate extends IToken<InfixOrUrlOrCidAndHash>{
  encodedAttributes?: EncodedTokenAttributes
}

type AttributeDecodedValue = string | number | LocalizedStringDictionary | Array<string | number | LocalizedStringDictionary>

export type DecodedAttributes  = {
  [K: number]: {
    name: string | LocalizedStringDictionary
    value: AttributeDecodedValue
    type: AttributeType
    kind: AttributeKind
    isArray: boolean
    technicalTypeName: ATTRIBUTE_TYPE_NAME
    technicalKindName: ATTRIBUTE_KIND_NAME
  }
}

export type DecodedInfixOrUrlOrCidAndHash = InfixOrUrlOrCidAndHash & {fullUrl: string | null}

export interface UniqueTokenDecoded extends IToken<DecodedInfixOrUrlOrCidAndHash> {
  tokenId: TokenId
  collectionId: CollectionId
  owner: SubOrEthAddressObj
  nestingParentToken?: {
    collectionId: CollectionId
    tokenId: TokenId
  }
  attributes: DecodedAttributes
}

export type DecodingImageLinkOptions = {
  imageUrlTemplate?: UrlTemplateString
  dummyImageFullUrl?: string
}
