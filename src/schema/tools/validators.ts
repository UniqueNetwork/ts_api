import {Semver} from '../../utils/semver'
import {
  AttributeKind,
  AttributeSchema,
  AttributeType,
  COLLECTION_SCHEMA_NAME,
  CollectionAttributes,
  CollectionSchemaSuper,
  LocalizedStringDictionary,
  UrlOrInfixUrlWithHash
} from "../types";
import {getEnumValues, getKeys, getValues} from "../../tsUtils";
import {
  CollectionTokenPropertyPermissions,
  TokenPropertyPermissionObject
} from "../../substrate/extrinsics/unique/types";


const POSSIBLE_ATTRIBUTE_TYPES = getEnumValues(AttributeType)
const POSSIBLE_ATTRIBUTE_KINDS = getEnumValues(AttributeKind)


const RGB_REGEX = /^#?[A-Fa-f0-9]{6}$/
const RGBA_REGEX = /^#?[A-Fa-f0-9]{8}$/

//
// common validators
//

const isPlainObject = (obj: any, minKeys?: number): obj is Object => {
  const isObj = (
    typeof obj === `object` &&
    !(obj === null || obj instanceof Map || obj instanceof Set || Array.isArray(obj))
  )

  return isObj && (typeof minKeys !== 'number' || getKeys(obj).length >= minKeys)
}

const isIntegerNumber = (num: any): num is number => {
  return typeof num === 'number' && !isNaN(num)
}

const isValidAttributeKey = (num: string | number | symbol): boolean => {
  if (typeof num === 'number') {
    return num === Math.round(num)
  } else if (typeof num === 'string') {
    return !isNaN(parseInt(num))
  } else {
    return false
  }
}

const LANG_REGEX = /^[a-z]{2}(-[A-Z]{2})?$/
const validateLangCode = (key: string | number | symbol): boolean => {
  return typeof key === 'string' && !!key.match(LANG_REGEX)
}

const isValidURL = (url: string): boolean => {
  if (typeof url !== 'string') {
    return false
  }

  try {
    new URL(url)
    return true
  } catch (err) {
    return false
  }
}

const validateLocalizedStringDictionary = (dict: any): dict is LocalizedStringDictionary => {
  return (
    isPlainObject(dict, 1) &&
    getKeys(dict).every(validateLangCode) &&
    getValues(dict).every(value => typeof value === 'string')
  )
}

const validateUrlTemplateString = (str: any): str is string => {
  return typeof str === 'string' && str.indexOf('{infix}') >= 0
}

export const validateUrlWithHashObject = (obj: any): obj is UrlOrInfixUrlWithHash => {
  return (
    isPlainObject(obj) &&
    (
      typeof obj.urlInfix === 'string' ||
      (typeof obj.url === 'string' && isValidURL(obj.url))
    ) &&
    (!obj.hasOwnProperty('hash') || typeof obj.hash === 'string')
  )
}

export const validateStringField = <T extends object>(obj: T, key: keyof T, optional?: boolean): boolean => {
  if (!isPlainObject(obj)) {
    return false
  }

  if (optional) {
    return !obj.hasOwnProperty(key) || typeof obj[key] === 'string'
  } else {
    return obj.hasOwnProperty(key) && typeof obj[key] === 'string'
  }
}

export const validateSingleTokenPropertyPermission = (tpp: any): tpp is TokenPropertyPermissionObject => {
  return (
    isPlainObject(tpp) &&
    typeof tpp.key === 'string' &&
    isPlainObject(tpp.permission) &&
    typeof tpp.permission.mutable === 'boolean' &&
    typeof tpp.permission.collectionAdmin === 'boolean' &&
    typeof tpp.permission.tokenOwner === 'boolean'
  )
}

export const validateCollectionTokenPropertyPermissions = (tpps: any): tpps is CollectionTokenPropertyPermissions => {
  return (
    Array.isArray(tpps) &&
    tpps.every(validateSingleTokenPropertyPermission)
  )
}


//
// collection validators
//

export const validateValueVsAttributeType = (value: any, type: AttributeType): value is typeof type => {
  //number types
  const valueShouldBeNumber = [
    AttributeType.integer,
    AttributeType.float,
    AttributeType.timestamp,
    AttributeType.boolean,
  ].includes(type)

  if (valueShouldBeNumber) {
    if (typeof value !== "number") {
      return false
    }
    if ([AttributeType.integer, AttributeType.timestamp].includes(type)) {
      return value === Math.round(value)
    }
    if (type === AttributeType.boolean) {
      return (value === 0 || value === 1)
    }
  }

  //string (exact "string") type
  // string can be a string or an object (dictionary)
  if (type === AttributeType.string) {
    return (
      (typeof value === "string") ||
      validateLocalizedStringDictionary(value)
    )
  }


  // all other types are deriving from string (isoDate and so on)

  if (typeof value !== "string") {
    return false
  }

  if (type === AttributeType.isoDate && isNaN(new Date(value).valueOf())) {
    return false
  }

  if (type === AttributeType.time && isNaN(new Date('1970-01-01T' + value).valueOf())) {
    return false
  }

  if (type === AttributeType.colorRgba) {
    return !!value.match(RGB_REGEX) || !!value.match(RGBA_REGEX)
  }


  return true
}

export const validateAttributesSchemaSingleAttribute = (attr: any): attr is AttributeSchema => {
  if (
    !isPlainObject(attr) ||
    (typeof attr.name !== 'string' || !validateLocalizedStringDictionary(attr.name)) ||
    (attr.optional && typeof attr.optional !== "boolean") ||
    (typeof attr.type !== "number" || !POSSIBLE_ATTRIBUTE_TYPES.includes(attr.type)) ||
    (typeof attr.kind !== "number" || !POSSIBLE_ATTRIBUTE_KINDS.includes(attr.kind)) ||
    (
      attr.type === AttributeType.localizedStringDictionaryIndex &&
      attr.hasOwnProperty('defaultLocale') &&
      !validateLangCode(attr.defaultLocale)
    )
  ) {
    return false
  }

  if ([AttributeKind.enum, AttributeKind.enumMultiple].includes(attr.kind)) {
    return Array.isArray(attr.values) && attr.values.every((keyValueObj: any) => {
      if (
        !isPlainObject(keyValueObj) ||
        typeof keyValueObj.number !== "number" ||
        !keyValueObj.hasOwnProperty('value')
      ) {
        return false
      }
      return validateValueVsAttributeType(keyValueObj.value, attr.type)
    })
  }

  return attr.kind === AttributeKind.freeValue
}

export const validateCollectionAttributes = (attributes: any): attributes is CollectionAttributes => {
  return (
    isPlainObject(attributes) &&
    getKeys(attributes).every(isValidAttributeKey) &&
    getValues(attributes).every(validateAttributesSchemaSingleAttribute)
  )
}

export const validateCollectionSchema = <C extends CollectionSchemaSuper>(schema: any): schema is C => {
  const areCommonFieldsOk: boolean = (
    isPlainObject(schema) &&
    schema.schemaName === COLLECTION_SCHEMA_NAME &&
    Semver.isValid(schema.schemaVersion) &&
    validateUrlTemplateString(schema.imageUrlTemplate) &&
    validateUrlWithHashObject(schema.coverImage) &&
    (
      !schema.hasOwnProperty('coverImagePreview') ||
      validateUrlWithHashObject(schema.coverImagePreview)
    ) &&
    Semver.isValid(schema.attributesSchemaVersion) &&
    isIntegerNumber(schema.nextAttributeId) &&
    validateCollectionAttributes(schema.attributes)
  )
  if (!areCommonFieldsOk) {
    return false
  }

  const currentMaxAttributeId = Math.max(...getKeys(schema.attributes).map(key => parseInt(key as any)))
  if (schema.nextAttributeId <= currentMaxAttributeId) {
    return false
  }

  const version = Semver.fromString(schema.schemaVersion)


  if (
    schema.hasOwnProperty('video') &&
    (
      !isPlainObject(schema.video) ||
      !validateUrlTemplateString(schema.video.urlTemplate)
    )
  ) {
    return false
  }

  if (
    schema.hasOwnProperty('audio') &&
    (
      !isPlainObject(schema.audio) ||
      !validateUrlTemplateString(schema.audio.urlTemplate) ||
      typeof schema.audio.format !== 'string' ||
      (
        schema.hasOwnProperty('isLossless') &&
        typeof schema.audio.isLossless !== 'boolean'
      )
    )
  ) {
    return false
  }


  if (
    schema.hasOwnProperty('audio') &&
    (
      !isPlainObject(schema.object3D) ||
      !validateUrlTemplateString(schema.object3D.urlTemplate) ||
      typeof schema.object3D.format !== 'string'
    )
  ) {
    return false
  }


  return true
}

//
// token validators
//

export const validateToken = <T, C extends CollectionSchemaSuper>(token: any, collectionSchema: C): token is T => {
  if (collectionSchema.schemaName !== COLLECTION_SCHEMA_NAME) {
    return false
  }

  const version = Semver.fromString(collectionSchema.schemaVersion)
  const isOk = (
    validateStringField(token, 'name', true) &&
    validateStringField(token, 'description', true) &&
    validateUrlWithHashObject(token.image) &&
    (
      !token.hasOwnProperty('imagePreview') ||
      validateUrlWithHashObject(token.imagePreview)
    )
  )
  if (isOk) {
    return false
  }
  if (token.attributes) {
    if (!isPlainObject(token.attributes) || !getKeys(token.attributes).every(isValidAttributeKey)) {
      return false
    }
    for (let key in token.attributes) {
      const attr = token.attributes[key]
      if (!(key in collectionSchema.attributes)) {
        return false
      }
      const schema = collectionSchema.attributes[key as any as number]
      if (schema.kind === AttributeKind.freeValue) {
        validateValueVsAttributeType(attr, schema.type)
      } else if ([AttributeKind.enum, AttributeKind.enumMultiple].includes(schema.kind)) {
        const numbers = schema.kind === AttributeKind.enumMultiple ? attr : [attr]
        if (!Array.isArray(numbers) || !numbers.every(isIntegerNumber)) {
          return false
        }
        return numbers.every(num => !!schema.values?.findIndex(({number}) => number === num))
      } else {
        return false
      }
    }
  }

  if (collectionSchema.hasOwnProperty('video')) {
    if (token.hasOwnProperty('video') && !validateUrlWithHashObject(token.video)) {
      return false
    }
  }

  if (collectionSchema.hasOwnProperty('audio')) {
    if (token.hasOwnProperty('audio') && !validateUrlWithHashObject(token.audio)) {
      return false
    }
  }

  if (collectionSchema.hasOwnProperty('object3D')) {
    if (token.hasOwnProperty('object3D') && !validateUrlWithHashObject(token.object3D)) {
      return false
    }
  }

  return true
}
