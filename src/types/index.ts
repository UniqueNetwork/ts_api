import '@unique-nft/types/augment-api'

import type {KeyringPair, KeyringOptions} from '@polkadot/keyring/types'
import type {KeypairType, Keypair, Seedpair, Prefix} from '@polkadot/util-crypto/types'
import type {ApiPromise, SubmittableResult} from '@polkadot/api'
import type {SubmittableExtrinsic} from '@polkadot/api/promise/types'
import type {ISubmittableResult} from '@polkadot/types/types'
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
  HexString
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
export type AnyAddress = SubOrEthAddressObj | SubstrateAddress | EthereumAddress

export type CollectionId = Nominal<number, 'CollectionId'>
export type TokenId = Nominal<number, 'TokenId'>

export type PropertiesArray = Array<{
  key: string
  value: string
}>

type _EXTRINSIC_RESULT_TMP_ = void

export interface IUniqueSDK<CollectionIdFormat extends number | EthereumAddress, Connection> {
  connect(endpoint: string): Promise<Connection>

  disconnect(): Promise<void>

  transferCoins(to: SubOrEthAddress): Promise<_EXTRINSIC_RESULT_TMP_>

  transferNFT(
    to: AnyAddress,
    collectionId: CollectionIdFormat,
    tokenId: TokenId,
    fractionalPart: number
  ): Promise<_EXTRINSIC_RESULT_TMP_>
}
