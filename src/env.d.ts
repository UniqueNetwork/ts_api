import type Web3Class from 'web3'

declare global {
  declare var Web3: typeof Web3Class
}
