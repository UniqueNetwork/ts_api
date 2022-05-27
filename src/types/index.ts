const NominalType: unique symbol = Symbol('NominalType');

interface INominal<TypeIdentifier> {
  readonly [NominalType]: TypeIdentifier
}

export type Nominal<OriginalType, TypeIdentifier> = OriginalType & INominal<TypeIdentifier>;

import type {Signer as InjectedSigner} from '@polkadot/api/types'
import type {KeyringPair} from '@polkadot/keyring/types'

export type SubstrateAddress = Nominal<string, 'SubstrateAddress'>
export type EthereumAddress = Nominal<string, 'EthereumAddress'>
export type SubAddressObj = { Substrate: SubstrateAddress }
export type EthAddressObj = { Ethereum: EthereumAddress }

export type SubOrEthAddressObj = SubAddressObj | EthAddressObj
export type Address = SubOrEthAddressObj | SubstrateAddress | EthereumAddress

export type PolkadotSigner = InjectedSigner | KeyringPair

export type CollectionId = Nominal<number, 'CollectionId'>
export type TokenNumber = Nominal<number, 'TokenNumber'>

type _EXTRINSIC_RESULT_TMP_ = void

export interface IUniqueSDK<CollectionIdFormat extends number | EthereumAddress,
  Connection,
  Signer> {

  connect(endpoint: string): Promise<Connection>

  disconnect(): Promise<void>

  transferCoins(to: Address): Promise<_EXTRINSIC_RESULT_TMP_>

  transferNFT(
    to: Address,
    collectionId: CollectionIdFormat,
    tokenId: TokenNumber,
    fractionalPart: number
  ): Promise<_EXTRINSIC_RESULT_TMP_>
}
