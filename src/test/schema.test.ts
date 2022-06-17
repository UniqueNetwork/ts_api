import {describe, test, expect} from 'vitest'
import {converters2Layers} from "../schema/schemaUtils";


describe('schema', async () => {
  const nestedObject = {
    foo: 'a',
    bar: 1,
    arr: [1, {foo: [{bar: 'baz'}]}],
    baz: {
      foo: {
        bar: 1,
        arr2: [
          1, 2, {bar2: 'baz'}
        ]
      }
    },
  };

  const properties = [
    { key: 'foo', value: 'a' },
    { key: 'bar', value: 1 },
    { key: 'arr--0', value: 1 },
    { key: 'arr--1--foo--0--bar', value: 'baz' },
    { key: 'baz--foo--bar', value: 1 },
    { key: 'baz--foo--arr2--0', value: 1 },
    { key: 'baz--foo--arr2--1', value: 2 },
    { key: 'baz--foo--arr2--2--bar2', value: 'baz' }
  ]


  test.concurrent('Nested object to properties', () => {
    expect(converters2Layers.objectToProperties(nestedObject)).toEqual(properties)
  })

  test.concurrent('Properties to nested object', () => {
    expect(converters2Layers.objectToProperties(nestedObject)).toEqual(properties)
  })


  test.concurrent('Duplex: object -> properties -> object', () => {
    const toProps = converters2Layers.objectToProperties(nestedObject)
    const parsedBack = converters2Layers.propertiesToObject(toProps)

    expect(nestedObject).toEqual(parsedBack)
    expect(JSON.stringify(nestedObject)).toBe(JSON.stringify(parsedBack))
  })

})
