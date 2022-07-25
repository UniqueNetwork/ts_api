import {Semver} from '../../utils/semver'
import {
  AttributeSchema,
  AttributeType,
  AttributeTypeValues,
  BoxedNumberWithDefault,
  COLLECTION_SCHEMA_NAME,
  CollectionAttributesSchema,
  InfixOrUrlOrCidAndHash,
  IntegerAttributeTypes, LocalizedStringWithDefault,
  NumberAttributeTypes,
  StringAttributeTypes, UniqueCollectionSchemaDecoded,
  UniqueCollectionSchemaToCreate,
  URL_TEMPLATE_INFIX,
  UrlTemplateString,
} from "../types";
import {getKeys} from "../../tsUtils";
import {
  CollectionTokenPropertyPermissions,
  TokenPropertyPermissionObject
} from "../../substrate/extrinsics/unique/types";
import {ValidationError} from "../../utils/errors";

const RGB_REGEX = /^#[A-Fa-f0-9]{6}$/
const RGBA_REGEX = /^#[A-Fa-f0-9]{8}$/


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

const validateNumber = (num: any, shouldBeInteger: boolean, varName: string): num is number => {
  if (typeof num !== 'number' || isNaN(num)) {
    throw new ValidationError(`${varName} is not a valid number, got ${num}`)
  }
  if (shouldBeInteger && num !== Math.round(num)) {
    throw new ValidationError(`${varName} is not an integer number, got ${num}`)
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

export const validateURL = (url: string, varName: string): boolean => {
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

export const validateLocalizedStringWithDefault = (dict: any, canHaveLocalization: boolean, varName: string): dict is LocalizedStringWithDefault => {
  isPlainObject(dict, varName)

  const keys = getKeys(dict)

  if (keys.length === 0) {
    throw new ValidationError(`${varName} is an empty object, should have at least one key`)
  }

  if (!dict.hasOwnProperty('_')) {
    throw new ValidationError(`${varName} is doesn't contain field "_"`)
  }

  if (typeof dict._ !== 'string') {
    throw new ValidationError(`${varName}._ is not a string`)
  }

  if (!canHaveLocalization && keys.length !== 1) {
    throw new ValidationError(`${varName} cannot have localization strings, got object with keys ["${keys.join('", "')}"]`)
  }

  for (const key in dict) {
    if (key === '_') continue

    validateLangCode(key, `${varName}["${key}"]`)
    if (typeof dict[key] !== 'string') {
      throw new ValidationError(`${varName}["${key}"] should be a string, got ${typeof key}: ${key}`)
    }
  }

  return true
}

export const validateBoxedNumberWithDefault = (dict: BoxedNumberWithDefault, shouldBeInteger: boolean, varName: string): dict is BoxedNumberWithDefault => {
  isPlainObject(dict, varName)

  if (getKeys(dict).length === 0) {
    throw new ValidationError(`${varName} is an empty object, should have at least one key`)
  }

  if (!dict.hasOwnProperty('_')) {
    throw new ValidationError(`${varName} is doesn't contain field "_"`)
  }

  validateNumber(dict._, shouldBeInteger, `${varName}._`)

  for (const key in dict) {
    if (key === '_') continue
  }

  return true
}

export const validateUrlTemplateString = (str: any, varName: string): str is UrlTemplateString => {
  const prefix = `TemplateUrlString is not valid, ${varName}`
  if (typeof str !== 'string')
    throw new ValidationError(`${prefix} is not a string, got ${str}`)
  if (str.indexOf(URL_TEMPLATE_INFIX) < 0)
    throw new ValidationError(`${prefix} doesn't contain "${URL_TEMPLATE_INFIX}", got ${str}`)
  return true
}

export const validateUrlWithHashObject = (obj: any, varName: string): obj is InfixOrUrlOrCidAndHash => {
  isPlainObject(obj, varName)

  const keysAmount = ['urlInfix', 'url', 'ipfsCid']
    .map(field => Number(typeof obj[field] === 'string'))
    .reduce((prev, curr) => {
      return prev + curr
    }, 0)

  if (keysAmount !== 1) {
    throw new ValidationError(`${varName} should have one and only one of "urlInfix" or "url" or "ipfsCid" string fields, got ${JSON.stringify(obj)}`)
  }

  if (typeof obj.url === 'string') {
    validateURL(obj.url, `${varName}.url`)
  }

  if (obj.hasOwnProperty('hash'))
    validateFieldByType(obj, 'hash', 'string', false, varName)

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
  isPlainObject(value, varName)

  if (NumberAttributeTypes.includes(type)) {
    const shouldBeInteger = IntegerAttributeTypes.includes(type)
    validateBoxedNumberWithDefault(value, shouldBeInteger, varName)
    if (type === AttributeType.boolean && ![0, 1].includes(value._)) {
      throw new ValidationError(`${varName}: should be a boolean integer: 0 or 1, got ${value._}`)
    }

    return true
  }

  if (StringAttributeTypes.includes(type)) {
    const canHaveLocalization = type === AttributeType.string
    validateLocalizedStringWithDefault(value, canHaveLocalization, varName)

    if (type === AttributeType.isoDate && isNaN(new Date(value._).valueOf())) {
      throw new ValidationError(`${varName}: should be a valid ISO Date (YYYY-MM-DD), got ${value._}`)
    }

    if (type === AttributeType.time && isNaN(new Date('1970-01-01T' + value._).valueOf())) {
      throw new ValidationError(`${varName}: should be a valid time in (hh:mm or hh:mm:ss), got ${value._}`)
    }

    if (type === AttributeType.colorRgba && (!value._.match(RGB_REGEX) && !value._.match(RGBA_REGEX))) {
      throw new ValidationError(`${varName}: should be a valid rgb or rgba color (like "#ff00ff00"), got ${value._}`)
    }

    return true
  }

  throw new ValidationError(`${varName}: unknown attribute type: ${type}`)
}

export const validateAttributesSchemaSingleAttribute = (attr: AttributeSchema, varName: string): attr is AttributeSchema => {
  isPlainObject(attr, varName)

  validateLocalizedStringWithDefault(attr.name, true,`${varName}.name`)

  if (attr.hasOwnProperty('optional') && typeof attr.optional !== 'boolean')
    throw new ValidationError(`${varName}.optional should be boolean when passed, got ${typeof attr.optional}: ${attr.optional}`)

  if (attr.hasOwnProperty('isArray') && typeof attr.isArray !== 'boolean') {
    throw new ValidationError(`${varName}.optional should be boolean when passed, got ${typeof attr.optional}: ${attr.optional}`)
  }

  if (!AttributeTypeValues.includes(attr.type))
    throw new ValidationError(`${varName}.type should be a valid attribute type, got ${typeof attr.type}: ${attr.type}`)

  if (attr.hasOwnProperty('enumValues')) {
    isPlainObject(attr.enumValues, `${varName}.enumValues`)

    for (const key in attr.enumValues) {
      const localVarName = `${varName}.enumValues[${key}]`
      const intKey = parseInt(key)
      validateNumber(intKey, true, localVarName)

      validateValueVsAttributeType(
        attr.enumValues[intKey],
        attr.type,
        localVarName
      )
    }
  }

  return true
}

export const validateCollectionAttributesSchema = (attributes: any, varName: string): attributes is CollectionAttributesSchema => {
  isPlainObject(attributes, varName)
  for (const key in attributes) {
    validateAttributeKey(key, varName)
    validateAttributesSchemaSingleAttribute(attributes[key], `${varName}["${key}"]`)
  }

  return true
}

export const validateUniqueCollectionSchema = <C extends UniqueCollectionSchemaToCreate>(schema: any): schema is C => {
  isPlainObject(schema, 'Passed collection schema')

  if (schema.schemaName !== COLLECTION_SCHEMA_NAME.unique)
    throw new ValidationError(`schemaName is not valid (passed ${schema.schemaName})`)

  const schemaVersion = validateAndParseSemverString(schema.schemaVersion, 'schemaVersion')

  validateUrlWithHashObject(schema.coverPicture, 'coverPicture')

  if (schema.hasOwnProperty('coverPicturePreview')) {
    validateUrlWithHashObject(schema.coverPicturePreview, 'coverPicturePreview')
  }

  const attributesSchemaVersion = validateAndParseSemverString(schema.attributesSchemaVersion, 'attributesSchemaVersion')

  validateCollectionAttributesSchema(schema.attributesSchema, 'attributesSchema')

  isPlainObject(schema.image, 'image')
  validateUrlTemplateString(schema.image.urlTemplate, 'image')

  if (schema.hasOwnProperty('imagePreview')) {
    isPlainObject(schema.video, 'video')
    validateUrlTemplateString(schema.video.urlTemplate, 'video')
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

const validateAttributeEnumKey = (schema: AttributeSchema, num: number, varName: string) => {
  validateNumber(num, true, varName)
  const enumKeys = getKeys(schema.enumValues || {}).map(n => parseInt(n as any as string))
  if (!enumKeys.includes(num)) {
    throw new ValidationError(`${varName} value (${num}) not found in the attribute schema enum keys: [${enumKeys.join()}]`)
  }
}

export const validateUniqueToken = <T, C extends UniqueCollectionSchemaToCreate | UniqueCollectionSchemaDecoded>(token: any, collectionSchema: C): token is T => {
  if (collectionSchema.schemaName !== COLLECTION_SCHEMA_NAME.unique) {
    throw new ValidationError(`schemaName is not "unique" (passed ${collectionSchema.schemaName})`)
  }
  validateFieldByType(token, 'name', 'string', true, 'token')
  validateFieldByType(token, 'description', 'string', true, 'token')
  validateUrlWithHashObject(token.image, 'token.image')

  if (token.hasOwnProperty('imagePreview')) {
    validateUrlWithHashObject(token.imagePreview, 'token.imagePreview')
  }

  const schemaVersion = validateAndParseSemverString(collectionSchema.schemaVersion, 'collectionSchema.schemaVersion')

  if (token.encodedAttributes) {
    isPlainObject(token.encodedAttributes, 'token.encodedAttributes')

    for (let key in collectionSchema.attributesSchema) {
      const schema = collectionSchema.attributesSchema[key]

      validateAttributeKey(key, 'token.encodedAttributes')
      const varName = `token.encodedAttributes.${key}`

      const attr = token.encodedAttributes[key]

      if (!schema.optional && !token.encodedAttributes.hasOwnProperty(key))
        throw new ValidationError(`${varName} should be provided, it's not optional attribute`)

      if (schema.isArray && !Array.isArray(attr)) {
        throw new ValidationError(`${varName} is not array, while schema requires an array`)
      }
      if (!schema.isArray && Array.isArray(attr)) {
        throw new ValidationError(`${varName} is an array, while schema requires to be not an array`)
      }

      const attrs = schema.isArray ? attr : [attr]

      if (schema.enumValues) {
        attrs.forEach((num: any, index: number) => {
          validateAttributeEnumKey(schema, num, `${varName}[${index}]`)
        })
      } else {
        attrs.forEach((attrElem: any, index: number) => {
          validateValueVsAttributeType(attrElem, schema.type, `${varName}[${index}]`)
        })
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

export const checkSafeFactory = <T extends (...args: any) => any>(fn: T) => {
  const returnFn = (...params: Parameters<T>) => {
    try {
      return fn(...params as any)
    } catch {
      return false as ReturnType<T>
    }
  }
  return returnFn as T
}

export const validateUrlTemplateStringSafe = checkSafeFactory(validateUrlTemplateString)
export const validateURLSafe = checkSafeFactory(validateURL)
export const validateLocalizedStringWithDefaultSafe = checkSafeFactory(validateLocalizedStringWithDefault)
