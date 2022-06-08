import {CollectionProperties} from '../substrate/extrinsics/unique/types'

/**
 * infix and url or just infix - ?
 * width and height to json - or to the indexer?
 */

export type UrlOrInfixUrl =
  { url: string, urlInfix?: undefined }
  |
  { urlInfix: string, url?: undefined }

type DimensionsString = `{"w":${string},"h":${string}}`

export type Image = UrlOrInfixUrl & {
  hash?: string
}

export enum AttributeType {
  integer = 1,                             // number
  float = 2,                               // number
  string = 3,                              // string
  localizedStringDictionaryIndex = 4,      // number
  boolean = 5,                             // number
  isoDate = 6,                             // string // ISO Date: YYYY-MM-DD
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

export interface AttributeSchema<T> {
  name: string | LocalizedStringDictionary
  optional?: boolean
  type: AttributeType
  kind: AttributeKind
  values?: Array<{
    number: number,
    value: number | string | LocalizedStringDictionary
  }>
}

export interface Attributes {
  [K: number]: string | number | Array<number>
}

export type AttributesSchema = {
  schemaVersion: string
  nextAttributeId: number
  attributes: {
    [K in number]: AttributeSchema<any>
  }
}

const punksAttributesSchema: AttributesSchema = {
  schemaVersion: '1.0.0',
  nextAttributeId: 2,
  attributes: {
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
}

const punkAttributes: Attributes = {'0': 0, '1': [0, 5, 30]}


export interface CollectionSchemaBasic {
  type: string
  subtype: string
  subtypeVersion: string // semver

  imageUrlTemplate: `${string}{infix}${string}`
  coverImage: Image
  coverImagePreview?: Image
  desiredDefaultImageDimensions?: DimensionsString

  attributesSchema: string
}

export interface TokenSchemaBasic {
  name?: string
  description?: string
  image: Image
  imagePreview?: Image
  attributes?: string
}

// example

const collection: CollectionSchemaBasic = {
  type: 'Basic',
  subtype: 'BasicImage',
  subtypeVersion: '1.0.0',

  imageUrlTemplate: `https://ipfs.uniquenetwork.dev/ipfs/{infix}`,
  coverImage: {
    urlInfix: 'QmPCqY7Lmxerm8cLKmB18kT1RxkwnpasPVksA8XLhViVT7',
  },
  coverImagePreview: {
    urlInfix: 'QmPCqY7Lmxerm8cLKmB18kT1RxkwnpasPVksA8XLhViVT7',
  },

  attributesSchema: JSON.stringify(punksAttributesSchema)
}


const tokenWithInfix: TokenSchemaBasic = {
  image: {
    urlInfix: 'QmPCqY7Lmxerm8cLKmB18kT1RxkwnpasPVksA8XLhViVT7',
    hash: '0x223423423423423234234'
  },
  attributes: JSON.stringify({'0': 0, '1': [0, 5, 30]})
}
const tokenWithFullUrl: TokenSchemaBasic = {
  image: {
    url: 'https://ipfs.uniquenetwork.dev/ipfs/QmPCqY7Lmxerm8cLKmB18kT1RxkwnpasPVksA8XLhViVT7',
  },
  attributes: JSON.stringify({'0': 0, '1': [0, 5, 30]})
}


// Actual properties

const collectionProperties: CollectionProperties = [
  {"key": "type", "value": "Basic"},
  {"key": "subtype", "value": "BasicImage"},
  {"key": "subtypeVersion", "value": "1.0.0"},
  {"key": "imageUrlTemplate", "value": "https://ipfs.uniquenetwork.dev/ipfs/{infix}"},
  {"key": "coverImage--urlInfix", "value": "QmPCqY7Lmxerm8cLKmB18kT1RxkwnpasPVksA8XLhViVT7"},
  {"key": "coverImage--width", "value": "48"},
  {"key": "coverImage--height", "value": "48"},
]
const tokenWithInfixProperties: CollectionProperties = [
  {"key": "image.urlInfix", "value": "QmPCqY7Lmxerm8cLKmB18kT1RxkwnpasPVksA8XLhViVT7"},
  {"key": "image.width", "value": "48"},
  {"key": "image.height", "value": "48"},
]
const tokenWithFullUrlProperties: CollectionProperties = [
  {"key": "image.url", "value": "https://ipfs.uniquenetwork.dev/ipfs/QmPCqY7Lmxerm8cLKmB18kT1RxkwnpasPVksA8XLhViVT7"},
  {"key": "image.width", "value": "48"},
  {"key": "image.height", "value": "48"},
]

// ====================================
// Video

export interface CollectionSchemaBasicVideo extends CollectionSchemaBasic {
  videoUrlTemplate: `${string}{infix}${string}`
  type: 'BasicVideo'
}

export interface TokenSchemaBasicVideo extends TokenSchemaBasic {
  video: UrlOrInfixUrl & {
    dim: DimensionsString

    length?: number // seconds
    hash?: string
    //other video options...
  }
}

const videoToken: TokenSchemaBasicVideo = {
  image: {
    urlInfix: 'QmPCqY7Lmxerm8cLKmB18kT1RxkwnpasPVksA8XLhViVT7',
  },
  imagePreview: {
    urlInfix: 'QmPCqY7Lmxerm8cLKmB18kT1RxkwnpasPVksA8XLhViVT7',
  },
  video: {
    urlInfix: '...',
    dim: `{"w":1920,"h":1080}`,

    length: 300
  }

}

// ====================================
// Audio - single

export interface CollectionSchemaBasicAudio extends CollectionSchemaBasic {
  audioUrlTemplate: `${string}{infix}${string}`
  type: 'BasicAudio'
}

export interface TokenSchemaBasicAudio extends TokenSchemaBasic {
  audio: UrlOrInfixUrl & {
    length?: number // seconds
    bitrate?: number // kbps
    lossless?: boolean
    hash?: string
  }
}

// ====================================
export interface CollectionSchemaBasicObject3D extends CollectionSchemaBasic {
  object3DUrlTemplate: `${string}{infix}${string}`
  type: 'Basic3DObject'
}

export interface TokenSchemaBasicObject3D extends TokenSchemaBasic {
  object3D: UrlOrInfixUrl & {
    format: string
    // other fields
  }
}


