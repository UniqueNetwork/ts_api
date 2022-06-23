export * from './types'
import * as types from './types'
import * as validators from './tools/validators'
import * as collection from './tools/collection'
import * as token from './tools/token'

export const UniqueSchema = {
  decode: {
    collectionSchema: collection.decodeUniqueCollectionFromProperties,
    token: token.decodeTokenFromProperties
  },
  encode: {
    collectionSchema: collection.encodeCollectionSchemaToProperties,
    collectionTokenPropertyPermissions: collection.generateTokenPropertyPermissionsFromCollectionSchema,
    token: token.encodeTokenToProperties,
  },
  tools: {
    ...collection,
    ...token,
    ...validators,
  },
  types,
}
