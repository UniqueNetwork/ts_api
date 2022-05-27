import {Coin} from './coin'
export {Coin}

export const quartz = new Coin({
  currency: 'Quartz',
  symbol: 'QTZ',
  weiSymbol: 'wei',
  decimals: 18,
})

export const unique = new Coin({
  currency: 'Unique',
  symbol: 'UNQ',
  weiSymbol: 'wei',
  decimals: 18,
})

export const opal = new Coin({
  currency: 'Opal',
  symbol: 'OPL',
  weiSymbol: 'wei',
  decimals: 18,
})
