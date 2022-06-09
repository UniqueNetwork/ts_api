export interface CoinOptions {
  decimals: number
  symbol: string
  weiSymbol: string
}

export class Coin {
  public readonly decimals: number
  public readonly symbol: string
  public readonly weiSymbol: string
  public readonly oneCoinInWei: bigint

  constructor(options: CoinOptions) {
    this.symbol = options.symbol
    this.weiSymbol = options.weiSymbol
    this.decimals = options.decimals
    this.oneCoinInWei = 10n ** BigInt(options.decimals)
  }

  static createUnknown18DecimalsCoin() {
    return new Coin({
      symbol: 'Unit',
      weiSymbol: 'wei',
      decimals: 18
    })
  }

  getOptions() {
    return {
      symbol: this.symbol,
      decimals: this.decimals,
      weiSymbol: this.weiSymbol,
    }
  }

  getFractionalPart(wei: bigint | string): bigint {
    const str = wei.toString()
    if (str.length <= this.decimals) return this.bigintFromWei(wei)

    return BigInt(str.slice(str.length - this.decimals))
  }

  getIntegerPart(wei: bigint | string): bigint {
    const str = wei.toString()
    if (str.length <= this.decimals) return 0n

    return BigInt(str.slice(0, str.length - this.decimals))
  }

  bigintFromWei(wei: string | bigint): bigint {
    if (typeof wei === "bigint") {
      return wei
    } else if (typeof wei === 'string') {
      if (!wei.match(/^\d+$/)) {
        throw new Error('wei should be string of digits')
      }
      return BigInt(wei)
    } else {
      throw new Error('wei should be bigint or string')
    }
  }

  format(wei: string | bigint, decimalPoints: number = 6): string {
    return this.formatWithoutCurrency(wei, decimalPoints) + ` ${this.symbol}`
  }

  // always rounds down insignificant part
  // because it's better to show '5 UNQ' on balance 5.09 UNQ instead of '5.1 UNQ'
  formatWithoutCurrency(wei: string | bigint, decimalPoints: number = 6): string {
    if (typeof decimalPoints !== 'number') {
      throw new Error(`decimalPoints should be number`)
    }
    if (!(Math.round(decimalPoints) === decimalPoints)) {
      throw new Error('decimalPoints should be integer number')
    }
    if (decimalPoints < 0) {
      throw new Error(`decimal points should be in range GTE 0`)
    }
    if (decimalPoints > this.decimals) {
      decimalPoints = this.decimals
    }

    const intPart = this.getIntegerPart(wei)
    const fracPart = this.getFractionalPart(wei)

    const nonSignificantPartLength = this.decimals - decimalPoints
    const fracPartIsTooSmall = fracPart < (10n ** BigInt(nonSignificantPartLength))

    if (!decimalPoints || fracPartIsTooSmall) {
      return intPart.toString()
    }

    const fracPartStr = fracPart.toString()
      .padStart(18, '0')
      .slice(0, decimalPoints)
      .replace(/\.?0*$/, '')

    return `${intPart}.${fracPartStr}`
  }

  /**
   * @description Dangerously because for the lossless conversion, strings should be used, not numbers.
   * Please use the `coinsToWei` method instead.
   */
  dangerouslyCoinsToWei(coins: number): bigint {
    if (coins < 0) {
      throw new Error(`coins to wei: coins should be >= 0, received ${coins}`)
    }

    const intPart = Math.floor(coins)
    if (intPart !== 0) {
      return this.coinsToWei(coins.toString())
    } else {
      return this.coinsToWei((coins + 1).toString()) - this.oneCoinInWei
    }
  }

  coinsToWei(coins: string): bigint {
    const parts = coins.trim().match(/^(\d*(\.\d*)?)/)
    if (!parts || !parts[1]) {
      throw new Error(`coinsToWei: could not parse input: ${coins}`)
    }

    const [intPart, fracPart] = parts[1].split('.')

    const finalFracPart = fracPart ? BigInt(fracPart.padEnd(18, '0')) : 0n
    return BigInt(intPart) * this.oneCoinInWei + finalFracPart
  }
}
