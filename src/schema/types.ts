import {CollectionProperties} from '../substrate/extrinsics/unique/types'
import {getEnumKeys, getEnumValues} from "../tsUtils";

/**
 * infix and url or just infix - ?
 * width and height to json - or to the indexer?
 */

export type UrlOrInfixUrl =
  { url: string, urlInfix?: undefined }
  |
  { urlInfix: string, url?: undefined }
export type UrlOrInfixUrlWithHash = UrlOrInfixUrl & {hash?: string}

export type UrlTemplateString = `${string}{infix}${string}`

export enum AttributeType {
  integer = 0,                             // number
  float = 1,                               // number
  string = 2,                              // string
  localizedStringDictionaryIndex = 3,      // number
  boolean = 4,                             // number
  isoDate = 5,                             // string // ISO Date: YYYY-MM-DD
  time = 5,                                // string // 24h time: HH:mm:ss
  timestamp = 7,                           // number // js, milliseconds from epoch
  colorRgba = 8,                           // string // 'rrggbbaa'
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
  defaultLocale?: string
  values?: Array<{
    number: number,
    value: number | string | LocalizedStringDictionary
  }>
}

export interface TokenAttributes {
  [K: number]: number | Array<number> | string
}

export type CollectionAttributes = {
  [K: number]: AttributeSchema
}

const punksAttributesSchema: CollectionAttributes =  {
  '0': {
    name: {en: 'gender'},
    type: AttributeType.localizedStringDictionaryIndex,
    kind: AttributeKind.enum,
    values: [
      {number: 0, value: {en: 'Male'}},
      {number: 1, value: {en: 'Female'}},
    ]
  },
  '1': {
    name: {en: 'PunkAttribute'},
    type: AttributeType.localizedStringDictionaryIndex,
    kind: AttributeKind.enumMultiple,
    values: [
      {number: 0, value: {en: 'Black Lipstick'}},
      {number: 1, value: {en: 'Red Lipstick'}},
      {number: 2, value: {en: 'Smile'}},
      {number: 3, value: {en: 'Teeth Smile'}},
      {number: 4, value: {en: 'Purple Lipstick'}},
      {number: 5, value: {en: 'Nose Ring'}},
      {number: 6, value: {en: 'Asian Eyes'}},
      {number: 7, value: {en: 'Sunglasses'}},
      {number: 8, value: {en: 'Red Glasses'}},
      {number: 9, value: {en: 'Round Eyes'}},
      {number: 10, value: {en: 'Left Earring'}},
      {number: 11, value: {en: 'Right Earring'}},
      {number: 12, value: {en: 'Two Earrings'}},
      {number: 13, value: {en: 'Brown Beard'}},
      {number: 14, value: {en: 'Mustache Beard'}},
      {number: 15, value: {en: 'Mustache'}},
      {number: 16, value: {en: 'Regular Beard'}},
      {number: 17, value: {en: 'Up Hair'}},
      {number: 18, value: {en: 'Down Hair'}},
      {number: 19, value: {en: 'Mahawk'}},
      {number: 20, value: {en: 'Red Mahawk'}},
      {number: 21, value: {en: 'Orange Hair'}},
      {number: 22, value: {en: 'Bubble Hair'}},
      {number: 23, value: {en: 'Emo Hair'}},
      {number: 24, value: {en: 'Thin Hair'}},
      {number: 25, value: {en: 'Bald'}},
      {number: 26, value: {en: 'Blonde Hair'}},
      {number: 27, value: {en: 'Caret Hair'}},
      {number: 28, value: {en: 'Pony Tails'}},
      {number: 29, value: {en: 'Cigar'}},
      {number: 30, value: {en: 'Pipe'}}
    ]
  },
}

const punkAttributes: TokenAttributes = {'0': 0, '1': [0, 5, 30]}


export const COLLECTION_SCHEMA_NAME = <const>'super'


export interface CollectionSchemaSuper {
  schemaName: typeof COLLECTION_SCHEMA_NAME
  schemaVersion: string // semver

  imageUrlTemplate: UrlTemplateString
  coverImage: UrlOrInfixUrlWithHash
  coverImagePreview?: UrlOrInfixUrlWithHash

  attributesSchemaVersion: string
  nextAttributeId: number
  attributes: CollectionAttributes

  video?: {
    urlTemplate?: UrlTemplateString
  }

  audio?: {
    urlTemplate?: UrlTemplateString
    format: string
    isLossless?: boolean
  }

  object3D?: {
    urlTemplate?: UrlTemplateString
    format: string
  }
}

export interface TokenSchemaSuper {
  name?: string
  description?: string
  image: UrlOrInfixUrlWithHash
  imagePreview?: UrlOrInfixUrlWithHash
  attributes?: TokenAttributes
  video?: UrlOrInfixUrlWithHash
  audio?: UrlOrInfixUrlWithHash
  object3D?: UrlOrInfixUrlWithHash
}

// example

const collection: CollectionSchemaSuper = {
  schemaName: COLLECTION_SCHEMA_NAME,
  schemaVersion: '1.0.0',

  imageUrlTemplate: `https://ipfs.uniquenetwork.dev/ipfs/{infix}`,
  coverImage: {
    urlInfix: 'QmPCqY7Lmxerm8cLKmB18kT1RxkwnpasPVksA8XLhViVT7',
  },
  coverImagePreview: {
    urlInfix: 'QmPCqY7Lmxerm8cLKmB18kT1RxkwnpasPVksA8XLhViVT7',
  },

  attributesSchemaVersion: '1.0.0',
  nextAttributeId: 2,
  attributes: punksAttributesSchema
}



const tokenWithInfix: TokenSchemaSuper = {
  image: {
    urlInfix: 'QmPCqY7Lmxerm8cLKmB18kT1RxkwnpasPVksA8XLhViVT7',
    hash: '0x223423423423423234234'
  },
  attributes: punkAttributes
}

