import {PropertiesArray, RawNftToken} from "../../types";
import {
  AttributeKind,
  AttributeType,
  AttributeTypeMask,
  UniqueCollectionSchemaToCreate,
  InfixOrUrlOrCidAndHash,
  LocalizedStringDictionary,
  EncodedTokenAttributes,
  UniqueTokenToCreate,
  UniqueTokenDecoded,
  URL_TEMPLATE_INFIX,
  DecodedInfixOrUrlOrCidAndHash,
  UrlTemplateString,
  UniqueCollectionSchemaDecoded
} from "../types";
import {validateStringOrLocalizedStringDictionary, validateToken} from "./validators";
import {getEntries, getValues, safeJSONParse} from "../../tsUtils";
import {CollectionProperties} from "../../substrate/extrinsics/unique/types";
import {decodeTokenUrlOrInfixOrCidWithHashField, DecodingResult} from "../schemaUtils";
import {utils} from "../../utils";
import {ValidationError} from "../../utils/errors";

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

export const encodeTokenToProperties = (token: UniqueTokenToCreate, schema: UniqueCollectionSchemaToCreate): PropertiesArray => {
  validateToken(token, schema)

  const properties: PropertiesArray = []
  if (token.name) addKeyToTokenProperties(properties, 'n', token.name)
  if (token.description) addKeyToTokenProperties(properties, 'd', token.description)

  if (token.encodedAttributes) {
    for (const n in token.encodedAttributes) {
      const value = token.encodedAttributes[n]
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

const fillTokenFieldByKeyPrefix = <T extends UniqueTokenToCreate>(token: T, properties: PropertiesArray, prefix: string, tokenField: keyof T) => {
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


export const unpackEncodedTokenFromProperties = <T extends UniqueTokenToCreate>(properties: CollectionProperties, schema: UniqueCollectionSchemaToCreate): T => {
  const token: T = {} as T

  const nameProperty = properties.find(({key}) => key === 'n')
  if (nameProperty) {
    const parsedName = safeJSONParse<LocalizedStringDictionary>(nameProperty.value)
    token.name =
      typeof parsedName === 'object' &&
      validateStringOrLocalizedStringDictionary(parsedName, 'token.name')
        ? parsedName
        : nameProperty.value
  }

  const descriptionProperty = properties.find(({key}) => key === 'd')
  if (descriptionProperty) {
    const parsedDescription = safeJSONParse<LocalizedStringDictionary>(descriptionProperty.value)
    token.description =
      typeof parsedDescription === 'object' &&
      validateStringOrLocalizedStringDictionary(parsedDescription, 'token.description')
        ? parsedDescription
        : descriptionProperty.value
  }

  fillTokenFieldByKeyPrefix(token, properties, 'i', 'image')
  fillTokenFieldByKeyPrefix(token, properties, 'p', 'imagePreview')
  fillTokenFieldByKeyPrefix(token, properties, 'v', 'video')
  fillTokenFieldByKeyPrefix(token, properties, 'au', 'audio')
  fillTokenFieldByKeyPrefix(token, properties, 'so', 'spatialObject')

  const attributeProperties = properties.filter(({key}) => key.startsWith('a.'))
  if (attributeProperties.length) {
    const attrs = {} as EncodedTokenAttributes

    for (const attrProp of attributeProperties) {
      const {key, value} = attrProp

      const attributeKey = parseInt(key.split('.')[1] || '')
      if (!isNaN(attributeKey) || !schema.attributesSchema.hasOwnProperty(attributeKey)) {
        const attributeSchema = schema.attributesSchema[attributeKey]
        const {type, kind} = attributeSchema

        if (kind === AttributeKind.enum) {
          attrs[attributeKey] = parseInt(value)
        } else if (kind === AttributeKind.enumMultiple) {
          attrs[attributeKey] = value.split(',').map(n => parseInt(n))
        } else if (kind === AttributeKind.freeValue) {
          if (type & AttributeTypeMask.number) {
            attrs[attributeKey] = type === AttributeType.float ? parseFloat(value) : parseInt(value)
          } else if (attributeSchema.type & AttributeTypeMask.object) {
            attrs[attributeKey] = safeJSONParse<LocalizedStringDictionary>(value)
          } else {
            attrs[attributeKey] = value
          }
        }
      }
    }

    token.encodedAttributes = attrs
  }

  return token
}




export const decodeTokenFromProperties = (rawToken: RawNftToken, schema?: UniqueCollectionSchemaToCreate | UniqueCollectionSchemaDecoded): DecodingResult<UniqueTokenDecoded> => {
  if (!schema) {
    return  {
      isValid: false,
      validationError: new ValidationError('unable to parse: collection schema was not provided')
    }
  }
  const unpackedToken = unpackEncodedTokenFromProperties(rawToken.properties, schema)

  try {
    validateToken(unpackedToken, schema)
  } catch (e) {
    return {
      isValid: false,
      validationError: e as Error
    }
  }

  const token: UniqueTokenDecoded = {
    owner: rawToken.owner,
    attributes: fullDecodeTokenAttributes(unpackedToken, schema),
    image: decodeTokenUrlOrInfixOrCidWithHashField(unpackedToken.image, schema.image)
  }
  if (token.owner.Ethereum && utils.address.is.nestingAddress(token.owner.Ethereum)) {
    token.nestingParentToken = utils.address.nestingAddressToCollectionIdAndTokenId(token.owner.Ethereum)
  }

  if (unpackedToken.name) token.name = unpackedToken.name
  if (unpackedToken.description) token.description = unpackedToken.description

  if (unpackedToken.imagePreview) {
    token.imagePreview = decodeTokenUrlOrInfixOrCidWithHashField(unpackedToken.imagePreview, schema.imagePreview)
  }
  if (unpackedToken.video) {
    token.video = decodeTokenUrlOrInfixOrCidWithHashField(unpackedToken.video, schema.video)
  }
  if (unpackedToken.audio) {
    token.audio = decodeTokenUrlOrInfixOrCidWithHashField(unpackedToken.audio, schema.audio)
  }
  if (unpackedToken.spatialObject) {
    token.spatialObject = decodeTokenUrlOrInfixOrCidWithHashField(unpackedToken.spatialObject, schema.spatialObject)
  }

  return {isValid: true, decoded: token}
}

export const fullDecodeTokenAttributes = (token: UniqueTokenToCreate, collectionSchema: UniqueCollectionSchemaToCreate): UniqueTokenDecoded['attributes'] => {
  const attributes: UniqueTokenDecoded['attributes'] = {}
  if (!token.encodedAttributes) return {}

  const entries = getEntries(token.encodedAttributes)
  for (const entry of entries) {
    const [key, value] = entry

    const schema = collectionSchema.attributesSchema[key]
    if (!schema) continue
    const name = schema.name


    if (schema.kind === AttributeKind.freeValue) {
      attributes[key] = {name,value}
    }

    if (!schema.enumValues) continue

    if (schema.kind === AttributeKind.enum && typeof value === 'number') {
      if (schema.enumValues.hasOwnProperty(value)) {
        attributes[key] = {name, value: schema.enumValues[value]}
      }
    }

    if (schema.kind === AttributeKind.enumMultiple && Array.isArray(value)) {
      const attr = attributes[key] = {name, value: [] as Array<any>}
      for (const num of value) {
        if (schema.enumValues.hasOwnProperty(num)) {
          attr.value.push(schema.enumValues[num])
        }
      }
    }
  }
  return attributes
}
