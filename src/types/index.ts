export type {KeyringOptions, KeyringPair} from '@polkadot/keyring/types'
export type {Keypair, KeypairType, Prefix, Seedpair} from '@polkadot/util-crypto/types'
export type {ApiPromise, SubmittableResult} from '@polkadot/api'
export type {SubmittableExtrinsic} from '@polkadot/api/promise/types'
export type {DefinitionRpc, DefinitionRpcSub, ISubmittableResult} from '@polkadot/types/types'
export type {EventRecord} from '@polkadot/types/interfaces/system/types'
export type {GenericEventData} from '@polkadot/types/generic/Event'
export type {InjectedAccountWithMeta} from '@polkadot/extension-inject/types'
export type {HexString} from '@polkadot/util/types'
export type {UpDataStructsTokenData} from '@unique-nft/unique-mainnet-types/default'

import type {KeyringPair} from "@polkadot/keyring/types";
import type {InjectedAccountWithMeta} from '@polkadot/extension-inject/types'

export type ISigner = InjectedAccountWithMeta | KeyringPair

// const NominalType: unique symbol = Symbol('NominalType');
// interface INominal<TypeIdentifier> {
//   readonly [NominalType]: TypeIdentifier
// }
// export type Nominal<OriginalType, TypeIdentifier> = OriginalType & INominal<TypeIdentifier>;

export type SubAddressObj = { Substrate: string }
export type SubAddressObjUncapitalized = { substrate: string }
export type EthAddressObj = { Ethereum: string }
export type EthAddressObjUncapitalized = { ethereum: string }

export type CrossAccountId =
  SubAddressObj & { Ethereum?: never }
  |
  EthAddressObj & { Substrate?: never }

export type CrossAccountIdUncapitalized =
  SubAddressObjUncapitalized & { ethereum?: never }
  |
  EthAddressObjUncapitalized & { substrate?: never }

export type CrossAccountIdOrString = CrossAccountId | string
export type CrossAccountIdUncapitalizedOrString = CrossAccountIdUncapitalized | string

export type PropertiesArray = Array<{
  key: string
  value: string
}>

export type HumanizedNftToken = {
  owner: CrossAccountId
  properties: PropertiesArray
}
