import * as string from "./stringUtils";
import {keccak_256} from "./imports";
import {COLLECTION_ADDRESS_PREFIX, NESTING_PREFIX} from "./constants";
import {validate} from "./index";

const unsafeNormalizeEthereumAddress = (address: string) => {
  const addr = address.toLowerCase().replace(/^0x/i, '')
  const addressHash = string.u8aToHex(keccak_256(addr)).replace(/^0x/i, '')

  let checksumAddress = '0x'

  for (let i = 0; i < addr.length; i++) {
    checksumAddress += (parseInt(addressHash[i], 16) > 7)
      ? addr[i].toUpperCase()
      : addr[i]
  }

  return checksumAddress
}
export const normalizeEthereumAddress = (address: string) => {
  validate.ethereumAddress(address)
  return unsafeNormalizeEthereumAddress(address)
}

export const collectionIdToEthAddress = (collectionId: number): string | null => {
  validate.collectionId(collectionId)
  return unsafeNormalizeEthereumAddress(
    COLLECTION_ADDRESS_PREFIX +
    string.DWORDHexString.fromNumber(collectionId)
  )
}
export const ethAddressToCollectionId = (address: string): number | null => {
  validate.collectionAddress(address)
  return string.DWORDHexString.toNumber(address.slice(-8))
}

export const collectionIdAndTokenIdToNestingAddress = (collectionId: number, tokenId: number): string => {
  validate.collectionId(collectionId)
  validate.tokenId(tokenId)

  return unsafeNormalizeEthereumAddress(
    NESTING_PREFIX +
    string.DWORDHexString.fromNumber(collectionId) +
    string.DWORDHexString.fromNumber(tokenId)
  )
}

export const nestingAddressToCollectionIdAndTokenId = (address: string): { collectionId: number, tokenId: number } => {
  validate.nestingAddress(address)
  return {
    collectionId: string.DWORDHexString.toNumber(address.slice(-16, -8)),
    tokenId: string.DWORDHexString.toNumber(address.slice(-8)),
  }
}
