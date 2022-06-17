/**
 * infix and url or just infix - ?
 * width and height to json - or to the indexer?
 */

export type UrlOrInfixUrl =
  { url: string, urlInfix?: undefined }
  |
  { urlInfix: string, url?: undefined }
export type UrlOrInfixUrlWithHash = UrlOrInfixUrl & { hash?: string }

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
  defaultLocale?: string
  values?: Array<{
    number: number,
    value: number | string | LocalizedStringDictionary
  }>
}

export interface TokenAttributes {
  [K: number]: number | Array<number> | string | LocalizedStringDictionary
}

export type CollectionAttributes = {
  [K: number]: AttributeSchema
}

const punksAttributesSchema: CollectionAttributes = {
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


export const COLLECTION_SCHEMA_NAME = <const>'unique'


export interface CollectionSchemaUnique {
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

  spatialObject?: {
    urlTemplate?: UrlTemplateString
    format: string
  }
}

export interface TokenSchemaUnique {
  name?: string | LocalizedStringDictionary
  description?: string | LocalizedStringDictionary
  attributes?: TokenAttributes
  image: UrlOrInfixUrlWithHash
  imagePreview?: UrlOrInfixUrlWithHash
  video?: UrlOrInfixUrlWithHash
  audio?: UrlOrInfixUrlWithHash
  spatialObject?: UrlOrInfixUrlWithHash
}

// example

const collection: CollectionSchemaUnique = {
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


const tokenWithInfix: TokenSchemaUnique = {
  image: {
    urlInfix: 'QmPCqY7Lmxerm8cLKmB18kT1RxkwnpasPVksA8XLhViVT7',
    hash: '0x223423423423423234234'
  },
  attributes: punkAttributes
}

