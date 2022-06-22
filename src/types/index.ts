import type {KeyringPair, KeyringOptions} from '@polkadot/keyring/types'
import type {KeypairType, Keypair, Seedpair, Prefix} from '@polkadot/util-crypto/types'
import type {ApiPromise, SubmittableResult} from '@polkadot/api'
import type {SubmittableExtrinsic} from '@polkadot/api/promise/types'
import type {ISubmittableResult, DefinitionRpc, DefinitionRpcSub} from '@polkadot/types/types'
import type {EventRecord} from '@polkadot/types/interfaces/system/types'
import type {GenericEventData} from '@polkadot/types/generic/Event'
import type {InjectedAccountWithMeta} from '@polkadot/extension-inject/types'
import type {HexString} from '@polkadot/util/types'

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
}


const NominalType: unique symbol = Symbol('NominalType');

interface INominal<TypeIdentifier> {
  readonly [NominalType]: TypeIdentifier
}

export type Nominal<OriginalType, TypeIdentifier> = OriginalType & INominal<TypeIdentifier>;

export type SignWithPolkadotExtensionFromAddress = { signWithPolkadotExtensionFromAddress: string }
export type ISigner = InjectedAccountWithMeta | KeyringPair

export type SubstrateAddress = Nominal<string, 'SubstrateAddress'>
export type EthereumAddress = Nominal<string, 'EthereumAddress'>
export type SubAddressObj = { Substrate: SubstrateAddress }
export type EthAddressObj = { Ethereum: EthereumAddress }

export type SubOrEthAddressObj =
  SubAddressObj & { Ethereum?: never }
  |
  EthAddressObj & { Substrate?: never }

export type SubOrEthAddress = SubstrateAddress | EthereumAddress
export type AnyAddress = SubOrEthAddressObj | SubOrEthAddress

export type AnyInputAddress = { Substrate: string, Ethereum?: undefined } | {Ethereum: string, Substrate?: undefined} | string

export type CollectionId = Nominal<number, 'CollectionId'>
export type TokenId = Nominal<number, 'TokenId'>

export type PropertiesArray = Array<{
  key: string
  value: string
}>

export type RawNftToken = {
  owner: SubOrEthAddressObj
  properties: PropertiesArray
}
