import * as extrinsicTools from './extrinsicTools'
import * as extensionTools from './extensionTools'
import * as signerTools from './signerTools'

export {extensionTools, extrinsicTools, signerTools}
export {extensionTools as polkadotExtensionTools}

import {SubstrateCommon} from './SubstrateCommon'
import {SubstrateUnique} from './SubstrateUnique'

export const Substrate = {
  Common: SubstrateCommon,
  Unique: SubstrateUnique,
}
export type {SubstrateCommon, SubstrateUnique}
