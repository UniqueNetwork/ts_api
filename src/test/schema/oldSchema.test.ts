import {describe, test, expect} from 'vitest'
import {decodeOldSchemaCollection} from "../../schema/tools/oldSchemaDecoder";
import {oldCollectionProperties, oldSchemaDecoded} from './oldSchema.example';


describe(decodeOldSchemaCollection.name, () => {
    test.concurrent('Nested object to properties', async () => {
        const { result } = await decodeOldSchemaCollection(
            1,
            oldCollectionProperties,
            { imageUrlTemplate: '{infix}', dummyImageFullUrl: '' },
        );

        expect(result).toBeDefined();
        expect(result!.schemaName).toEqual(oldSchemaDecoded.schemaName);
        expect(result!.schemaVersion).toEqual(oldSchemaDecoded.schemaVersion);
        expect(result!.attributesSchemaVersion).toEqual(oldSchemaDecoded.attributesSchemaVersion);
        expect(result!.attributesSchema).toEqual(oldSchemaDecoded.attributesSchema);
    })
})
