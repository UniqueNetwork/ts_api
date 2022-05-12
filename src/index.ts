import '@unique-nft/types/augment-api'

import {getPolkadotUtilCrypto, getWeb3} from './libs'
export * from './libs'


export const normalizeAddress = (address: string, prefix: number = 42) => {
  const {encodeAddress, decodeAddress} = getPolkadotUtilCrypto()
  return encodeAddress(decodeAddress(address), prefix)
}

export const subToEvmMirror = (address: string) => {
  const Web3 = getWeb3()
  const {addressToEvm} = getPolkadotUtilCrypto()

  return Web3.utils.toChecksumAddress('0x' + Buffer.from(
    addressToEvm(address)).toString('hex')
  )
}
export const evmToSubMirror = (address: string) => {
  const {evmToAddress} = getPolkadotUtilCrypto()
  return evmToAddress(address)
}

export * from './a'
