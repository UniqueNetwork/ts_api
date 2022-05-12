import {init, getPolkadotUtilCrypto} from '../lib/bundle.cjs'
import Web3 from 'web3'

const run = async() => {
  await init({Web3})


}

run().catch(err => console.error(err))
