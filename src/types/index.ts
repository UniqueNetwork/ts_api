import type {KeyringOptions, KeyringPair} from '@polkadot/keyring/types'
import type {Keypair, KeypairType, Prefix, Seedpair} from '@polkadot/util-crypto/types'
import type {ApiPromise, SubmittableResult} from '@polkadot/api'
import type {SubmittableExtrinsic} from '@polkadot/api/promise/types'
import type {DefinitionRpc, DefinitionRpcSub, ISubmittableResult} from '@polkadot/types/types'
import type {EventRecord} from '@polkadot/types/interfaces/system/types'
import type {GenericEventData} from '@polkadot/types/generic/Event'
import type {InjectedAccountWithMeta} from '@polkadot/extension-inject/types'
import type {HexString} from '@polkadot/util/types'
import type {UpDataStructsTokenData} from '@unique-nft/unique-mainnet-types/default'

export type {
  KeyringPair,
  KeypairType,
  KeyringOptions,
  Keypair,
  Seedpair,
  Prefix,
  ApiPromise,
  SubmittableExtrinsic,
  ISubmittableResult,
  SubmittableResult,
  EventRecord,
  GenericEventData,
  InjectedAccountWithMeta,
  HexString,
  DefinitionRpc,
  DefinitionRpcSub,
  UpDataStructsTokenData,
}
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
