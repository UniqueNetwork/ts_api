import {Semver} from '../../utils/semver'
import {
  AttributeKind,
  AttributeSchema,
  AttributeType,
  AttributeTypeMask,
  COLLECTION_SCHEMA_NAME,
  CollectionAttributes,
  CollectionSchemaUnique,
  LocalizedStringDictionary,
  UrlOrInfixUrlWithHash
} from "../types";
import {getEnumValues, getKeys, getReversedEnum} from "../../tsUtils";
import {
  CollectionTokenPropertyPermissions,
  TokenPropertyPermissionObject
} from "../../substrate/extrinsics/unique/types";
import {ValidationError} from "../../utils/errors";


const POSSIBLE_ATTRIBUTE_TYPES = getEnumValues(AttributeType)
const POSSIBLE_ATTRIBUTE_KINDS = getEnumValues(AttributeKind)
const ATTRIBUTE_TYPE_NAME_BY_VALUE = getReversedEnum(AttributeType)
const ATTRIBUTE_KIND_NAME_BY_VALUE = getReversedEnum(AttributeKind)


const RGB_REGEX = /^#?[A-Fa-f0-9]{6}$/
const RGBA_REGEX = /^#?[A-Fa-f0-9]{8}$/


//
// common validators
//

const isPlainObject = (obj: any, varName: string): obj is Object => {
  if (typeof obj !== 'object')
    throw new ValidationError(`${varName} is not an object, got ${typeof obj}: ${obj}`)
  if (obj === null)
    throw new ValidationError(`${varName} is a null, should be valid object`)
  if (obj instanceof Map)
    throw new ValidationError(`${varName} is a Map, should be plain object`)
  if (obj instanceof Set)
    throw new ValidationError(`${varName} is a Set, should be plain object`)
  if (Array.isArray(obj))
    throw new ValidationError(`${varName} is an array, should be plain object`)

  return true
}

const validateIntegerNumber = (num: any, varName: string): num is number => {
  if (typeof num !== 'number' || isNaN(num)) {
    throw new ValidationError(`${varName} is not a valid number, got ${num}`)
  }
  return true
}

const validateAttributeKey = (num: string | number | symbol, varName: string): boolean => {
  let isOk = false

  if (typeof num === 'number') {
    isOk = num === Math.round(num)
  } else if (typeof num === 'string') {
    isOk = !isNaN(parseInt(num))
  }

  if (!isOk) {
    throw new ValidationError(`${varName}["${String(num)}"] is not a valid number key, got ${String(num)}`)
  }

  return true
}

const LANG_REGEX = /^[a-z]{2}(-[A-Z]{2})?$/
const validateLangCode = (key: string | number | symbol, varName: string): boolean => {
  if (typeof key !== 'string') {
    throw new ValidationError(`${varName}: key ${String(key)} should be a string`)
  }
  if (!key.match(LANG_REGEX)) {
    throw new ValidationError(`${varName} should be a valid Language code string (like 'co' or 'ca-ES'), got ${key}`)
  }

  return true
}

const validateURL = (url: string, varName: string): boolean => {
  if (typeof url !== 'string') {
    throw new ValidationError(`${varName} should be a string`)
  }

  try {
    new URL(url)
    return true
  } catch (err) {
    throw new ValidationError(`${varName} should be a valid URL, got ${url}`)
  }
}

export const validateAndParseSemverString = (str: string, varName: string): Semver => {
  if (!Semver.isValid(str))
    throw new ValidationError(`${varName} is not a valid semver string (passed ${str})`)

  return Semver.fromString(str)
}

const validateStringOrLocalizedStringDictionary = (dict: any, varName: string): dict is string | LocalizedStringDictionary => {
  if (typeof dict === 'string') {
    return true
  }

  isPlainObject(dict, varName)

  if (getKeys(dict).length === 0) {
    throw new ValidationError(`${varName} is an empty object, should have at least one key`)
  }
  for (const key in dict) {
    validateLangCode(key, `${varName}["${key}"]`)
    if (typeof dict[key] !== 'string') {
      throw new ValidationError(`${varName}["${key}"] should be a string, got ${typeof key}: ${key}`)
    }
  }

  return true
}

const validateUrlTemplateString = (str: any, varName: string): str is string => {
  const prefix = `TemplateUrlString is not valid, ${varName}`
  if (typeof str !== 'string')
    throw new ValidationError(`${prefix} is not a string, got ${str}`)
  if (str.indexOf('{infix}') < 0)
    throw new ValidationError(`${prefix} doesn't contain "{infix}", got ${str}`)
  return true
}

export const validateUrlWithHashObject = (obj: any, varName: string): obj is UrlOrInfixUrlWithHash => {
  isPlainObject(obj, varName)

  if (typeof obj.urlInfix !== 'string' && typeof obj.url !== 'string')
    throw new ValidationError(`${varName} should have "urlInfix" or "url" string field`)

  if (typeof obj.urlInfix === 'string' && typeof obj.url === 'string')
    throw new ValidationError(`${varName} should have only one of "urlInfix" or "url" string field`)

  if (typeof obj.url === 'string') {
    validateURL(obj.url, `${varName}.url`)
  }

  if (obj.hasOwnProperty('hash') && typeof obj.hash !== 'string')
    throw new ValidationError(`${varName}.hash should be a string`)

  return true
}

export const validateFieldByType = <T extends object>(obj: T, key: keyof T, type: string, optional: boolean, varName: string): boolean => {
  isPlainObject(obj, varName)

  if (optional) {
    if (obj.hasOwnProperty(key) && typeof obj[key] !== type) {
      throw new ValidationError(`${varName}.${String(key)} is passed and not a ${type}, got ${typeof obj[key]}: ${obj[key]}`)
    }
  } else {
    if (!obj.hasOwnProperty(key)) {
      throw new ValidationError(`${varName}.${String(key)} not found in ${varName}`)
    }
    if (typeof obj[key] !== type) {
      throw new ValidationError(`${varName}.${String(key)} should be a ${type}, got ${typeof obj[key]}: ${obj[key]}`)
    }
  }
  return true
}

export const validateSingleTokenPropertyPermission = (tpp: any, varName: string): tpp is TokenPropertyPermissionObject => {
  isPlainObject(tpp, varName)
  validateFieldByType(tpp, 'key', 'string', false, varName)

  const permissionVarName = `${varName}.permission`

  isPlainObject(tpp.permission, permissionVarName)

  validateFieldByType(tpp.permission, 'mutable', 'boolean', false, permissionVarName)
  validateFieldByType(tpp.permission, 'collectionAdmin', 'boolean', false, permissionVarName)
  validateFieldByType(tpp.permission, 'tokenOwner', 'boolean', false, permissionVarName)

  return true
}

export const validateCollectionTokenPropertyPermissions = (tpps: any, varName: string = 'tokenPropertyPermissions'): tpps is CollectionTokenPropertyPermissions => {
  if (!Array.isArray(tpps))
    throw new ValidationError(`${varName} should be an array, got ${typeof tpps}: ${tpps}`)


  tpps.forEach((tpp, index) => {
    validateSingleTokenPropertyPermission(tpp, `${varName}[${index}]`)
  })

  return true
}


//
// collection validators
//

export const validateValueVsAttributeType = (value: any, type: AttributeType, varName: string): value is typeof type => {
  console.log(ATTRIBUTE_TYPE_NAME_BY_VALUE)
  if (type & AttributeTypeMask.number) {
    if (typeof value !== "number") {
      throw new ValidationError(`${varName}: should be a number, got ${typeof value}: ${value}, type: ${type} (${ATTRIBUTE_TYPE_NAME_BY_VALUE[type]})`)
    }
    if ([AttributeType.integer, AttributeType.timestamp].includes(type) && value !== Math.round(value)) {
      throw new ValidationError(`${varName}: should be an integer number, got ${value}`)
    }
    if (type === AttributeType.boolean && ![0, 1].includes(value)) {
      throw new ValidationError(`${varName}: should be a boolean integer: 0 or 1, got ${value}`)
    }

    return true
  }

  if (type & AttributeTypeMask.object) {
    isPlainObject(value, varName)

    if (type === AttributeType.localizedStringDictionary) {
      validateStringOrLocalizedStringDictionary(value, varName)
    }

    return true
  }

  // all other types are deriving from string (isoDate and so on)
  if (type & AttributeTypeMask.string) {
    if (typeof value !== "string") {
      throw new ValidationError(`${varName}: should be a string, got ${typeof value}: ${value}`)
    }

    if (type === AttributeType.isoDate && isNaN(new Date(value).valueOf())) {
      throw new ValidationError(`${varName}: should be a valid ISO Date (YYYY-MM-DD), got ${value}`)
    }

    if (type === AttributeType.time && isNaN(new Date('1970-01-01T' + value).valueOf())) {
      throw new ValidationError(`${varName}: should be a valid time in (hh:mm or hh:mm:ss), got ${value}`)
    }

    if (type === AttributeType.colorRgba && (!value.match(RGB_REGEX) && !value.match(RGBA_REGEX))) {
      throw new ValidationError(`${varName}: should be a valid rgb or rgba color (like "#ff00ff00"), got ${value}`)
    }

    return true
  }

  throw new ValidationError(`${varName}: unknown attribute type: ${type} (${ATTRIBUTE_TYPE_NAME_BY_VALUE[type]})`)
}

export const validateAttributesSchemaSingleAttribute = (key: number, attr: any, varName: string): attr is AttributeSchema => {
  isPlainObject(attr, varName)

  validateStringOrLocalizedStringDictionary(attr.name, `${varName}.name`)

  if (attr.hasOwnProperty('optional') && typeof attr.optional !== "boolean")
    throw new ValidationError(`${varName}.optional should be boolean when passed, got ${typeof attr.optional}: ${attr.optional}`)

  if (typeof attr.type !== 'number' || !POSSIBLE_ATTRIBUTE_TYPES.includes(attr.type))
    throw new ValidationError(`${varName}.type should be a valid attribute type, got ${typeof attr.type}: ${attr.type}`)

  if (typeof attr.kind !== 'number' || !POSSIBLE_ATTRIBUTE_KINDS.includes(attr.kind))
    throw new ValidationError(`${varName}.kind should be a valid attribute kind, got ${typeof attr.kind}: ${attr.kind}`)

  if (attr.type === AttributeType.localizedStringDictionaryIndex && attr.hasOwnProperty('defaultLocale')) {
    validateLangCode(attr.defaultLocale, `${varName}.defaultLocale`)
  }

  if ([AttributeKind.enum, AttributeKind.enumMultiple].includes(attr.kind)) {
    if (!Array.isArray(attr.values))
      throw new ValidationError(`${varName}.values is not a valid Array, got ${attr.values}`)


    attr.values.forEach((keyValueObj: any, index: number) => {
      const localVarName = `${varName}.values[${index}]`

      isPlainObject(keyValueObj, localVarName)

      validateFieldByType(keyValueObj, 'number', 'number', false, localVarName)

      if (!keyValueObj.hasOwnProperty('value'))
        throw new ValidationError(`${localVarName} has no field "value"`)

      validateValueVsAttributeType(
        keyValueObj.value,
        attr.type !== AttributeType.localizedStringDictionaryIndex
          ? attr.type
          : AttributeType.localizedStringDictionary
        ,
        localVarName
      )
    })

  } else if (attr.kind !== AttributeKind.freeValue) {
    throw new ValidationError(`${varName}.kind is not known, got ${attr.kind}`)
  }

  return true
}

export const validateCollectionAttributes = (attributes: any, varName: string): attributes is CollectionAttributes => {
  isPlainObject(attributes, varName)
  for (const key in attributes) {
    validateAttributeKey(key, varName)
    validateAttributesSchemaSingleAttribute(parseInt(key), attributes[key], `${varName}["${key}"]`)
  }

  return true
}

export const validateCollectionSchema = <C extends CollectionSchemaUnique>(schema: any): schema is C => {
  isPlainObject(schema, 'Passed collection schema')

  if (schema.schemaName !== COLLECTION_SCHEMA_NAME)
    throw new ValidationError(`schemaName is not valid (passed ${schema.schemaName})`)

  const schemaVersion = validateAndParseSemverString(schema.schemaVersion, 'schemaVersion')

  validateUrlTemplateString(schema.imageUrlTemplate, 'imageUrlTemplate')

  validateUrlWithHashObject(schema.coverImage, 'coverImage')

  if (schema.hasOwnProperty('coverImagePreview')) {
    validateUrlWithHashObject(schema.coverImagePreview, 'coverImagePreview')
  }

  validateIntegerNumber(schema.nextAttributeId, 'nextAttributeId')

  const attributesSchemaVersion = validateAndParseSemverString(schema.attributesSchemaVersion, 'attributesSchemaVersion')

  validateCollectionAttributes(schema.attributes, 'attributes')

  const currentMaxAttributeId = Math.max(...getKeys(schema.attributes).map(key => parseInt(key as any)))
  if (schema.nextAttributeId <= currentMaxAttributeId) {
    throw new ValidationError(`nextAttributeId should be at least ${currentMaxAttributeId + 1}, got ${schema.nextAttributeId}`)
  }

  if (schema.hasOwnProperty('video')) {
    isPlainObject(schema.video, 'video')
    validateUrlTemplateString(schema.video.urlTemplate, 'video')
  }

  if (schema.hasOwnProperty('audio')) {
    isPlainObject(schema.audio, 'audio')
    validateUrlTemplateString(schema.audio.urlTemplate, 'audio')

    validateFieldByType(schema.audio, 'format', 'string', false, 'audio')
    validateFieldByType(schema.audio, 'isLossless', 'boolean', true, 'audio')
  }

  if (schema.hasOwnProperty('spatialObject')) {
    isPlainObject(schema.spatialObject, 'spatialObject')
    validateUrlTemplateString(schema.spatialObject.urlTemplate, 'spatialObject')

    validateFieldByType(schema.spatialObject, 'format', 'string', false, 'spatialObject')
  }

  return true
}

//
// token validators
//

const validateEnumAttributeValue = (schema: AttributeSchema, num: number, varName: string) => {
  validateIntegerNumber(num, varName)
  const enumValues = schema.values?.map(({number}) => number) || []
  if (!enumValues.some(n => n === num)) {
    throw new ValidationError(`${varName} value (${num}) not found in the attribute schema enum keys: [${enumValues.join()}]`)
  }
}

export const validateToken = <T, C extends CollectionSchemaUnique>(token: any, collectionSchema: C): token is T => {
  if (collectionSchema.schemaName !== COLLECTION_SCHEMA_NAME) {
    throw new ValidationError(`schemaName is not valid (passed ${collectionSchema.schemaName})`)
  }

  validateFieldByType(token, 'name', 'string', true, 'token')
  validateFieldByType(token, 'name', 'description', true, 'token')
  validateUrlWithHashObject(token.image, 'token.image')

  if (token.hasOwnProperty('imagePreview')) {
    validateUrlWithHashObject(token.imagePreview, 'token.imagePreview')
  }

  const version = validateAndParseSemverString(collectionSchema.schemaVersion, 'collectionSchema.schemaVersion')

  if (token.attributes) {
    isPlainObject(token.attributes, 'token.attributes')

    for (let key in collectionSchema.attributes) {
      const schema = collectionSchema.attributes[key]

      validateAttributeKey(key, 'token.attributes')
      const varName = `token.attribute.${key}`

      const attr = token.attributes[key]
      if (!schema.optional && !token.attributes.hasOwnProperty(key))
        throw new ValidationError(`${varName} should be provided, it's not optional attribute`)

      if (schema.kind === AttributeKind.freeValue) {
        validateValueVsAttributeType(attr, schema.type, varName)
      } else if (schema.kind === AttributeKind.enumMultiple) {
        if (!Array.isArray(attr))
          throw new ValidationError(`${varName} should be an array, because it's kind is enumMultiple`)

        attr.forEach((num, index) => {
          validateEnumAttributeValue(schema, num, `${varName}[${index}]`)
        })
      } else if (schema.kind === AttributeKind.enum) {
        validateEnumAttributeValue(schema, attr, varName)
      } else {
        throw new ValidationError(`${varName}: attribute schema kind is unknown: ${schema.kind}`)
      }
    }
  }

  if (collectionSchema.hasOwnProperty('video') && token.hasOwnProperty('video')) {
    validateUrlWithHashObject(token.video, 'token.video')
  }

  if (collectionSchema.hasOwnProperty('audio') && token.hasOwnProperty('audio')) {
    validateUrlWithHashObject(token.audio, 'token.audio')
  }

  if (collectionSchema.hasOwnProperty('spatialObject') && token.hasOwnProperty('spatialObject')) {
    validateUrlWithHashObject(token.spatialObject, 'token.spatialObject')
  }

  return true
}
