import * as dotenv from 'dotenv'
import fs from 'fs'
import { beforeAll, describe, expect, test, suite, Vitest } from 'vitest'
import { AttributeKind, AttributeType, CollectionAttributesSchema, COLLECTION_SCHEMA_NAME, init, KeyringPair, Substrate, SubstrateUnique, UniqueCollectionSchemaDecoded, UniqueCollectionSchemaToCreate, SchemaTools, UniqueTokenToCreate } from '../index'
import { validateCollectionAttributesSchema } from '../schema/tools/validators'
import { addressToObject } from '../utils/addressUtils'

declare module 'vitest' {
  export interface Suite {
    chain: SubstrateUnique
    keyring1: KeyringPair
    keyring2: KeyringPair
    keyringAlice: KeyringPair
    keyringBob: KeyringPair
    collectionId: number
    knightTokenId: number
    assassinTokenId: number
    wizardTokenId: number
  }
}

describe.concurrent('validateCollectionAttributesSchema tests:', () => {
  test('Right collection attributes', () => {
    const test_attribute: CollectionAttributesSchema = {
      '1': {
        name: {en: 'test'},
        type: AttributeType.localizedStringDictionary,
        kind: AttributeKind.enum,
        enumValues: {
          '0': {en: 'test0'},
          '1': {en: 'test1'},
        }
      }
    }

    expect(validateCollectionAttributesSchema(test_attribute, 'testVar')).toBe(true)
  })

  test('Collection Attributes is not an object', () => {
    const number = 1
    expect(() => validateCollectionAttributesSchema(number, 'testVar')).toThrowError('is not an object')
  })

  test('Collection Attributes is null', () => {
    const nullVar = null
    expect(() => validateCollectionAttributesSchema(nullVar, 'testVar')).toThrowError('is a null, should be valid object')
  })

  test('Collection Attributes is set', () => {
    const set = new Set()
    expect(() => validateCollectionAttributesSchema(set, 'testVar')).toThrowError('is a Set, should be plain object')
  })

  test('Collection Attributes is map', () => {
    const map = new Map()
    expect(() => validateCollectionAttributesSchema(map, 'testVar')).toThrowError('is a Map, should be plain object')
  })

  test('Collection Attributes is array', () => {
    const arr = [1, 2, 3]
    expect(() => validateCollectionAttributesSchema(arr, 'testVar')).toThrowError('is an array, should be plain object')
  })

  test('Key is string', () => {
    const test_attribute: CollectionAttributesSchema = {
      ['key1' as any as number]: {
        name: {en: 'test'},
        type: AttributeType.localizedStringDictionary,
        kind: AttributeKind.enum,
        enumValues: {
          '0': 'test0',
          '1': 'test1',
        }
      }
    }

    expect(() => validateCollectionAttributesSchema(test_attribute, 'testVar')).toThrowError('is not a valid number key')
  })

  test('Key is NaN', () => {
    const nan = 0 / 0;
    const test_attribute: CollectionAttributesSchema = {}

    test_attribute[nan] = {
      name: {en: 'test'},
      type: AttributeType.localizedStringDictionary,
      kind: AttributeKind.enum,
      enumValues: {
        '0': 'test0',
        '1': 'test1',
      }
    }

    expect(() => validateCollectionAttributesSchema(test_attribute, 'testVar')).toThrowError('is not a valid number key')
  })

  test('Key is float', () => {
    const float = 22 / 7
    const test_attribute: CollectionAttributesSchema = {}

    test_attribute[float] = {
      name: {en: 'test'},
      type: AttributeType.string,
      kind: AttributeKind.enum,
      enumValues: {
        '0': 'test0',
        '1': 'test1',
      }
    }

    expect(() => validateCollectionAttributesSchema(test_attribute, 'testVar')).toThrowError('is not a valid number key')
  })

  test('attributes is number', () => {
    const test_attribute: CollectionAttributesSchema = {
      '1': 1 as any
    }

    expect(() => validateCollectionAttributesSchema(test_attribute, 'testVar')).toThrowError('is not an object')
  })

  test('attributes is map', () => {
    const test_attribute: CollectionAttributesSchema = {
      '1': new Map() as any
    }

    expect(() => validateCollectionAttributesSchema(test_attribute, 'testVar')).toThrowError('should be plain object')
  })

  test('attributes is set', () => {
    const test_attribute: CollectionAttributesSchema = {
      '1': new Set() as any
    }

    expect(() => validateCollectionAttributesSchema(test_attribute, 'testVar')).toThrowError('should be plain object')
  })

  test('attributes is null', () => {
    const test_attribute: CollectionAttributesSchema = {
      '1': null as any
    }

    expect(() => validateCollectionAttributesSchema(test_attribute, 'testVar')).toThrowError('should be valid object')
  })

  test('attributes is array', () => {
    const test_attribute: CollectionAttributesSchema = {
      '1': [1, 2, 3] as any
    }

    expect(() => validateCollectionAttributesSchema(test_attribute, 'testVar')).toThrowError('should be plain object')
  })

  test('attributes.name empty object', () => {
    const test_attribute: CollectionAttributesSchema = {
      '1': {
        name: {},
        type: AttributeType.localizedStringDictionary,
        kind: AttributeKind.enum,
        enumValues: {
          '0': 'test0',
          '1': 'test1',
        }
      }
    }

    expect(() => validateCollectionAttributesSchema(test_attribute, 'testVar')).toThrowError('empty object')
  })

  test('attributes.name dict key is not a string', () => {
    const test_attribute: CollectionAttributesSchema = {
      '1': {
        name: {1: 'test'},
        type: AttributeType.localizedStringDictionary,
        kind: AttributeKind.enum,
        enumValues: {
          '0': 'test0',
          '1': 'test1',
        }
      }
    }

    expect(() => validateCollectionAttributesSchema(test_attribute, 'testVar')).toThrowError('should be a valid Language code')
  })

  test('attributes.name dict key does not match regex', () => {
    const test_attribute: CollectionAttributesSchema = {
      '1': {
        name: {'ru-RUS': 'test'},
        type: AttributeType.localizedStringDictionary,
        kind: AttributeKind.enum,
        enumValues: {
          '0': 'test0',
          '1': 'test1',
        }
      }
    }

    expect(() => validateCollectionAttributesSchema(test_attribute, 'testVar')).toThrowError('should be a valid Language code')
  })

  test('attributes.optional should be boolean', () => {
    const test_attribute: CollectionAttributesSchema = {
      '1': {
        name: {en: 'test'},
        optional: 1 as any,
        type: AttributeType.localizedStringDictionary,
        kind: AttributeKind.enum,
        enumValues: {
          '0': 'test0',
          '1': 'test1',
        }
      }
    }

    expect(() => validateCollectionAttributesSchema(test_attribute, 'testVar')).toThrowError('should be boolean')
  })

  test('attributes.type should be valid type', () => {
    const test_attribute: CollectionAttributesSchema = {
      '1': {
        name: {en: 'test'},
        type: 'wrong-type' as any,
        kind: AttributeKind.enum,
        enumValues: {
          '0': 'test0',
          '1': 'test1',
        }
      }
    }

    expect(() => validateCollectionAttributesSchema(test_attribute, 'testVar')).toThrowError('should be a valid attribute type')
  })

  test('attributes.type should possible attribute type', () => {
    const test_attribute: CollectionAttributesSchema = {
      '1': {
        name: {en: 'test'},
        type: 0xff,
        kind: AttributeKind.enum,
        enumValues: {
          '0': 'test0',
          '1': 'test1',
        }
      }
    }

    expect(() => validateCollectionAttributesSchema(test_attribute, 'testVar')).toThrowError('should be a valid attribute type')
  })

  test('attributes.kind should be valid kind', () => {
    const test_attribute: CollectionAttributesSchema = {
      '1': {
        name: {en: 'test'},
        type: AttributeType.localizedStringDictionary,
        kind: 'wrong-kind' as any,
        enumValues: {
          '0': 'test0',
          '1': 'test1',
        }
      }
    }

    expect(() => validateCollectionAttributesSchema(test_attribute, 'testVar')).toThrowError('should be a valid attribute kind')
  })

  test('attributes.enumValues typeof(number) !== number', () => {
    const test_attribute: CollectionAttributesSchema = {
      '1': {
        name: {en: 'test'},
        type: AttributeType.localizedStringDictionary,
        kind: AttributeKind.enum,
        enumValues: {
          ['a' as any]: {en: 'test'}
        }
      }
    }

    expect(() => validateCollectionAttributesSchema(test_attribute, 'testVar')).toThrowError('is not a valid number')
  })

  test('attributes.enumValues value number type: wrong number', () => {
    const test_attribute: CollectionAttributesSchema = {
      '1': {
        name: {en: 'test'},
        type: AttributeType.integer,
        kind: AttributeKind.enum,
        enumValues: {
          '0': 'aaa'
        }
      }
    }

    expect(() => validateCollectionAttributesSchema(test_attribute, 'testVar')).toThrowError('should be a number')
  })

  test('attributes.enumValues value boolean type: wrong number', () => {
    const test_attribute: CollectionAttributesSchema = {
      '1': {
        name: {en: 'test'},
        type: AttributeType.boolean,
        kind: AttributeKind.enum,
        enumValues: {
          '0': 123
        }
      }
    }

    expect(() => validateCollectionAttributesSchema(test_attribute, 'testVar')).toThrowError('should be a boolean')
  })

  test('attributes.enumValues value string type: wrong isoDate', () => {
    const test_attribute: CollectionAttributesSchema = {
      '1': {
        name: {en: 'test'},
        type: AttributeType.isoDate,
        kind: AttributeKind.enum,
        enumValues: {
          '0': '202206:25'
        }
      }
    }

    expect(() => validateCollectionAttributesSchema(test_attribute, 'testVar')).toThrowError('should be a valid ISO Date')
  })

  test('attributes.enumValues value string type: wrong time', () => {
    const test_attribute: CollectionAttributesSchema = {
      '1': {
        name: {en: 'test'},
        type: AttributeType.time,
        kind: AttributeKind.enum,
        enumValues: {
          '0': '1:65'
        }
      }
    }

    expect(() => validateCollectionAttributesSchema(test_attribute, 'testVar')).toThrowError('should be a valid time in')
  })

  test('attributes.enumValues value string type: rgb', () => {
    const test_attribute: CollectionAttributesSchema = {
      '1': {
        name: {en: 'test'},
        type: AttributeType.colorRgba,
        kind: AttributeKind.enum,
        enumValues: {
          '0': '#aabbcx'
        }
      }
    }

    expect(() => validateCollectionAttributesSchema(test_attribute, 'testVar')).toThrowError('should be a valid rgb or rgba color')
  })

  test('attributes.enumValues value string type: rgba', () => {
    const test_attribute: CollectionAttributesSchema = {
      '1': {
        name: {en: 'test'},
        type: AttributeType.colorRgba,
        kind: AttributeKind.enum,
        enumValues: {
          '0': '#aabbccdx'
        }
      }
    }

    expect(() => validateCollectionAttributesSchema(test_attribute, 'testVar')).toThrowError('should be a valid rgb or rgba color')
  })
})

const dungeonsAndHeroesCollectionAttributesSchema: CollectionAttributesSchema = {
  '0': {
    name: {en: 'class'},
    type: AttributeType.localizedStringDictionary,
    kind: AttributeKind.enum,
    enumValues: {
      0: {en: 'knight'},
      1: {en: 'assassin'},
      2: {en: 'wizard'}
    }
  },

  '1': {
    name: {en: 'weapon'},
    type: AttributeType.localizedStringDictionary,
    kind: AttributeKind.enumMultiple,
    enumValues: {
      0:  {en: 'Sword'},
      1:  {en: 'Dagger'},
      2:  {en: 'Wizard staff'},
      3:  {en: "Hunter's bow"},
    }
  }
}

const dungeonsAndHeroesSchema: UniqueCollectionSchemaToCreate = {
  schemaName: COLLECTION_SCHEMA_NAME,
  schemaVersion: '1.0.0',
  image: {
    urlTemplate: `https://images.unsplash.com/photo-{infix}`
  },
  video: {
    urlTemplate: `https://assets.mixkit.co/videos/preview/{infix}.mp4`
  },
  audio: {
    urlTemplate: `https://tracks.snapmuse.com/v/128/{infix}.mp3`, // IEROD1903085
    isLossless: false,
    format: 'mp3'
  },

  spatialObject: {
    urlTemplate: `https://3dplaceholder.com/{infix}`,
    format: 'obj'
  },

  coverPicture: {
    urlInfix: '1620747918456-6db88fea1e84'
  },
  attributesSchemaVersion: '1.0.0',
  attributesSchema: dungeonsAndHeroesCollectionAttributesSchema
}

const knightToken: UniqueTokenToCreate = {
  image: {
    ipfsCid: '1600081522768-cb2e80ed4491'
  },

  name: 'knight test token',

  encodedAttributes: {
    0: 0,
    1: [0]
  }
}

const assassinToken: UniqueTokenToCreate = {
  image: {
    ipfsCid: '1598284188955-497134dbc08b'
  },

  name: 'assassin test token',
  description: 'test',

  video: {
    ipfsCid: 'mixkit-forest-stream-in-the-sunlight-529-small'
  },

  encodedAttributes: {
    0: 1,
    1: [1, 3]
  }
}

const wizardToken: UniqueTokenToCreate = {
  image: {
    ipfsCid: '1598284188955-497134dbc08b'
  },

  spatialObject: {
    ipfsCid: 'test-url'
  },

  encodedAttributes: {
    0: 2,
    1: [0, 2]
  }
}

interface Context {
  chain: SubstrateUnique
  keyring1: KeyringPair
  keyring2: KeyringPair
  collectionId: number
  decodedSchema: UniqueCollectionSchemaDecoded
}

let context: Context | undefined;

describe('Integration tests for validateCollectionAttributesSchema', () => {
  beforeAll(async () => {
    const config = dotenv.parse(fs.readFileSync('./src/test/.test.env').toString('utf8'))
    await init()
    const chain = new Substrate.Unique()
    await chain.connect(config.NODE_SUB, {uniqueRpcDefinitionsName: 'unique'})

    const api = chain.getApi();

    if (!api) {
      throw Error('Api is not connected.')
    }


    const keyring1 = Substrate.signer.keyringFromSeed(config.SUB_SEED_1)
    const keyring2 = Substrate.signer.keyringFromSeed(config.SUB_SEED_2)

    const collectionProperties = SchemaTools.encode.collectionSchema(dungeonsAndHeroesSchema)
    const tokenPropertyPermissions = SchemaTools.encode.collectionTokenPropertyPermissions(dungeonsAndHeroesSchema)
    const knightTokenProperties = SchemaTools.encode.token(knightToken, dungeonsAndHeroesSchema)


    const assassinTokenProperties = SchemaTools.encode.token(assassinToken, dungeonsAndHeroesSchema)
    const wizardTokenProperties = SchemaTools.encode.token(wizardToken, dungeonsAndHeroesSchema)
    const createCollectionResult = await chain.createCollection({collection: {
        name: 'Dungeons and heroes',
        description: 'Various heroes from the worldwide famous game dungeons and heroes',
        tokenPrefix: 'dnh',
        properties: collectionProperties,
        tokenPropertyPermissions: tokenPropertyPermissions
        }
      }).signAndSend(keyring1)

    const collectionId = createCollectionResult.collectionId;

    const tokenData = [
      {
        owner: addressToObject(keyring1.address),
        properties: [
          { key: 'n',   value: 'knight (valid token)' },
          { key: 'a.0', value: '0'      },
          { key: 'a.1', value: '0'      },
          { key: 'i.c', value: '1600081522768-cb2e80ed4491' }
        ]
      },

      { // invalid value 1/3
        owner: addressToObject(keyring1.address),
        properties: [
          { key: 'n',   value: 'assassin test token (invalid token)' },
          { key: 'd',   value: 'test' },
          { key: 'a.0', value: '1/3' },
          { key: 'a.1', value: '1,3' },
          { key: 'i.c', value: '1598284188955-497134dbc08b' },
          { key: 'v.c', value: 'mixkit-forest-stream-in-the-sunlight-529-small' }
        ]
      },

      { // Valid name, invalid value
        owner: addressToObject(keyring2.address),
        properties: [
          { key: 'n', value: 123},
          { key: 'a.0', value: '2' },
          { key: 'a.1', value: '0:2' },
          { key: 'i.c', value: '1598284188955-497134dbc08b' }
        ]
      },

      { // Valid name, invalid i.c
        owner: addressToObject(keyring2.address),
        properties: [
          { key: 'n', value: 'test-token'},
          { key: 'a.0', value: '2' },
          { key: 'a.1', value: '0,2' },
          { key: 'i.c', value: '{invalid: image}' }
        ]
      },

      { // invalid v.c
        owner: addressToObject(keyring2.address),
        properties: [
          { key: 'n', value: 'test-token'},
          { key: 'a.0', value: '2' },
          { key: 'a.1', value: '0,2' },
          { key: 'v.c', value: '{invalid: video}' },
          { key: 'i.c', value: '1598284188955-497134dbc08b' }
        ]
      },

      { // invalid so.c
        owner: addressToObject(keyring2.address),
        properties: [
          { key: 'n', value: 'test-token'},
          { key: 'a.0', value: '2' },
          { key: 'a.1', value: '0,2' },
          { key: 'so.c', value: '{invalid: spatial object}' },
          { key: 'i.c', value: '1598284188955-497134dbc08b' }
        ]
      },

      { // Valid name, invalid i.c
        owner: addressToObject(keyring2.address),
        properties: [
          { key: 'n', value: 'test-token'},
          { key: 'a.0', value: '2' },
          { key: 'a.1', value: '0,2' },
          { key: 'i.c', value: '[invalid, image]' }
        ]
      },

      { // invalid v.c
        owner: addressToObject(keyring2.address),
        properties: [
          { key: 'n', value: 'test-token'},
          { key: 'a.0', value: '2' },
          { key: 'a.1', value: '0,2' },
          { key: 'v.c', value: '[invalid, video]' },
          { key: 'i.c', value: '1598284188955-497134dbc08b' }
        ]
      },

      { // invalid so.c
        owner: addressToObject(keyring2.address),
        properties: [
          { key: 'n', value: 'test-token'},
          { key: 'a.0', value: '2' },
          { key: 'a.1', value: '0,2' },
          { key: 'so.c', value: '[invalid, spatial object]' },
          { key: 'i.c', value: '1598284188955-497134dbc08b' }
        ]
      },

      { // invalid a.1: empty value
        owner: addressToObject(keyring2.address),
        properties: [
          { key: 'n', value: 'test-token'},
          { key: 'a.0', value: '2' },
          { key: 'a.1', value: '' },
          { key: 'i.c', value: '1598284188955-497134dbc08b' }
        ]
      },

      { // invalid a.1: string instead of string of numbers
        owner: addressToObject(keyring2.address),
        properties: [
          { key: 'n', value: 'test-token'},
          { key: 'a.0', value: '2' },
          { key: 'a.1', value: 'asdf' },
          { key: 'i.c', value: '1598284188955-497134dbc08b' }
        ]
      },

      { // invalid a.1: object
        owner: addressToObject(keyring2.address),
        properties: [
          { key: 'n', value: 'test-token'},
          { key: 'a.0', value: '2' },
          { key: 'a.1', value: '{simple: object}' },
          { key: 'i.c', value: '1598284188955-497134dbc08b' }
        ]
      },

      { // invalid n: empty
        owner: addressToObject(keyring2.address),
        properties: [
          { key: 'n', value: ''},
          { key: 'a.0', value: '2' },
          { key: 'a.1', value: '1' },
          { key: 'i.c', value: '1598284188955-497134dbc08b' }
        ]
      },
    ]

    const res = await api.tx.unique.createMultipleItemsEx(collectionId, {
      NFT: tokenData
    }).signAndSend(keyring1)

    const getCollectionRes = await chain.getCollectionById(collectionId)

    expect(getCollectionRes?.uniqueSchema.isValid).toBe(true)
    console.log('Valid collection created, id:', collectionId)

    context = {
      chain: chain,
      keyring1: keyring1,
      keyring2: keyring2,
      collectionId: collectionId,
      decodedSchema: (getCollectionRes?.uniqueSchema as any).decoded
    }
  })

  test('get valid token', async () => {
    const {chain, keyring1, collectionId, decodedSchema} = context!
    const getTokenRes = await chain.getTokenById(collectionId, 1, decodedSchema)

    const expectedProperties = [
        { key: 'n',   value: 'knight (valid token)' },
        { key: 'a.0', value: '0'      },
        { key: 'a.1', value: '0'      },
        { key: 'i.c', value: '1600081522768-cb2e80ed4491' }
    ]

    const expectedOwner = addressToObject(keyring1.address)

    expect(
      getTokenRes?.properties.sort((a, b) => a.key > b.key ? 1 : -1)
    ).toStrictEqual(expectedProperties.sort((a, b) => a.key > b.key ? 1 : -1))

    expect(getTokenRes?.owner).toStrictEqual(expectedOwner)
    expect(getTokenRes?.uniqueToken.isValid).toBe(true)
  })

  test('invalid value a.0 == 1/3', async () => {
    const {chain, collectionId, decodedSchema} = context!
    const getTokenRes = await chain.getTokenById(collectionId, 2, decodedSchema)

    expect(getTokenRes?.uniqueToken.isValid).toBe(false)
  })

  test('invalid value a.1 == 1:3', async () => {
    const {chain, collectionId, decodedSchema} = context!
    const getTokenRes = await chain.getTokenById(collectionId, 3, decodedSchema)

    expect(getTokenRes?.uniqueToken.isValid).toBe(false)
  })

  test('invalid i.c: object', async () => {
    const {chain, collectionId, decodedSchema} = context!
    const getTokenRes = await chain.getTokenById(collectionId, 4, decodedSchema)

    expect(getTokenRes?.uniqueToken.isValid).toBe(false)
  })

  test('invalid v.c: object', async () => {
    const {chain, collectionId, decodedSchema} = context!
    const getTokenRes = await chain.getTokenById(collectionId, 5, decodedSchema)

    expect(getTokenRes?.uniqueToken.isValid).toBe(false)
  })

  test('invalid so.c: object', async () => {
    const {chain, collectionId, decodedSchema} = context!
    const getTokenRes = await chain.getTokenById(collectionId, 6, decodedSchema)

    expect(getTokenRes?.uniqueToken.isValid).toBe(false)
  })

  test('invalid i.c: array', async () => {
    const {chain, collectionId, decodedSchema} = context!
    const getTokenRes = await chain.getTokenById(collectionId, 7, decodedSchema)

    expect(getTokenRes?.uniqueToken.isValid).toBe(false)
  })

  test('invalid v.c: array', async () => {
    const {chain, collectionId, decodedSchema} = context!
    const getTokenRes = await chain.getTokenById(collectionId, 8, decodedSchema)

    expect(getTokenRes?.uniqueToken.isValid).toBe(false)
  })

  test('invalid so.c: array', async () => {
    const {chain, collectionId, decodedSchema} = context!
    const getTokenRes = await chain.getTokenById(collectionId, 9, decodedSchema)

    expect(getTokenRes?.uniqueToken.isValid).toBe(false)
  })

  test('empty a.1 value', async () => {
    const {chain, collectionId, decodedSchema} = context!
    const getTokenRes = await chain.getTokenById(collectionId, 10, decodedSchema)

    expect(getTokenRes?.uniqueToken.isValid).toBe(false)
  })

  test('invalid a.1: string instead of string of numbers', async () => {
    const {chain, collectionId, decodedSchema} = context!
    const getTokenRes = await chain.getTokenById(collectionId, 11, decodedSchema)

    expect(getTokenRes?.uniqueToken.isValid).toBe(false)
  })

  test('invalid a.1: object', async () => {
    const {chain, collectionId, decodedSchema} = context!
    const getTokenRes = await chain.getTokenById(collectionId, 12, decodedSchema)

    expect(getTokenRes?.uniqueToken.isValid).toBe(false)
  })

  test('invalid n: empty', async () => {
    const {chain, collectionId, decodedSchema} = context!
    const getTokenRes = await chain.getTokenById(collectionId, 13, decodedSchema)

    expect(getTokenRes?.uniqueToken.isValid).toBe(false)
  })
})
