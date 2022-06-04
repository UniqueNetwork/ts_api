import {CollectionProperties} from "../substrate/extrinsics/unique/types";

export const convertNestedObjectToPropertyArray = <T extends object>(obj: T, prefix?: string): CollectionProperties => {
  let collectionProperties: CollectionProperties = []
  for (const key in obj) {
    const value = obj[key]
    const prefixedKey = prefix ? `${prefix}--${key}` : key

    if (typeof value === 'object' && value !== null) {
      if (Array.isArray(value)) {
        throw new Error('Unimplemented')
      } else {
        collectionProperties = collectionProperties.concat(convertNestedObjectToPropertyArray(value as any, prefixedKey))
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

export const convertPropertyArrayToNestedObject = <T>(arr: CollectionProperties): T => {
  const obj: any = {}
  for (let {key, value} of arr) {
    const keyLevels = key.split('--')
    const length = keyLevels.length
    if (length === 1) {
      obj[key] = value
    } else {
      let objLevel = obj
      for (let i = 0; i < length; i++) {
        const isLast = i === length - 1
        const key = keyLevels[i]
        if (isLast) {
          objLevel[key] = value
        } else {
          if (!objLevel[key]) objLevel[key] = {}
          objLevel = objLevel[key]
        }
      }

    }
  }
  return obj as T
}
