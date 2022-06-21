import {describe, expect, test} from 'vitest'
import {AttributeKind, AttributeType, CollectionAttributesSchema, init, utils} from '../../index'
import {validateCollectionAttributesSchema} from '../../schema/tools/validators'

describe.concurrent('validateCollectionAttributesSchema tests:', () => {
  test('Right collection attributes', () => {
    const test_attribute: CollectionAttributesSchema = {
      '1': {
        name: {en: 'test'},
        type: AttributeType.localizedStringDictionaryIndex,
        kind: AttributeKind.enum,
        values: [
          {number: 0, value: {en: 't1'}},
          {number: 1, value: {en: 't2'}},
        ]
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
      'key1': {
        name: {en: 'test'},
        type: AttributeType.localizedStringDictionaryIndex,
        kind: AttributeKind.enum,
        values: [
          {number: 0, value: {en: 't1'}},
          {number: 1, value: {en: 't2'}},
        ]
      }
    }

    expect(() => validateCollectionAttributesSchema(test_attribute, 'testVar')).toThrowError('is not a valid number key')
  })

  //FIXME: should throw an error
  test('Key is NaN', () => {
    const nan = 0 / 0;
    const test_attribute: CollectionAttributesSchema = {}

    test_attribute[nan] = {
      name: {en: 'test'},
      type: AttributeType.localizedStringDictionaryIndex,
      kind: AttributeKind.enum,
      values: [
        {number: 0, value: {en: 't1'}},
        {number: 1, value: {en: 't2'}},
      ]
    }

    expect(() => validateCollectionAttributesSchema(test_attribute, 'testVar')).toThrowError('is not a valid number key')
  })

  test('Key is float', () => {
    const float = 22 / 7
    const test_attribute: CollectionAttributesSchema = {}

    test_attribute[float] = {
      name: {en: 'test'},
      type: AttributeType.localizedStringDictionaryIndex,
      kind: AttributeKind.enum,
      values: [
        {number: 0, value: {en: 't1'}},
        {number: 1, value: {en: 't2'}},
      ]
    }

    expect(() => validateCollectionAttributesSchema(test_attribute, 'testVar')).toThrowError('is not a valid number key')
  })

  test('attributes is number', () => {
    const test_attribute: CollectionAttributesSchema = {
      '1': 1
    }

    expect(() => validateCollectionAttributesSchema(test_attribute, 'testVar')).toThrowError('is not an object')
  })

  test('attributes is map', () => {
    const test_attribute: CollectionAttributesSchema = {
      '1': new Map()
    }

    expect(() => validateCollectionAttributesSchema(test_attribute, 'testVar')).toThrowError('should be plain object')
  })

  test('attributes is set', () => {
    const test_attribute: CollectionAttributesSchema = {
      '1': new Set()
    }

    expect(() => validateCollectionAttributesSchema(test_attribute, 'testVar')).toThrowError('should be plain object')
  })

  test('attributes is null', () => {
    const test_attribute: CollectionAttributesSchema = {
      '1': null
    }

    expect(() => validateCollectionAttributesSchema(test_attribute, 'testVar')).toThrowError('should be valid object')
  })

  test('attributes is array', () => {
    const test_attribute: CollectionAttributesSchema = {
      '1': [1, 2, 3]
    }

    expect(() => validateCollectionAttributesSchema(test_attribute, 'testVar')).toThrowError('should be plain object')
  })

  test('attributes.name empty object', () => {
    const test_attribute: CollectionAttributesSchema = {
      '1': {
        name: {},
        type: AttributeType.localizedStringDictionaryIndex,
        kind: AttributeKind.enum,
        values: [
          {number: 0, value: {en: 't1'}},
          {number: 1, value: {en: 't2'}},
        ]
      }
    }

    expect(() => validateCollectionAttributesSchema(test_attribute, 'testVar')).toThrowError('empty object')
  })

  test('attributes.name empty object', () => {
    const test_attribute: CollectionAttributesSchema = {
      '1': {
        name: {},
        type: AttributeType.localizedStringDictionaryIndex,
        kind: AttributeKind.enum,
        values: [
          {number: 0, value: {en: 't1'}},
          {number: 1, value: {en: 't2'}},
        ]
      }
    }

    expect(() => validateCollectionAttributesSchema(test_attribute, 'testVar')).toThrowError('empty object')
  })

  test('attributes.name empty object', () => {
    const test_attribute: CollectionAttributesSchema = {
      '1': {
        name: {},
        type: AttributeType.localizedStringDictionaryIndex,
        kind: AttributeKind.enum,
        values: [
          {number: 0, value: {en: 't1'}},
          {number: 1, value: {en: 't2'}},
        ]
      }
    }

    expect(() => validateCollectionAttributesSchema(test_attribute, 'testVar')).toThrowError('empty object')
  })

  test('attributes.name dict key is not a string', () => {
    const test_attribute: CollectionAttributesSchema = {
      '1': {
        name: {1: 'test'},
        type: AttributeType.localizedStringDictionaryIndex,
        kind: AttributeKind.enum,
        values: [
          {number: 0, value: {en: 't1'}},
          {number: 1, value: {en: 't2'}},
        ]
      }
    }

    expect(() => validateCollectionAttributesSchema(test_attribute, 'testVar')).toThrowError('should be a valid Language code')
  })

  test('attributes.name dict key does not match regex', () => {
    const test_attribute: CollectionAttributesSchema = {
      '1': {
        name: {'ru-RUS': 'test'},
        type: AttributeType.localizedStringDictionaryIndex,
        kind: AttributeKind.enum,
        values: [
          {number: 0, value: {en: 't1'}},
          {number: 1, value: {en: 't2'}},
        ]
      }
    }

    expect(() => validateCollectionAttributesSchema(test_attribute, 'testVar')).toThrowError('should be a valid Language code')
  })

  test('attributes.name dict key does not match regex', () => {
    const test_attribute: CollectionAttributesSchema = {
      '1': {
        name: {'ru-RUS': 'test'},
        type: AttributeType.localizedStringDictionaryIndex,
        kind: AttributeKind.enum,
        values: [
          {number: 0, value: {en: 't1'}},
          {number: 1, value: {en: 't2'}},
        ]
      }
    }

    expect(() => validateCollectionAttributesSchema(test_attribute, 'testVar')).toThrowError('should be a valid Language code')
  })

  test('attributes.optional should be boolean', () => {
    const test_attribute: CollectionAttributesSchema = {
      '1': {
        name: {en: 'test'},
        optional: 1,
        type: AttributeType.localizedStringDictionaryIndex,
        kind: AttributeKind.enum,
        values: [
          {number: 0, value: {en: 't1'}},
          {number: 1, value: {en: 't2'}},
        ]
      }
    }

    expect(() => validateCollectionAttributesSchema(test_attribute, 'testVar')).toThrowError('should be boolean')
  })

  test('attributes.type should be valid type', () => {
    const test_attribute: CollectionAttributesSchema = {
      '1': {
        name: {en: 'test'},
        type: 'wrong-type',
        kind: AttributeKind.enum,
        values: [
          {number: 0, value: {en: 't1'}},
          {number: 1, value: {en: 't2'}},
        ]
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
        values: [
          {number: 0, value: {en: 't1'}},
          {number: 1, value: {en: 't2'}},
        ]
      }
    }

    expect(() => validateCollectionAttributesSchema(test_attribute, 'testVar')).toThrowError('should be a valid attribute type')
  })

  test('attributes.kind should be valid kind', () => {
    const test_attribute: CollectionAttributesSchema = {
      '1': {
        name: {en: 'test'},
        type: AttributeType.localizedStringDictionaryIndex,
        kind: 'wrong-kind',
        values: [
          {number: 0, value: {en: 't1'}},
          {number: 1, value: {en: 't2'}},
        ]
      }
    }

    expect(() => validateCollectionAttributesSchema(test_attribute, 'testVar')).toThrowError('should be a valid attribute kind')
  })

  test('attributes.values should be array', () => {
    const test_attribute: CollectionAttributesSchema = {
      '1': {
        name: {en: 'test'},
        type: AttributeType.localizedStringDictionaryIndex,
        kind: AttributeKind.enum,
        values: 123
      }
    }

    expect(() => validateCollectionAttributesSchema(test_attribute, 'testVar')).toThrowError('is not a valid Array')
  })

  test('attributes.values key number not found', () => {
    const test_attribute: CollectionAttributesSchema = {
      '1': {
        name: {en: 'test'},
        type: AttributeType.localizedStringDictionaryIndex,
        kind: AttributeKind.enum,
        values: [
          {value: {en: 'test'}}
        ]
      }
    }

    expect(() => validateCollectionAttributesSchema(test_attribute, 'testVar')).toThrowError('number not found')
  })

  test('attributes.values typeof(number) !== number', () => {
    const test_attribute: CollectionAttributesSchema = {
      '1': {
        name: {en: 'test'},
        type: AttributeType.localizedStringDictionaryIndex,
        kind: AttributeKind.enum,
        values: [
          {number: 'a', value: {en: 'test'}}
        ]
      }
    }

    expect(() => validateCollectionAttributesSchema(test_attribute, 'testVar')).toThrowError('number should be a number')
  })

  test('attributes.values value not found', () => {
    const test_attribute: CollectionAttributesSchema = {
      '1': {
        name: {en: 'test'},
        type: AttributeType.localizedStringDictionaryIndex,
        kind: AttributeKind.enum,
        values: [
          {number: 0}
        ]
      }
    }

    expect(() => validateCollectionAttributesSchema(test_attribute, 'testVar')).toThrowError('has no field')
  })

  test('attributes.values value number type: wrong number', () => {
    const test_attribute: CollectionAttributesSchema = {
      '1': {
        name: {en: 'test'},
        type: AttributeType.integer,
        kind: AttributeKind.enum,
        values: [
          {number: 0, value: 'aaa'}
        ]
      }
    }

    expect(() => validateCollectionAttributesSchema(test_attribute, 'testVar')).toThrowError('should be a number')
  })

  test('attributes.values value boolean type: wrong number', () => {
    const test_attribute: CollectionAttributesSchema = {
      '1': {
        name: {en: 'test'},
        type: AttributeType.boolean,
        kind: AttributeKind.enum,
        values: [
          {number: 0, value: 123}
        ]
      }
    }

    expect(() => validateCollectionAttributesSchema(test_attribute, 'testVar')).toThrowError('should be a boolean')
  })

  test('attributes.values value string type: wrong isoDate', () => {
    const test_attribute: CollectionAttributesSchema = {
      '1': {
        name: {en: 'test'},
        type: AttributeType.isoDate,
        kind: AttributeKind.enum,
        values: [
          {number: 0, value: '202206:25'}
        ]
      }
    }

    expect(() => validateCollectionAttributesSchema(test_attribute, 'testVar')).toThrowError('should be a valid ISO Date')
  })

  test('attributes.values value string type: wrong time', () => {
    const test_attribute: CollectionAttributesSchema = {
      '1': {
        name: {en: 'test'},
        type: AttributeType.time,
        kind: AttributeKind.enum,
        values: [
          {number: 0, value: '1:65'}
        ]
      }
    }

    expect(() => validateCollectionAttributesSchema(test_attribute, 'testVar')).toThrowError('should be a valid time in')
  })

  test('attributes.values value string type: rgb', () => {
    const test_attribute: CollectionAttributesSchema = {
      '1': {
        name: {en: 'test'},
        type: AttributeType.colorRgba,
        kind: AttributeKind.enum,
        values: [
          {number: 0, value: '#aabbcx'}
        ]
      }
    }

    expect(() => validateCollectionAttributesSchema(test_attribute, 'testVar')).toThrowError('should be a valid rgb or rgba color')
  })

  test('attributes.values value string type: rgba', () => {
    const test_attribute: CollectionAttributesSchema = {
      '1': {
        name: {en: 'test'},
        type: AttributeType.colorRgba,
        kind: AttributeKind.enum,
        values: [
          {number: 0, value: '#aabbccdx'}
        ]
      }
    }

    expect(() => validateCollectionAttributesSchema(test_attribute, 'testVar')).toThrowError('should be a valid rgb or rgba color')
  })

  test('attributes.values value string type: rgb wrong length', () => {
    const test_attribute: CollectionAttributesSchema = {
      '1': {
        name: {en: 'test'},
        type: AttributeType.colorRgba,
        kind: AttributeKind.enum,
        values: [
          {number: 0, value: '#aabbc'}
        ]
      }
    }

    expect(() => validateCollectionAttributesSchema(test_attribute, 'testVar')).toThrowError('should be a valid rgb or rgba color')
  })

  test('attributes.values value string type: rgba wrong length', () => {
    const test_attribute: CollectionAttributesSchema = {
      '1': {
        name: {en: 'test'},
        type: AttributeType.colorRgba,
        kind: AttributeKind.enum,
        values: [
          {number: 0, value: '#aabbccdde'}
        ]
      }
    }

    expect(() => validateCollectionAttributesSchema(test_attribute, 'testVar')).toThrowError('should be a valid rgb or rgba color')
  })
})

