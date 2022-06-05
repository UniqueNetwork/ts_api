import {PropertiesArray} from '../types'

export const SEPARATOR = '--'

export const convertNestedObjectToPropertyArray = <T extends object>(obj: T, separator: string, prefix?: string): PropertiesArray => {
  let collectionProperties: PropertiesArray = []

  if (typeof obj !== 'object' || obj === null) {
    collectionProperties.push({
      key: prefix || '',
      value: obj as any
    })
  }
  for (const key in obj) {
    const value = obj[key]
    const prefixedKey = prefix ? `${prefix}${separator}${key}` : key

    if (typeof value === 'object' && value !== null) {
      if (value instanceof Map || value instanceof Set) {
        throw new Error('Map and Set are prohibited in properties')
      } else if (Array.isArray(value)) {
        for (let i = 0; i < value.length; i++) {
          collectionProperties = collectionProperties.concat(
            convertNestedObjectToPropertyArray(value[i] as any, separator, prefixedKey + `${separator}${i}`)
          )
        }
      } else {
        collectionProperties = collectionProperties.concat(
          convertNestedObjectToPropertyArray(value as any, separator, prefixedKey)
        )
      }
    } else {
      collectionProperties.push({
        key: prefixedKey,
        value: value as any
      })
    }
  }
  return collectionProperties
}

export const convertPropertyArrayToNestedObject = <T extends object>(arr: PropertiesArray, separator: string): T => {
  const obj: any = {}
  for (let {key, value} of arr) {
    const keyParts = key.split(separator)
    const length = keyParts.length
    if (length === 1) {
      obj[key] = value
    } else {
      let objLevel = obj
      for (let i = 0; i < length; i++) {
        const isLast = i === length - 1
        const keyPart = keyParts[i]

        if (isLast) {
          objLevel[keyPart] = value
        } else {
          if (!objLevel[keyPart]) {
            const isArray = !isNaN(parseInt(keyParts[i + 1]))
            objLevel[keyPart] = isArray ? [] : {}
          }
          objLevel = objLevel[keyPart]
        }
      }

    }
  }
  return obj as T
}

export const converters = {
  objectToProperties: <T extends object>(obj: T): PropertiesArray => {
    return convertNestedObjectToPropertyArray(obj, SEPARATOR)
  },
  propertiesToObject: <T extends object>(arr: PropertiesArray): T => {
    return convertPropertyArrayToNestedObject(arr, SEPARATOR)
  }
}
