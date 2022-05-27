import '@unique-nft/types/augment-api'
import {getEthers, getPolkadotUtilCrypto} from "../libs";
import {DWORDHexString, UInt8ArrayToHexString} from "./common";
import {COLLECTION_ADDRESS_PREFIX, NESTING_PREFIX} from "../constants";
import {CollectionId, EthereumAddress, SubstrateAddress, TokenNumber} from "../types";

export const validateEthereumAddress = (address: string): address is EthereumAddress => {
  const ethers = getEthers()
  if (!ethers.utils.isAddress(address)) {
    throw new Error(`Passed address ${address} is not valid`)
  }
  return true
}

export const validateSubstrateAddress = (address: string): address is SubstrateAddress => {
  const {validateAddress} = getPolkadotUtilCrypto()
  validateAddress(address)
  return true
}

export const normalizeAddress = (address: string, prefix: number = 42): SubstrateAddress => {
  validateSubstrateAddress(address)
  const {encodeAddress, decodeAddress} = getPolkadotUtilCrypto()
  return encodeAddress(decodeAddress(address), prefix) as SubstrateAddress
}

export const subToEthMirror = (address: string): EthereumAddress => {
  validateSubstrateAddress(address)
  const {addressToEvm} = getPolkadotUtilCrypto()
  const ethers = getEthers()

  return ethers.utils.getAddress(
    '0x' + UInt8ArrayToHexString(addressToEvm(address))
  ) as EthereumAddress
}
export const ethToSubMirror = (address: string): SubstrateAddress => {
  validateEthereumAddress(address)
  const {evmToAddress} = getPolkadotUtilCrypto()
  return evmToAddress(address) as SubstrateAddress
}

export const collectionIdToEthAddress = (collectionId: number | string): EthereumAddress => {
  const ethers = getEthers()

  return ethers.utils.getAddress(
    COLLECTION_ADDRESS_PREFIX +
    DWORDHexString.fromNumber(collectionId)
  ) as EthereumAddress
}

export const ethAddressToCollectionId = (address: string): CollectionId => {
  validateEthereumAddress(address)
  return DWORDHexString.toNumber(address.slice(-8)) as CollectionId
}

export const collectionIdAndTokenNumberToNestingAddress = (collectionId: number, tokenNumber: number): string => {
  const ethers = getEthers()

  return ethers.utils.getAddress(
    NESTING_PREFIX +
    DWORDHexString.fromNumber(collectionId) +
    DWORDHexString.fromNumber(tokenNumber)
  )
}

export const nestingAddressToCollectionIdAndTokenNumber = (address: string): {collectionId: CollectionId, tokenNumber: TokenNumber} => {
  validateEthereumAddress(address)
  return {
    collectionId: DWORDHexString.toNumber(address.slice(-16, -8)) as CollectionId,
    tokenNumber: DWORDHexString.toNumber(address.slice(-8)) as TokenNumber,
  }
}
