import {PropertiesArray, HumanizedNftToken, ComboNftToken} from "../../types";
import {DecodingResult} from "../schemaUtils";
import {
  COLLECTION_SCHEMA_NAME,
  DecodingImageLinkOptions,
  UniqueCollectionSchemaDecoded,
  UniqueTokenDecoded,
  UrlTemplateString
} from "../types";
import * as oldSchema from "./oldSchemaDecoder";
import * as collection from "./collection";
import {ValidationError} from "../../utils/errors";
import * as token from "./token";
import {validateUrlTemplateStringSafe} from "./validators";
import {safeJSONParse} from "../../tsUtils";

const DEFAULT_IMAGE_URL_TEMPLATE: UrlTemplateString = `https://ipfs.unique.network/ipfs/{infix}`
const DEFAULT_DUMMY_IMAGE_FULL_URL = `https://ipfs.unique.network/ipfs/QmPCqY7Lmxerm8cLKmB18kT1RxkwnpasPVksA8XLhViVT7`



const parseImageLinkOptions = (options?: DecodingImageLinkOptions): Required<DecodingImageLinkOptions> => {
  let imageUrlTemplate: UrlTemplateString = DEFAULT_IMAGE_URL_TEMPLATE
  if (validateUrlTemplateStringSafe(options?.imageUrlTemplate, 'options.imageUrlTemplate')) {
    imageUrlTemplate = options!.imageUrlTemplate
  }

  const dummyImageFullUrl = typeof options?.dummyImageFullUrl === 'string'
    ? options.dummyImageFullUrl
    : DEFAULT_DUMMY_IMAGE_FULL_URL

  return {
    imageUrlTemplate,
    dummyImageFullUrl,
  }
}



export const universallyDecodeCollectionSchema = async (collectionId: number, properties: PropertiesArray, options?: DecodingImageLinkOptions): Promise<DecodingResult<UniqueCollectionSchemaDecoded>> => {
  const schemaNameProp = properties.find(({key}) => key === 'schemaName')?.value || null
  const schemaName = typeof schemaNameProp === 'string' ? safeJSONParse<string>(schemaNameProp) : null
  const isOldSchema = !!properties.find(({key}) => key === '_old_schemaVersion')

  if (isOldSchema) {
    const imageLinkOptions = parseImageLinkOptions(options)
    return await oldSchema.decodeOldSchemaCollection(collectionId, properties, imageLinkOptions)
  } else if (schemaName === COLLECTION_SCHEMA_NAME.unique) {
    return await collection.decodeUniqueCollectionFromProperties(collectionId, properties)
  }

  return {
    isValid: false,
    validationError: new ValidationError(`Unknown collection schema`)
  }
}

export const universallyDecodeToken = async (collectionId: number, tokenId: number, comboNftToken: ComboNftToken, schema: UniqueCollectionSchemaDecoded | undefined, options?: DecodingImageLinkOptions): Promise<DecodingResult<UniqueTokenDecoded>> => {
  if (!schema) {
    return {
      isValid: false,
      validationError: new ValidationError('unable to parse: collection schema was not provided')
    }
  }

  if (schema.schemaName === COLLECTION_SCHEMA_NAME.unique) {
    return await token.decodeTokenFromProperties(collectionId, tokenId, comboNftToken.token, schema)
  } else if (schema.schemaName === COLLECTION_SCHEMA_NAME.old) {
    const imageLinkOptions = parseImageLinkOptions(options)
    return await oldSchema.decodeOldSchemaToken(collectionId, tokenId, comboNftToken.rawToken, schema, imageLinkOptions)
  }

  return {
    isValid: false,
    validationError: new ValidationError(`unable to parse: collection schemaName is unknown (passed ${schema.schemaName}`)
  }
}
