import '@unique-nft/unique-mainnet-types/augment-api'

import * as libs from './libs'
export {libs}
export const init = libs.init

export * from './types'

export * as constants from './constants'
export {WS_RPC} from './constants'

export {UniqueUtils} from './utils'

export * from './ethereum'
export * from './substrate'
export {SchemaTools} from './schema'
export * from './schema/types'

export * as coins from './coin'
export type {Coin} from './coin'
export {SubstrateMethodsParams} from './substrate/extrinsics/types'
