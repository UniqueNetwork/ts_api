import {
    AttributeType,
    COLLECTION_SCHEMA_NAME,
    CollectionAttributesSchema, SchemaTools, UniqueCollectionSchemaDecoded,
    UniqueCollectionSchemaToCreate, UniqueTokenToCreate
} from "../schema";
import {Substrate, SubstrateUnique} from "../substrate";
import {init, KeyringPair} from "../index";
import {beforeAll, describe, expect, test} from "vitest";
import * as dotenv from "dotenv";
import fs from "fs";
import {Address} from "../utils";

const dungeonsAndHeroesCollectionAttributesSchema: CollectionAttributesSchema = {
    '0': {
        name: {_: 'class'},
        type: AttributeType.string,
        enumValues: {
            0: {_: 'knight'},
            1: {_: 'assassin'},
            2: {_: 'wizard'}
        }
    },

    '1': {
        name: {_: 'weapon'},
        type: AttributeType.string,
        isArray: true,
        enumValues: {
            0:  {_: 'Sword'},
            1:  {_: 'Dagger'},
            2:  {_: 'Wizard staff'},
            3:  {_: "Hunter's bow"},
        }
    }
}

const dungeonsAndHeroesSchema: UniqueCollectionSchemaToCreate = {
    schemaName: COLLECTION_SCHEMA_NAME.unique,
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

    name: {_:'knight test token'},

    encodedAttributes: {
        0: 0,
        1: [0]
    }
}

const assassinToken: UniqueTokenToCreate = {
    image: {
        ipfsCid: '1598284188955-497134dbc08b'
    },

    name: {_:'assassin test token'},
    description: {_:'test'},

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

        const collectionProperties = SchemaTools.encodeUnique.collectionSchema(dungeonsAndHeroesSchema)
        const tokenPropertyPermissions = SchemaTools.encodeUnique.collectionTokenPropertyPermissions(dungeonsAndHeroesSchema)
        const knightTokenProperties = SchemaTools.encodeUnique.token(knightToken, dungeonsAndHeroesSchema)


        const assassinTokenProperties = SchemaTools.encodeUnique.token(assassinToken, dungeonsAndHeroesSchema)
        const wizardTokenProperties = SchemaTools.encodeUnique.token(wizardToken, dungeonsAndHeroesSchema)
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
                owner: Address.to.crossAccountId(keyring1.address),
                properties: [
                    { key: 'n',   value: 'knight (valid token)' },
                    { key: 'a.0', value: '0'      },
                    { key: 'a.1', value: '0'      },
                    { key: 'i.c', value: '1600081522768-cb2e80ed4491' }
                ]
            },

            { // invalid value 1/3
                owner: Address.to.crossAccountId(keyring1.address),
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
                owner: Address.to.crossAccountId(keyring2.address),
                properties: [
                    { key: 'n', value: 123},
                    { key: 'a.0', value: '2' },
                    { key: 'a.1', value: '0:2' },
                    { key: 'i.c', value: '1598284188955-497134dbc08b' }
                ]
            },

            { // Valid name, invalid i.c
                owner: Address.to.crossAccountId(keyring2.address),
                properties: [
                    { key: 'n', value: 'test-token'},
                    { key: 'a.0', value: '2' },
                    { key: 'a.1', value: '0,2' },
                    { key: 'i.c', value: '{invalid: image}' }
                ]
            },

            { // invalid v.c
                owner: Address.to.crossAccountId(keyring2.address),
                properties: [
                    { key: 'n', value: 'test-token'},
                    { key: 'a.0', value: '2' },
                    { key: 'a.1', value: '0,2' },
                    { key: 'v.c', value: '{invalid: video}' },
                    { key: 'i.c', value: '1598284188955-497134dbc08b' }
                ]
            },

            { // invalid so.c
                owner: Address.to.crossAccountId(keyring2.address),
                properties: [
                    { key: 'n', value: 'test-token'},
                    { key: 'a.0', value: '2' },
                    { key: 'a.1', value: '0,2' },
                    { key: 'so.c', value: '{invalid: spatial object}' },
                    { key: 'i.c', value: '1598284188955-497134dbc08b' }
                ]
            },

            { // Valid name, invalid i.c
                owner: Address.to.crossAccountId(keyring2.address),
                properties: [
                    { key: 'n', value: 'test-token'},
                    { key: 'a.0', value: '2' },
                    { key: 'a.1', value: '0,2' },
                    { key: 'i.c', value: '[invalid, image]' }
                ]
            },

            { // invalid v.c
                owner: Address.to.crossAccountId(keyring2.address),
                properties: [
                    { key: 'n', value: 'test-token'},
                    { key: 'a.0', value: '2' },
                    { key: 'a.1', value: '0,2' },
                    { key: 'v.c', value: '[invalid, video]' },
                    { key: 'i.c', value: '1598284188955-497134dbc08b' }
                ]
            },

            { // invalid so.c
                owner: Address.to.crossAccountId(keyring2.address),
                properties: [
                    { key: 'n', value: 'test-token'},
                    { key: 'a.0', value: '2' },
                    { key: 'a.1', value: '0,2' },
                    { key: 'so.c', value: '[invalid, spatial object]' },
                    { key: 'i.c', value: '1598284188955-497134dbc08b' }
                ]
            },

            { // invalid a.1: empty value
                owner: Address.to.crossAccountId(keyring2.address),
                properties: [
                    { key: 'n', value: 'test-token'},
                    { key: 'a.0', value: '2' },
                    { key: 'a.1', value: '' },
                    { key: 'i.c', value: '1598284188955-497134dbc08b' }
                ]
            },

            { // invalid a.1: string instead of string of numbers
                owner: Address.to.crossAccountId(keyring2.address),
                properties: [
                    { key: 'n', value: 'test-token'},
                    { key: 'a.0', value: '2' },
                    { key: 'a.1', value: 'asdf' },
                    { key: 'i.c', value: '1598284188955-497134dbc08b' }
                ]
            },

            { // invalid a.1: object
                owner: Address.to.crossAccountId(keyring2.address),
                properties: [
                    { key: 'n', value: 'test-token'},
                    { key: 'a.0', value: '2' },
                    { key: 'a.1', value: '{simple: object}' },
                    { key: 'i.c', value: '1598284188955-497134dbc08b' }
                ]
            },

            { // invalid n: empty
                owner: Address.to.crossAccountId(keyring2.address),
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

        const getCollectionRes = await chain.getCollection(collectionId)

        expect(getCollectionRes?.uniqueSchema).toBeDefined()
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
        const getTokenRes = await chain.getToken(collectionId, 1)

        const expectedProperties = [
            { key: 'n',   value: 'knight (valid token)' },
            { key: 'a.0', value: '0'      },
            { key: 'a.1', value: '0'      },
            { key: 'i.c', value: '1600081522768-cb2e80ed4491' }
        ]

        const expectedOwner = Address.to.crossAccountId(keyring1.address)

        expect(
            getTokenRes?.properties.sort((a, b) => a.key > b.key ? 1 : -1)
        ).toStrictEqual(expectedProperties.sort((a, b) => a.key > b.key ? 1 : -1))

        expect(getTokenRes?.owner).toStrictEqual(expectedOwner)
        expect(getTokenRes?.uniqueToken).toBeDefined()
    })

    test('invalid value a.0 == 1/3', async () => {
        const {chain, collectionId, decodedSchema} = context!
        const getTokenRes = await chain.getToken(collectionId, 2)

        expect(getTokenRes?.uniqueToken).not.toBeDefined()
    })

    test('invalid value a.1 == 1:3', async () => {
        const {chain, collectionId, decodedSchema} = context!
        const getTokenRes = await chain.getToken(collectionId, 3, decodedSchema)

        expect(getTokenRes?.uniqueToken).not.toBeDefined()
    })

    test('invalid i.c: object', async () => {
        const {chain, collectionId, decodedSchema} = context!
        const getTokenRes = await chain.getToken(collectionId, 4, decodedSchema)

        expect(getTokenRes?.uniqueToken.isValid).toBe(false)
    })

    test('invalid v.c: object', async () => {
        const {chain, collectionId, decodedSchema} = context!
        const getTokenRes = await chain.getToken(collectionId, 5, decodedSchema)

        expect(getTokenRes?.uniqueToken.isValid).toBe(false)
    })

    test('invalid so.c: object', async () => {
        const {chain, collectionId, decodedSchema} = context!
        const getTokenRes = await chain.getToken(collectionId, 6, decodedSchema)

        expect(getTokenRes?.uniqueToken.isValid).toBe(false)
    })

    test('invalid i.c: array', async () => {
        const {chain, collectionId, decodedSchema} = context!
        const getTokenRes = await chain.getToken(collectionId, 7, decodedSchema)

        expect(getTokenRes?.uniqueToken.isValid).toBe(false)
    })

    test('invalid v.c: array', async () => {
        const {chain, collectionId, decodedSchema} = context!
        const getTokenRes = await chain.getToken(collectionId, 8, decodedSchema)

        expect(getTokenRes?.uniqueToken.isValid).toBe(false)
    })

    test('invalid so.c: array', async () => {
        const {chain, collectionId, decodedSchema} = context!
        const getTokenRes = await chain.getToken(collectionId, 9, decodedSchema)

        expect(getTokenRes?.uniqueToken.isValid).toBe(false)
    })

    test('empty a.1 value', async () => {
        const {chain, collectionId, decodedSchema} = context!
        const getTokenRes = await chain.getToken(collectionId, 10, decodedSchema)

        expect(getTokenRes?.uniqueToken.isValid).toBe(false)
    })

    test('invalid a.1: string instead of string of numbers', async () => {
        const {chain, collectionId, decodedSchema} = context!
        const getTokenRes = await chain.getToken(collectionId, 11, decodedSchema)

        expect(getTokenRes?.uniqueToken.isValid).toBe(false)
    })

    test('invalid a.1: object', async () => {
        const {chain, collectionId, decodedSchema} = context!
        const getTokenRes = await chain.getToken(collectionId, 12, decodedSchema)

        expect(getTokenRes?.uniqueToken.isValid).toBe(false)
    })

    test('invalid n: empty', async () => {
        const {chain, collectionId, decodedSchema} = context!
        const getTokenRes = await chain.getToken(collectionId, 13, decodedSchema)

        expect(getTokenRes?.uniqueToken.isValid).toBe(false)
    })
})
