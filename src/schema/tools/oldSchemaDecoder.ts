import {
  AttributeKind,
  AttributeType,
  COLLECTION_SCHEMA_NAME,
  DecodedAttributes,
  DecodedInfixOrUrlOrCidAndHash,
  DecodingImageLinkOptions,
  UniqueCollectionSchemaDecoded,
  UniqueTokenDecoded,
  UrlTemplateString
} from "../types";
import {validateLocalizedStringDictionarySafe, validateURLSafe} from "./validators";
import {CollectionProperties} from "../../substrate/extrinsics/unique/types";
import {ATTRIBUTE_KIND_NAME_BY_VALUE, ATTRIBUTE_TYPE_NAME_BY_VALUE, DecodingResult} from "../schemaUtils";
import {CollectionId, HumanizedNftToken, SubOrEthAddressObj, TokenId} from "../../types";
import {Root} from 'protobufjs'
import type {Message, Type} from 'protobufjs'
import {ValidationError} from "../../utils/errors";
import {hexToU8a} from "../../utils/common";
import {getEntries, safeJSONParse} from "../../tsUtils";
import {isNestingAddress, nestingAddressToCollectionIdAndTokenId} from '../../utils/common'


const isOffchainSchemaAValidUrl = (offchainSchema: string | undefined): offchainSchema is string => {
  return typeof offchainSchema === "string" &&
    validateURLSafe(offchainSchema, 'offchainSchema') &&
    offchainSchema.indexOf('{id}') >= 0
}

export const decodeOldSchemaCollection = async (collectionId: number, properties: CollectionProperties, options: Required<DecodingImageLinkOptions>): Promise<DecodingResult<UniqueCollectionSchemaDecoded>> => {
  const {imageUrlTemplate, dummyImageFullUrl} = options

  const propObj = properties.reduce((acc, {key, value}) => {
    acc[key] = value;
    return acc
  }, {} as Record<string, string>)

  const offchainSchema: string | undefined = propObj._old_offchainSchema
  const constOnchainSchema: string | undefined = propObj._old_constOnChainSchema
  const schemaVersion: string | undefined = propObj._old_schemaVersion
  const variableOnchainSchema: string | undefined = propObj._old_variableOnChainSchema

  const offchainSchemaIsValidUrl = isOffchainSchemaAValidUrl(offchainSchema)

  const schema: UniqueCollectionSchemaDecoded = {
    schemaName: COLLECTION_SCHEMA_NAME.old,

    collectionId: collectionId as CollectionId,
    coverPicture: {
      url: dummyImageFullUrl,
      fullUrl: null
    },
    image: {
      urlTemplate: offchainSchemaIsValidUrl
        ? offchainSchema.replace('{id}', '{infix}') as UrlTemplateString
        : imageUrlTemplate
    },

    schemaVersion: '0.0.1',
    attributesSchema: {},
    attributesSchemaVersion: '1.0.0'
  }

  let parsedVariableOnchainSchema = null
  try {
    parsedVariableOnchainSchema = JSON.parse(variableOnchainSchema)
  } catch {
  }

  if (parsedVariableOnchainSchema && typeof parsedVariableOnchainSchema === 'object' && typeof parsedVariableOnchainSchema.collectionCover === 'string') {
    schema.coverPicture.ipfsCid = parsedVariableOnchainSchema.collectionCover
    delete schema.coverPicture.url
    schema.coverPicture.fullUrl = imageUrlTemplate.replace('{infix}', parsedVariableOnchainSchema.collectionCover)
  } else if (offchainSchemaIsValidUrl) {
    const coverUrl = offchainSchema.replace('{id}', '1')
    schema.coverPicture.url = coverUrl
    schema.coverPicture.fullUrl = coverUrl
  }


  if (constOnchainSchema) {
    try {
      Root.fromJSON(JSON.parse(constOnchainSchema))
    } catch (err: any) {
      return {
        isValid: false,
        validationError: err as Error,
      }
    }
  }

  schema.oldProperties = {
    _old_schemaVersion: schemaVersion,
    _old_offchainSchema: offchainSchema,
    _old_constOnChainSchema: constOnchainSchema,
    _old_variableOnChainSchema: variableOnchainSchema,
  }

  return {isValid: true, decoded: schema}
}

//todo: replace rawToken type with humanized token after core team's fix
export const decodeOldSchemaToken = async (collectionId: number, tokenId: number, rawToken: { owner: any, properties: any[] }, schema: UniqueCollectionSchemaDecoded, options: Required<DecodingImageLinkOptions>): Promise<DecodingResult<UniqueTokenDecoded>> => {
  const constOnchainSchema = schema.oldProperties?._old_constOnChainSchema

  if (!constOnchainSchema) {
    return {isValid: false, validationError: new ValidationError(`collection doesn't contain _old_constOnChainSchema field`)}
  }

  let root: Root = {} as any
  let NFTMeta: Type = {} as any
  try {
    root = Root.fromJSON(JSON.parse(constOnchainSchema))
    NFTMeta = root.lookupType('onChainMetaData.NFTMeta')
  } catch (err: any) {
    return {
      isValid: false,
      validationError: err as Error,
    }
  }

  if (!rawToken) {
    return {
      isValid: false,
      validationError: new ValidationError(`parsing token with old schema: no token passed`)
    }
  }

  const parsedToken: HumanizedNftToken = {
    owner: rawToken.owner.toHuman() as SubOrEthAddressObj,
    properties: rawToken.properties.map(property => {
      // console.log(`collection ${i} token ${tokenId} property ${property.key.toHuman()}:`, property)
      return {
        key: property.key.toHuman() as string,
        value: property.value.toJSON() as string,
        // valueH: property.value.toHuman() as string,
      }
    })
  }

  const constDataProp = parsedToken.properties.find(({key}) => key === '_old_constData')
  if (!constDataProp) {
    return {
      isValid: false,
      validationError: new ValidationError('no _old_constData property found')
    }
  }

  const u8aToken = hexToU8a(constDataProp.value)
  let tokenDecoded: Message<{}> = {} as any
  let tokenDecodedHuman: Record<string, any> = {}
  try {
    tokenDecoded = NFTMeta.decode(u8aToken)
    tokenDecodedHuman = tokenDecoded.toJSON()
    console.log(tokenId, tokenDecodedHuman)
  } catch (err: any) {
    return {
      isValid: false,
      validationError: err
    }
  }

  const tokenAttributesResult: DecodedAttributes = {}

  const entries = getEntries(tokenDecodedHuman)
  let i = 0
  for (const entry of entries) {
    let [name, rawValue] = entry as [string, any]
    if (name === 'ipfsJson') {
      continue
    }

    let value = rawValue

    let isArray = false
    let kind = AttributeKind.freeValue
    let type = AttributeType.string

    const field = tokenDecoded.$type.fields[name]
    if (!['string', 'number'].includes(field.type)) {
      const enumOptions = root.lookupEnum(field.type).options
      if (field.rule === 'repeated' && Array.isArray(rawValue)) {
        value = rawValue

        isArray = true
        kind = AttributeKind.enumMultiple

        const parsedValues = rawValue.map((v: any) => safeJSONParse(enumOptions?.[v] || v))
        const isLocalizedStringDictionary = parsedValues.every((parsedValue, index) => validateLocalizedStringDictionarySafe(parsedValue, `attributes.${name}[${index}]`))

        if (isLocalizedStringDictionary) {
          type = AttributeType.localizedStringDictionary
          value = parsedValues
        }
      } else {
        kind = AttributeKind.enum
        value = safeJSONParse(enumOptions?.[rawValue] || rawValue)

        if (validateLocalizedStringDictionarySafe(value, `attributes.${name}`)) {
          type = AttributeType.localizedStringDictionary
        }
      }
    }

    tokenAttributesResult[i++] = {
      name,
      value,
      isArray,
      kind,
      type,
      technicalKindName: ATTRIBUTE_KIND_NAME_BY_VALUE[kind],
      technicalTypeName: ATTRIBUTE_TYPE_NAME_BY_VALUE[type],
    }
  }


  const schemaVersion = schema.oldProperties?._old_schemaVersion
  const offchainSchema = schema.oldProperties?._old_offchainSchema


  const {imageUrlTemplate, dummyImageFullUrl} = options

  let image: DecodedInfixOrUrlOrCidAndHash = {
    url: dummyImageFullUrl,
    fullUrl: null,
  }

  let ipfsImageIsSet = false
  if (schemaVersion === 'Unique') {
    try {
      const ipfsCid = JSON.parse(tokenDecodedHuman.ipfsJson).ipfs
      image = {
        ipfsCid,
        fullUrl: imageUrlTemplate.replace('{infix}', ipfsCid)
      }
      ipfsImageIsSet = true
    } catch {
    }
  }

  if (!ipfsImageIsSet && isOffchainSchemaAValidUrl(offchainSchema)) {
    image = {
      urlInfix: tokenId.toString(),
      fullUrl: offchainSchema.replace('{id}', tokenId.toString())
    }
  }

  const decodedToken: UniqueTokenDecoded = {
    collectionId: collectionId as CollectionId,
    tokenId: tokenId as TokenId,
    owner: parsedToken.owner,
    image,
    attributes: tokenAttributesResult,
  }

  if (parsedToken.owner.Ethereum && isNestingAddress(parsedToken.owner.Ethereum)) {
    decodedToken.nestingParentToken = nestingAddressToCollectionIdAndTokenId(parsedToken.owner.Ethereum)
  }

  return {isValid: true, decoded: decodedToken}
}
