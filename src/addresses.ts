import '@unique-nft/types/augment-api'
import {getPolkadotUtilCrypto, getWeb3} from "./libs";

export const normalizeAddress = (address: string, prefix: number = 42) => {
  const {encodeAddress, decodeAddress} = getPolkadotUtilCrypto()
  return encodeAddress(decodeAddress(address), prefix)
}

export const subToEthMirror = (address: string) => {
  const Web3 = getWeb3()
  const {addressToEvm} = getPolkadotUtilCrypto()

  return Web3.utils.toChecksumAddress('0x' + Buffer.from(
    addressToEvm(address)).toString('hex')
  )
}
export const ethToSubMirror = (address: string) => {
  const {evmToAddress} = getPolkadotUtilCrypto()
  return evmToAddress(address)
}

export const collectionIdToEthAddress = (collectionId: number | string): string => {
  const cid = typeof collectionId === 'string' ? parseInt(collectionId, 10) : collectionId

  const Web3 = getWeb3()

  return Web3.utils.toChecksumAddress(
    '0x17c4e6453cc49aaaaeaca894e6d9683e' +
    cid.toString(16).padStart(8, '0')
  )
}

export const ethAddressToCollectionId = (address: string): number => {
  if (!([40, 42].includes(address.length))) {
    throw new Error('address wrong format');
  }
  return parseInt(address.slice(-8), 16);
}
