import * as extrinsicTools from './extrinsicTools'
import * as extensionTools from './extensionTools'
import * as signerTools from './signerTools'

import {SubstrateCommon} from './SubstrateCommon'
import {SubstrateUnique} from './SubstrateUnique'

export const Substrate = {
  Common: SubstrateCommon,
  Unique: SubstrateUnique,
  signer: signerTools,
  extension: extensionTools,
  tools: {
    extrinsic: extrinsicTools
  }
}
export type {SubstrateCommon, SubstrateUnique}
