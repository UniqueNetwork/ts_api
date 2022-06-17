export * from './types'
import * as types from './types'
import * as validators from './tools/validators'
import * as collection from './tools/collection'
import * as token from './tools/token'

export const UniqueSchema = {

    ...collection,
    ...token,
  ...validators,
  ...types,
}
