import {PropertiesArray} from "../../types";
import {
  AttributeKind,
  AttributeType,
  AttributeTypeMask,
  CollectionSchemaUnique,
  InfixOrUrlOrCidAndHash,
  LocalizedStringDictionary,
  TokenAttributes,
  TokenSchemaUnique
} from "../types";
import {validateToken} from "./validators";
import {getEntries, safeJSONParse} from "../../tsUtils";
import {CollectionProperties} from "../../substrate/extrinsics/unique/types";

const addUrlObjectToTokenProperties = (properties: PropertiesArray, prefix: string, source: InfixOrUrlOrCidAndHash) => {
  if (typeof source.urlInfix === 'string') {
    properties.push({key: `${prefix}.i`, value: source.urlInfix})
  } else if (typeof source.ipfsCid === 'string') {
    properties.push({key: `${prefix}.c`, value: source.ipfsCid})
  } else if (typeof source.url === 'string') {
    properties.push({key: `${prefix}.u`, value: source.url})
  }

  if (typeof source.hash === 'string') {
    properties.push({key: `${prefix}.h`, value: source.hash})
  }
}

const addKeyToTokenProperties = (properties: PropertiesArray, key: string, value: string | number | object) => {
  let strValue = typeof value === 'object'
    ? JSON.stringify(value)
    : String(value)

  if (Array.isArray(value)) {
    strValue = strValue.slice(1, -1) // cut off brackets: "[1,5,30]" -> "1,5,30"
  }

  properties.push({
    key,
    value: strValue
  })
}

export const packTokenToProperties = (token: TokenSchemaUnique, schema: CollectionSchemaUnique): PropertiesArray => {
  validateToken(token, schema)

  const properties: PropertiesArray = []
  if (token.name) addKeyToTokenProperties(properties, 'n', token.name)
  if (token.description) addKeyToTokenProperties(properties, 'd', token.description)

  if (token.attributes) {
    for (const n in token.attributes) {
      const value = token.attributes[n]
      addKeyToTokenProperties(properties, `a.${n}`, value)
    }
  }

  if (token.image) addUrlObjectToTokenProperties(properties, 'i', token.image)
  if (schema.imagePreview && token.imagePreview) addUrlObjectToTokenProperties(properties, 'p', token.imagePreview)
  if (schema.video && token.video) addUrlObjectToTokenProperties(properties, 'v', token.video)
  if (schema.audio && token.audio) addUrlObjectToTokenProperties(properties, 'au', token.audio)
  if (schema.spatialObject && token.spatialObject) addUrlObjectToTokenProperties(properties, 'so', token.spatialObject)

  return properties
}

const fillTokenFieldByKeyPrefix = <T extends TokenSchemaUnique>(token: T, properties: PropertiesArray, prefix: string, tokenField: keyof T) => {
  const keysMatchingPrefix = [`${prefix}.i`, `${prefix}.u`, `${prefix}.c`, `${prefix}.h`]
  if (properties.some(({key}) => keysMatchingPrefix.includes(key))) token[tokenField] = {} as any

  const field = token[tokenField] as any as InfixOrUrlOrCidAndHash

  const urlInfixProperty = properties.find(({key}) => key === keysMatchingPrefix[0])
  if (urlInfixProperty) field.urlInfix = urlInfixProperty.value

  const urlProperty = properties.find(({key}) => key === keysMatchingPrefix[1])
  if (urlProperty) field.url = urlProperty.value

  const ipfsCidProperty = properties.find(({key}) => key === keysMatchingPrefix[2])
  if (ipfsCidProperty) field.ipfsCid = ipfsCidProperty.value

  const hashProperty = properties.find(({key}) => key === keysMatchingPrefix[3])
  if (hashProperty) field.hash = hashProperty.value
}


export const unpackTokenFromProperties = <T extends TokenSchemaUnique>(properties: CollectionProperties, schema: CollectionSchemaUnique): T => {
  const token: T = {} as T

  const name = properties.find(({key}) => key === 'n')
  if (name) token.name = safeJSONParse<LocalizedStringDictionary>(name.value)

  const description = properties.find(({key}) => key === 'd')
  if (description) token.description = safeJSONParse<LocalizedStringDictionary>(description.value)

  fillTokenFieldByKeyPrefix(token, properties, 'i', 'image')
  fillTokenFieldByKeyPrefix(token, properties, 'p', 'imagePreview')
  fillTokenFieldByKeyPrefix(token, properties, 'v', 'video')
  fillTokenFieldByKeyPrefix(token, properties, 'au', 'audio')
  fillTokenFieldByKeyPrefix(token, properties, 'so', 'spatialObject')

  const attributes = properties.filter(({key}) => key.startsWith('a.'))
  if (attributes.length) {
    token.attributes = {} as TokenAttributes

    attributes.forEach(({key, value}) => {
      const attributeKey = parseInt(key.split('.')[1] || '')
      if (!isNaN(attributeKey) || !schema.attributesSchema.hasOwnProperty(attributeKey)) {
        const attributeSchema = schema.attributesSchema[attributeKey]
        const {type, kind} = attributeSchema

        if (kind === AttributeKind.enum) {
          token.attributes![attributeKey] = parseInt(value)
        } else if (kind === AttributeKind.enumMultiple) {
          token.attributes![attributeKey] = value.split(',').map(n => parseInt(n))
        } else if (kind === AttributeKind.freeValue) {
          if (type & AttributeTypeMask.number) {
            token.attributes![attributeKey] = type === AttributeType.float ? parseFloat(value) : parseInt(value)
          } else if (attributeSchema.type & AttributeTypeMask.object) {
            token.attributes![attributeKey] = safeJSONParse<LocalizedStringDictionary>(value)
          } else {
            token.attributes![attributeKey] = value
          }
        }
      }
    })
  }

  return token
}

interface DecodedTokenAttributes {
  [K: number]: string | number | LocalizedStringDictionary | Array<string | number | LocalizedStringDictionary>
}
export const decodeTokenAttributes = (token: TokenSchemaUnique, collectionSchema: CollectionSchemaUnique): DecodedTokenAttributes => {
  const attributes: DecodedTokenAttributes = {}
  if (!token.attributes) return {}

  const entries = getEntries(token.attributes)
  for (const entry of entries) {
    const [key, value] = entry

    const schema = collectionSchema.attributesSchema[key]

    if (!schema) continue

    if (schema.kind === AttributeKind.freeValue) {
      attributes[key] = value
    }

    if (!schema.enumValues) continue

    if (schema.kind === AttributeKind.enum && typeof value === 'number') {
      if (schema.enumValues.hasOwnProperty(value)) {
        attributes[key] = schema.enumValues[value]
      }
    }

    if (schema.kind === AttributeKind.enumMultiple && Array.isArray(value)) {
      attributes[key] = []
      for (const num in value) {
        if (schema.enumValues.hasOwnProperty(num)) {
          ;(attributes[key] as Array<any>).push(schema.enumValues[num])
        }
      }
    }
  }
  return attributes
}
