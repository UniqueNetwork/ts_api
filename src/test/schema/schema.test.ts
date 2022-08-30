import {describe, test, expect} from 'vitest'
import { decodeUniqueCollectionFromProperties, encodeCollectionSchemaToProperties } from "../../schema/tools/collection"

import { dungeonsAndHeroesSchema } from '../samples/dungeonsAndHeroes.sample';
import {UniqueCollectionSchemaDecoded, UniqueCollectionSchemaToCreate} from "../../schema";
import {DecodingResult} from "../../schema/schemaUtils";

const testDecodedSchema = (expected: UniqueCollectionSchemaToCreate | UniqueCollectionSchemaToCreate, actual: DecodingResult<UniqueCollectionSchemaDecoded>): void => {
    const { result, error } = actual;

    expect(error).toBeFalsy();

    expect(result!.schemaName).toEqual(expected.schemaName)
    expect(result!.schemaVersion).toEqual(expected.schemaVersion)
    expect(result!.attributesSchemaVersion).toEqual(expected.attributesSchemaVersion)
    expect(result!.attributesSchema).toEqual(expected.attributesSchema)
}

describe('encode and decode unique schema', () => {
    test('Schema with attributes', async () => {
        const encoded = encodeCollectionSchemaToProperties(dungeonsAndHeroesSchema)
        const decodingResult = await decodeUniqueCollectionFromProperties(1, encoded);

        testDecodedSchema(dungeonsAndHeroesSchema, decodingResult)
    })

    test('Schema without attributes', async () => {
        const schema: UniqueCollectionSchemaToCreate = { ...dungeonsAndHeroesSchema, attributesSchema: undefined };

        const encoded = encodeCollectionSchemaToProperties(schema)
        const decodingResult = await decodeUniqueCollectionFromProperties(1, encoded);

        testDecodedSchema(schema, decodingResult)
    })
})
