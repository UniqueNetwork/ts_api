import Web3 from "web3";

export const collectionIdToEthAddress = (collectionId: number | string): string => {
  const cid = typeof collectionId === 'string' ? parseInt(collectionId, 10) : collectionId

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
