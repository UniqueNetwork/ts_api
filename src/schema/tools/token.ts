import {HumanizedNftToken, PropertiesArray} from '../../types'
import {
  AttributeKind,
  AttributeType,
  DecodedAttributes,
  EncodedTokenAttributes,
  InfixOrUrlOrCidAndHash, LocalizedStringWithDefault,
  UniqueCollectionSchemaDecoded,
  UniqueCollectionSchemaToCreate,
  UniqueTokenDecoded,
  UniqueTokenToCreate
} from '../types'
import {validateLocalizedStringDictionary, validateUniqueToken} from './validators'
import {getEntries, safeJSONParse} from '../../tsUtils'
import {CollectionProperties} from '../../substrate/extrinsics/unique/types'
import {
  decodeTokenUrlOrInfixOrCidWithHashField,
  DecodingResult
} from "../schemaUtils";
import {UniqueUtils} from "../../utils";

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
  let strValue = JSON.stringify(value)

  properties.push({
    key,
    value: strValue
  })
}

export const encodeTokenToProperties = (token: UniqueTokenToCreate, schema: UniqueCollectionSchemaToCreate | UniqueCollectionSchemaDecoded): PropertiesArray => {
  validateUniqueToken(token, schema as UniqueCollectionSchemaToCreate)

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
    const parsedName = safeJSONParse<LocalizedStringWithDefault>(nameProperty.value)
    token.name =
      validateLocalizedStringDictionary(parsedName, 'token.name')
        ? parsedName
        : nameProperty.value
  }

  const descriptionProperty = properties.find(({key}) => key === 'd')
  if (descriptionProperty) {
    const parsedDescription = safeJSONParse<LocalizedStringWithDefault>(descriptionProperty.value)
    token.description =
      validateLocalizedStringDictionary(parsedDescription, 'token.description')
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
        } else if (kind === AttributeKind.multiEnum) {
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


export const decodeTokenFromProperties = async (collectionId: number, tokenId: number, rawToken: HumanizedNftToken, schema: UniqueCollectionSchemaToCreate | UniqueCollectionSchemaDecoded): Promise<DecodingResult<UniqueTokenDecoded>> => {
  const unpackedToken = unpackEncodedTokenFromProperties(rawToken.properties, schema)

  try {
    validateUniqueToken(unpackedToken, schema)
  } catch (e) {
    return {
      isValid: false,
      validationError: e as Error
    }
  }

  const token: UniqueTokenDecoded = {
    owner: rawToken.owner,
    tokenId,
    collectionId,
    attributes: fullDecodeTokenAttributes(unpackedToken, schema),
    image: decodeTokenUrlOrInfixOrCidWithHashField(unpackedToken.image, schema.image)
  }
  if (token.owner.Ethereum && UniqueUtils.Address.is.nestingAddress(token.owner.Ethereum)) {
    token.nestingParentToken = UniqueUtils.Address.nesting.addressToIds(token.owner.Ethereum)
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

export const fullDecodeTokenAttributes = (token: UniqueTokenToCreate, collectionSchema: UniqueCollectionSchemaToCreate): DecodedAttributes => {
  const attributes: UniqueTokenDecoded['attributes'] = {}
  if (!token.encodedAttributes) return {}

  const entries = getEntries(token.encodedAttributes)
  for (const entry of entries) {
    const [key, value] = entry

    const schema = collectionSchema.attributesSchema[key]
    if (!schema) continue
    const name = schema.name

    const attribute: DecodedAttributes[number] = {
      name,
      value,
      isArray: false,
      type: schema.type,
      kind: schema.kind,
      technicalTypeName: ATTRIBUTE_TYPE_NAME_BY_VALUE[schema.type],
      technicalKindName: ATTRIBUTE_KIND_NAME_BY_VALUE[schema.kind],
    }

    if (schema.kind === AttributeKind.freeValue) {
      attributes[key] = attribute
    }

    if (!schema.enumValues) continue

    if (schema.kind === AttributeKind.enum && typeof value === 'number') {
      if (schema.enumValues.hasOwnProperty(value)) {
        attribute.value = schema.enumValues[value]
        attributes[key] = attribute
      }
    }

    if (schema.kind === AttributeKind.multiEnum && Array.isArray(value)) {
      attribute.isArray = true

      const cumulativeValue: Array<string | number | LocalizedStringDictionary> = []

      for (const num of value) {
        if (schema.enumValues.hasOwnProperty(num)) {
          cumulativeValue.push(schema.enumValues[num])
        }
      }
      attribute.value = cumulativeValue

      attributes[key] = attribute
    }
  }
  return attributes
}
