import {PropertiesArray} from '../types'

const convert2LayerObjectToProperties = <T extends object>(obj: T, separator: string): PropertiesArray => {
  if (typeof obj !== "object" || obj === null) {
    throw new Error(`Object is not valid: ${obj}`)
  }

  const collectionProperties: PropertiesArray = []

  for (let key in obj) {
    const value = obj[key]
    if (
      typeof value === 'object' &&
      !(value === null || value instanceof Map || value instanceof Set || Array.isArray(value))
    ) {
      for (let secondLevelKey in value) {
        const secondLevelValue = value[secondLevelKey]
        collectionProperties.push({
          key: `${key}${separator}${secondLevelKey}`,
          value: typeof secondLevelValue === 'object' ? JSON.stringify(secondLevelValue) : String(secondLevelValue)
        })
      }
    } else {
      collectionProperties.push({
        key,
        value: String(value)
      })
    }
  }

  return collectionProperties
}

export const convertPropertyArrayTo2layerObject = <T extends object>(properties: PropertiesArray, separator: string): T => {
  const obj: any = {}

  for (let {key, value} of properties) {
    const keyParts = key.split(separator)
    const length = keyParts.length
    if (length === 1) {
      obj[key] = JSON.parse(value)
    } else {
      const [key, innerKey] = keyParts
      if (typeof obj[key] !== 'object') {
        obj[key] = {}
      }
      obj[key][innerKey] = JSON.parse(value)
    }
  }
  return obj as T
}

const SEPARATOR = '.'

export const converters = {
  objectToProperties: <T extends object>(obj: T): PropertiesArray => {
    return convert2LayerObjectToProperties(obj, SEPARATOR)
  },
  propertiesToObject: <T extends object>(arr: PropertiesArray): T => {
    return convertPropertyArrayTo2layerObject(arr, SEPARATOR)
  }
}
