import {CollectionProperties} from '../substrate/extrinsics/unique/types'

type UrlOrInfixUrl =
  { url: string, urlInfix?: undefined }
  |
  { urlInfix: string, url?: undefined }

type Image = UrlOrInfixUrl & {
  width: number
  height: number
  hash?: string
}

interface CollectionSchemaBasic {
  type: string
  subtype: string
  subtypeVersion: string

  imageUrlTemplate: `${string}{infix}${string}`
  coverImage: Image
  coverImagePreview?: Image
}

interface TokenSchemaBasic {
  name?: string
  description?: string
  image: Image
  imagePreview?: Image
}

// example

const collection: CollectionSchemaBasic = {
  type: 'Basic',
  subtype: 'BasicImage',
  subtypeVersion: '1.0.0',

  imageUrlTemplate: `https://ipfs.uniquenetwork.dev/ipfs/{infix}`,
  coverImage: {
    urlInfix: 'QmPCqY7Lmxerm8cLKmB18kT1RxkwnpasPVksA8XLhViVT7',
    width: 48,
    height: 48,
  },
}


const tokenWithInfix: TokenSchemaBasic = {
  image: {
    urlInfix: 'QmPCqY7Lmxerm8cLKmB18kT1RxkwnpasPVksA8XLhViVT7',
    width: 48,
    height: 48,
  }
}
const tokenWithFullUrl: TokenSchemaBasic = {
  image: {
    url: 'https://ipfs.uniquenetwork.dev/ipfs/QmPCqY7Lmxerm8cLKmB18kT1RxkwnpasPVksA8XLhViVT7',
    width: 48,
    height: 48,
  }
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
  {"key": "image--urlInfix", "value": "QmPCqY7Lmxerm8cLKmB18kT1RxkwnpasPVksA8XLhViVT7"},
  {"key": "image--width", "value": "48"},
  {"key": "image--height", "value": "48"},
]
const tokenWithFullUrlProperties: CollectionProperties = [
  {"key": "image--url", "value": "https://ipfs.uniquenetwork.dev/ipfs/QmPCqY7Lmxerm8cLKmB18kT1RxkwnpasPVksA8XLhViVT7"},
  {"key": "image--width", "value": "48"},
  {"key": "image--height", "value": "48"},
]

// ====================================
// Video

interface CollectionSchemaBasicVideo extends CollectionSchemaBasic {
  videoUrlTemplate: `${string}{infix}${string}`
  type: 'BasicVideo'
}

interface TokenSchemaBasicVideo extends TokenSchemaBasic {
  video: UrlOrInfixUrl & {
    width: number
    height: number

    length?: number // seconds
    hash?: string
    //other video options...
  }
}

const videoToken: TokenSchemaBasicVideo = {
  image: {
    urlInfix: 'QmPCqY7Lmxerm8cLKmB18kT1RxkwnpasPVksA8XLhViVT7',
    width: 1920,
    height: 1080,
  },
  imagePreview: {
    urlInfix: 'QmPCqY7Lmxerm8cLKmB18kT1RxkwnpasPVksA8XLhViVT7',
    width: 48,
    height: 48,
  },
  video: {
    urlInfix: '...',
    width: 1920,
    height: 1080,

    length: 300
  }

}

// ====================================
// Audio - single

interface CollectionSchemaBasicAudio extends CollectionSchemaBasic {
  audioUrlTemplate: `${string}{infix}${string}`
  type: 'BasicAudio'
}

interface TokenSchemaBasicAudio extends TokenSchemaBasic {
  audio: UrlOrInfixUrl & {
    length?: number // seconds
    bitrate?: number // kbps
    lossless?: boolean
    hash?: string
  }
}

// ====================================
interface CollectionSchemaBasicObject3D extends CollectionSchemaBasic {
  object3DUrlTemplate: `${string}{infix}${string}`
  type: 'Basic3DObject'
}

interface TokenSchemaBasicObject3D extends TokenSchemaBasic {
  object3D: UrlOrInfixUrl & {
    format: string
    // other fields
  }
}


