import {Semver} from '../utils/semver'
import {
  AttributeKind,
  AttributeSchema,
  AttributesSchema,
  AttributeType, COLLECTION_SCHEMA_FAMILY_NAME, COLLECTION_SCHEMA_TYPE_NAME,
  CollectionSchemaBasic, Image,
  LocalizedStringDictionary
} from "./types";
import {getEnumValues, getKeys, getValues} from "../tsUtils";


const POSSIBLE_ATTRIBUTE_TYPES = getEnumValues(AttributeType)
const POSSIBLE_ATTRIBUTE_KINDS = getEnumValues(AttributeKind)
const POSSIBLE_SCHEMA_TYPE_NAMES = getEnumValues(COLLECTION_SCHEMA_TYPE_NAME)

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
    typeof dict === 'object' &&
    getKeys(dict).length > 0 &&
    getKeys(dict).every(validateLangCode) &&
    getValues(dict).every(value => typeof value === 'string')
  )
}

export const validateAttributesSchemaSingleAttribute = (attr: any): attr is AttributeSchema => {
  if (
    typeof attr !== 'object' ||
    (typeof attr.name !== 'string' || !validateLocalizedStringDictionary(attr.name)) ||
    (attr.optional && typeof attr.optional !== "boolean") ||
    (typeof attr.type !== "number" || !POSSIBLE_ATTRIBUTE_TYPES.includes(attr.type)) ||
    (typeof attr.kind !== "number" || !POSSIBLE_ATTRIBUTE_KINDS.includes(attr.kind))
  ) {
    return false
  }

  if ([AttributeKind.enum, AttributeKind.enumMultiple].includes(attr.kind)) {
    const valueShouldBeNumber = [
      AttributeType.integer,
      AttributeType.float,
      AttributeType.timestamp,
      AttributeType.boolean,
    ].includes(attr.type)
    const valueMayBeDictionary = [
      AttributeType.string
    ].includes(attr.type)

    if (
      valueMayBeDictionary &&
      attr.hasOwnProperty('defaultLocale') &&
      !validateLangCode(attr.defaultLocale)
    ) {
      return false
    }

    return Array.isArray(attr.values) && attr.values.every((valueElem: any) => {
      if (
        typeof valueElem !== "object" ||
        typeof valueElem.number !== "number" ||
        !valueElem.hasOwnProperty('value')
      ) {
        return false
      }
      const value = valueElem.value

      if (valueShouldBeNumber) {
        return typeof value === "number"
      }

      if (valueMayBeDictionary) {
        return (
          (typeof value === "string") ||
          validateLocalizedStringDictionary(value)
        )
      }

      return typeof value === "string"
    })
  }

  return attr.kind === AttributeKind.freeValue
}

export const validateAttributesSchema = (schema: any): schema is AttributesSchema => {
  return (
    typeof schema === 'object' &&
    Semver.isValid(schema.schemaVersion) &&
    typeof schema.nextAttributeId === "number" &&
    typeof schema.attributes === 'object' &&
    schema.nextAttributeId >= 0 &&
    getKeys(schema.attributes).every(key => !isNaN(parseInt(key as string))) &&
    getValues(schema.attributes).every(validateAttributesSchemaSingleAttribute)
  )
}

export const validateImageObject = (img: any): img is Image => {
  return (
    typeof img === 'object' &&
    (
      typeof img.urlInfix === 'string' ||
      (typeof img.url === 'string' && isValidURL(img.url))
    ) &&
    (!img.hasOwnProperty('hash') || typeof img.hash === 'string')
  )
}

export const validateCollectionSchemaBasic = (schema: any): schema is CollectionSchemaBasic => {
  const basicallyIsOk: boolean = (
    typeof schema === 'object' &&
    schema.family === COLLECTION_SCHEMA_FAMILY_NAME &&
    POSSIBLE_SCHEMA_TYPE_NAMES.includes(schema.type) &&
    Semver.isValid(schema.typeVersion) &&
    typeof schema.imageUrlTemplate === 'string' &&
    schema.imageUrlTemplate.indexOf('{infix}') >= 0 &&
    validateImageObject(schema.coverImage) &&
    (
      !schema.hasOwnProperty('coverImagePreview') ||
      validateImageObject(schema.coverImagePreview)
    ) &&
    validateAttributesSchema(schema.attributesSchema)
  )
  if (!basicallyIsOk) {
    return false
  }

  if (schema.type === COLLECTION_SCHEMA_TYPE_NAME.BasicVideo) {

  }

  return true
}
