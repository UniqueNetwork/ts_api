import {CollectionId, EthereumAddress, TokenId} from "../types";
import {NESTING_PREFIX} from "../constants";
import {is} from "./addressUtils";

export const parseAndCheckTheNumberIsDWORD = (n: number | string) => {
  const num: number = (typeof n === 'string') ? parseInt(n, 10) : n

  if (isNaN(num)) throw new Error(`Passed number is NaN: ${n}`)
  if (num < 0) throw new Error(`Passed number is less than 0: ${n}`)
  if (num > 0xFFFFFFFF) throw new Error(`Passed number is more than 2**32: ${n}`)

  return num
}

export const DWORDHexString = {
  fromNumber: (n: number | string): string => {
    return parseAndCheckTheNumberIsDWORD(n).toString(16).padStart(8, '0')
  },
  toNumber: (s: string): number => {
    const num: number = parseInt(s, 16)

    if (isNaN(num)) throw new Error(`Passed string is not hexadecimal: ${s}`)

    return num
  }
}

export const UInt8ArrayToHexString = (array: Uint8Array): string => {
  return Array.from(array).map(el => el.toString(16).padStart(2, '0')).join('')
}

export const vec2str = (arr: Array<number | string>) => {
  return arr
    .map(x => String.fromCharCode(typeof x === 'number' ? x : parseInt(x, 16)))
    .join('')
}

export const str2vec = (str: string) => {
  if (typeof str !== 'string') {
    return str
  }
  return Array.from(str).map(x => x.charCodeAt(0))
}

export const hexToU8a = (hexString: string): Uint8Array =>
  Uint8Array.from(((hexString.startsWith('0x') ? hexString.slice(2) : hexString).match(/.{1,2}/g) || []).map((byte) => parseInt(byte, 16)))




export const u8aToHex = (bytes: number[] | Uint8Array): string => {
  const arr = bytes instanceof Uint8Array ? Array.from(bytes) : bytes
  return arr.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');
}



export const checkEnvironmentIsBrowser = (safe?: boolean) => {
  if (typeof window === 'undefined') {
    if (safe) {
      return false
    } else {
      throw new Error('cannot sign with extenion not in browser')
    }
  }
  return true
}


const ETH_ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/

export const isEthereumAddress = (address: string): address is EthereumAddress => {
  return typeof address === 'string'&& address.length === 42 && !!address.match(ETH_ADDRESS_REGEX)
}
export const isNestingAddress = (address: string): boolean  => {
  return isEthereumAddress(address) && address.startsWith(NESTING_PREFIX)
}

export const nestingAddressToCollectionIdAndTokenId = (address: string): { collectionId: CollectionId, tokenId: TokenId } => {
  if (!isNestingAddress(address)) {
    throw new Error(`Passed address ${address} is not valid ethereum address`)
  }
  return {
    collectionId: DWORDHexString.toNumber(address.slice(-16, -8)) as CollectionId,
    tokenId: DWORDHexString.toNumber(address.slice(-8)) as TokenId,
  }
}

