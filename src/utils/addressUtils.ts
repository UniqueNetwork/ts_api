import {getEthers, getPolkadotUtilCrypto} from "../libs";
import {
  DWORDHexString,
  isEthereumAddress,
  isNestingAddress,
  nestingAddressToCollectionIdAndTokenId,
  UInt8ArrayToHexString
} from "./common";
import {COLLECTION_ADDRESS_PREFIX, NESTING_PREFIX} from "../constants";
import {
  CollectionId,
  EthAddressObj,
  EthereumAddress,
  SubAddressObj,
  SubOrEthAddress,
  SubOrEthAddressObj,
  SubstrateAddress,
  TokenId,
  HexString
} from '../types'


export const validateEthereumAddress = (address: string) => {
  if (!is.ethereumAddress(address)) {
    throw new Error(`Passed address ${address} is not valid ethereum address`)
  }
}

export const validateSubstrateAddress = (address: string): SubstrateAddress => {
  const {validateAddress, decodeAddress} = getPolkadotUtilCrypto()
  try {
    validateAddress(address)
    decodeAddress(address)
  } catch(err: any) {
    throw new Error(`validateSubstrateAddress: address "${address}" is not valid`)
  }
  return address as SubstrateAddress
}

export const normalizeSubstrateAddress = (address: string, prefix: number = 42): SubstrateAddress => {
  validateSubstrateAddress(address)
  const {encodeAddress, decodeAddress} = getPolkadotUtilCrypto()
  return encodeAddress(decodeAddress(address), prefix) as SubstrateAddress
}

export const compareSubstrateAddresses = (a: HexString | string | Uint8Array, b: HexString | string | Uint8Array): boolean => {
  return getPolkadotUtilCrypto().addressEq(a,b)
}

export const normalizeEthereumAddress = (address: string): EthereumAddress => {
  const ethers = getEthers()
  return ethers.utils.getAddress(address) as EthereumAddress
}

export const subToEthMirror = (address: string): EthereumAddress => {
  validateSubstrateAddress(address)
  const {addressToEvm} = getPolkadotUtilCrypto()

  return normalizeEthereumAddress('0x' + UInt8ArrayToHexString(addressToEvm(address)))
}
export const ethToSubMirror = (address: string): SubstrateAddress => {
  validateEthereumAddress(address)
  const {evmToAddress} = getPolkadotUtilCrypto()
  return evmToAddress(address) as SubstrateAddress
}

export const collectionIdToEthAddress = (collectionId: number | string): EthereumAddress => {
  const ethers = getEthers()

  return normalizeEthereumAddress(
    COLLECTION_ADDRESS_PREFIX +
    DWORDHexString.fromNumber(collectionId)
  )
}

export const ethAddressToCollectionId = (address: string): CollectionId => {
  validateEthereumAddress(address)
  return DWORDHexString.toNumber(address.slice(-8)) as CollectionId
}

export const collectionIdAndTokenIdToNestingAddress = (collectionId: number, tokenId: number): string => {
  return normalizeEthereumAddress(
    NESTING_PREFIX +
    DWORDHexString.fromNumber(collectionId) +
    DWORDHexString.fromNumber(tokenId)
  )
}

export {nestingAddressToCollectionIdAndTokenId}

export const is = {
  substrateOrEthereumAddressObj(obj: any): obj is SubAddressObj | EthAddressObj {
    return is.substrateAddressObject(obj) || is.ethereumAddressObject(obj)
  },
  substrateAddressObject(obj: any): obj is SubAddressObj {
    return typeof obj === 'object' && typeof obj?.Substrate === 'string' && is.substrateAddress(obj.Substrate)
  },
  ethereumAddressObject(obj: any): obj is EthAddressObj {
    return typeof obj === 'object' && typeof obj?.Ethereum === 'string' && is.ethereumAddress(obj.Ethereum)
  },
  substrateOrEthereumAddress(address: string): address is SubstrateAddress | EthereumAddress  {
    return is.ethereumAddress(address) || is.substrateAddress(address)
  },
  substrateAddress(address: string): address is SubstrateAddress {
    const {validateAddress, decodeAddress} = getPolkadotUtilCrypto()
    if (is.ethereumAddress(address)) {
      return false
    }

    try {
      validateAddress(address)
      decodeAddress(address)
      return true
    } catch (err) {
      return false
    }
  },
  ethereumAddress(address: string): address is EthereumAddress {
    return isEthereumAddress(address)
  },
  nestingAddress(address: string): boolean {
    return isNestingAddress(address)
  },
  collectionAddress(address: string): boolean {
    return is.ethereumAddress(address) && address.startsWith(COLLECTION_ADDRESS_PREFIX)
  },
}

export const guessAddressAndExtractItNormalizedSafe = (address: string | object): SubOrEthAddress | false => {
  if (typeof address === 'object') {
    if (is.substrateAddressObject(address)) return normalizeSubstrateAddress(address.Substrate)
    else if (is.ethereumAddressObject(address)) return normalizeEthereumAddress(address.Ethereum)
    else return false
  }
  if (typeof address === 'string') {
    if (is.substrateAddress(address)) return normalizeSubstrateAddress(address)
    else if (is.substrateAddress(address)) return normalizeEthereumAddress(address)
    else return false
  }

  return false
}

export const guessAddressAndExtractItNormalized = (address: string | object): SubOrEthAddress => {
  const result = guessAddressAndExtractItNormalizedSafe(address)
  if (!result) {
    throw new Error(`Passed address is not a valid address string or object: ${JSON.stringify(address).slice(0, 100)}`)
  }
  return result
}

export const addressToObject = (address: string): SubOrEthAddressObj => {
  if (is.substrateAddress(address)) {
    return {Substrate: validateSubstrateAddress(address)}
  } else if (is.ethereumAddress(address)) {
    return {Ethereum: address}
  }

  throw new Error(`Passed address ${address} is not substrate nor ethereum address`)
}

export const addressToPolkadotObject = (address: string) => {
  if (is.substrateAddress(address)) {
    return {Address20: validateSubstrateAddress(address)}
  } else if (is.ethereumAddress(address)) {
    return {Address32: address}
  }

  throw new Error(`Passed address ${address} is not substrate nor ethereum address`)
}

export const addressToAsIsOrSubstrateMirror = (address: string): SubstrateAddress => {
  const addressObject = addressToObject(address)
  return addressObject.Substrate
    ? normalizeSubstrateAddress(addressObject.Substrate)
    : ethToSubMirror(addressObject.Ethereum as EthereumAddress)
}

