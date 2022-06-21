export type InfixOrUrlOrCid =
  { url: string, urlInfix?: undefined, ipfsCid?: undefined }
  |
  { urlInfix: string, url?: undefined, ipfsCid?: undefined }
  |
  { ipfsCid: string, url?: undefined, urlInfix?: undefined }
export type InfixOrUrlOrCidAndHash = InfixOrUrlOrCid & { hash?: string }

export type UrlTemplateString = `${string}{infix}${string}`
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
  localizedStringDictionaryIndex = 0x105,      // number
  string = 0x201,                              // string
  url = 0x203,                                 // string
  isoDate = 0x204,                             // string // ISO Date: YYYY-MM-DD
  time = 0x205,                                // string // 24h time: HH:mm:ss
  colorRgba = 0x206,                           // string // 'rrggbbaa'
  localizedStringDictionary = 0x401,           // object
}


export interface LocalizedStringDictionary {
  [K: string]: string
}

export enum AttributeKind {
  enum = 0,
  enumMultiple = 1,
  freeValue = 2,
}

export interface AttributeSchema {
  name: string | LocalizedStringDictionary
  optional?: boolean
  type: AttributeType
  kind: AttributeKind
  enumValues?: {[K: number]: number | string | LocalizedStringDictionary}
}

export interface TokenAttributes {
  [K: number]: number | Array<number> | string | LocalizedStringDictionary
}

export type CollectionAttributesSchema = {
  [K: number]: AttributeSchema
}

export const COLLECTION_SCHEMA_NAME = <const>'unique'

export interface CollectionSchemaUnique {
  schemaName: typeof COLLECTION_SCHEMA_NAME
  schemaVersion: string // semver

  imageUrlTemplate: UrlTemplateString
  coverImage: InfixOrUrlOrCidAndHash
  coverImagePreview?: InfixOrUrlOrCidAndHash

  attributesSchemaVersion: string
  attributesSchema: CollectionAttributesSchema

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

export interface TokenSchemaUnique {
  name?: string | LocalizedStringDictionary
  description?: string | LocalizedStringDictionary
  attributes?: TokenAttributes
  image: InfixOrUrlOrCidAndHash
  imagePreview?: InfixOrUrlOrCidAndHash
  video?: InfixOrUrlOrCidAndHash
  audio?: InfixOrUrlOrCidAndHash
  spatialObject?: InfixOrUrlOrCidAndHash
}
