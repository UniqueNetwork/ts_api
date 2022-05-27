export interface CoinOptions {
  decimals: number
  currency: string
  symbol: string
  weiSymbol: string
}

const cutoffTrailingZerosAndPadStartWithZeros = (str: bigint | string, fullSize: number) => {
  // the idea of this function is to get right looking fractional part of a number
  // For example, with fullSize equals 8 and the str is
  // '10000' or 10000n, it should return '0001'
  // first, we pad it: '00010000'
  // and then cut off trailing zeros to '0001'
  return str.toString().padStart(fullSize, '0').replace(/\.?0*$/, '')
}

export class Coin {
  private readonly decimals: number
  private readonly currency: string
  private readonly symbol: string
  private readonly weiSymbol: string

  constructor(options: CoinOptions) {
    this.symbol = options.symbol
    this.decimals = options.decimals
    this.weiSymbol = options.weiSymbol
    this.currency = options.currency
  }

  getOptions() {
    return {
      symbol: this.symbol,
      decimals: this.decimals,
      weiSymbol: this.weiSymbol,
      currency: this.currency
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

  formatWithoutCurrency(wei: string | bigint, decimalPoints: number = 6): string {
    if (typeof decimalPoints !== 'number') {
      throw new Error(`decimalPoints should be number`)
    }
    if (!(Math.round(decimalPoints) === decimalPoints)) {
      throw new Error('decimalPoints should be integer number')
    }
    if (decimalPoints < 0 || decimalPoints > this.decimals) {
      throw new Error(`decimal points should be in range [0, ${this.decimals}]`)
    }

    const intPart = this.getIntegerPart(wei)
    const fracPart = this.getFractionalPart(wei)

    if (!decimalPoints) {
      // rounding - if the fractional part starts with 5 and greater, round up
      const appendValue = (
        fracPart.toString().length === this.decimals &&
        parseInt(fracPart.toString().charAt(0)) >= 5
      ) ? 1n : 0n
      return `${intPart + appendValue}`
    }

    const fracPartString = cutoffTrailingZerosAndPadStartWithZeros(fracPart, this.decimals)

    const nonSignificantPartLength = this.decimals - decimalPoints
    if (!nonSignificantPartLength) {
      return `${intPart}.${fracPartString}`
    }

    const fracPartIsTooSmall = fracPart < (10n ** BigInt(nonSignificantPartLength))

    if (fracPartIsTooSmall) {
      return `${intPart}`
    } else {
      // rounding - if the next digit after cutoff is 5 and greater, round up
      const appendValue = parseInt(fracPartString.charAt(decimalPoints)) >= 5 ? 1n : 0n
      const slicedAndRoundFracPart = BigInt(fracPartString.slice(0, decimalPoints)) + appendValue
      const trimmedFracPart = cutoffTrailingZerosAndPadStartWithZeros(slicedAndRoundFracPart, decimalPoints)

      return `${intPart}.${trimmedFracPart}`
    }
  }
}

