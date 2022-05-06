import '@unique-nft/types/augment-api'

import {decodeAddress, encodeAddress, addressToEvm, evmToAddress} from '@polkadot/util-crypto'

import Web3 from 'web3'


export const normalizeAddress = (address: string, prefix: number = 42) => {
  return encodeAddress(decodeAddress(address), prefix)
}

export const subToEvmMirror = (address: string) => {
  return Web3.utils.toChecksumAddress('0x' + Buffer.from(
    addressToEvm(address)).toString('hex')
  )
}
export const evmToSubMirror = (address: string) => {
  return evmToAddress(address)
}

export * from './a'