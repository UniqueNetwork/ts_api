import {describe, expect, test} from "vitest";
import * as coins from "../coin";

describe('coin', () => {
  const {quartz} = coins
  const n20 = 12345678901234567890n

  const randomBigintString = '329847239847239487329488723468723648'
  const randomBigint = 329847239847239487329488723468723648n

  test.concurrent('fractional part', () => {
    expect(quartz.getFractionalPart(n20)).toBe(345678901234567890n)
    expect(quartz.getFractionalPart(-1n)).toBe(-1n)
  })
  test.concurrent('integer part', () => {
    expect(quartz.getIntegerPart(n20)).toBe(12n)
    expect(quartz.getIntegerPart(-1n)).toBe(0n)
  })
  test.concurrent('bigintFromWei', () => {
    expect(quartz.bigintFromWei(randomBigintString)).toBe(randomBigint)
    expect(quartz.bigintFromWei(randomBigint)).toBe(randomBigint)
    expect(() => {
      //@ts-ignore
      quartz.bigintFromWei(123)
    }).toThrowError()
    expect(() => {quartz.bigintFromWei('123q')}).toThrowError()
  })
  test.concurrent('format', () => {
    expect(quartz.format(1_000_000_000_000_000_010n)).toBe(`1 QTZ`)
    expect(quartz.format(1_500_000_000_000_000_010n)).toBe(`1.5 QTZ`)
    expect(quartz.format(1_500_000_400_000_000_010n)).toBe(`1.5 QTZ`)
    expect(quartz.format(1_500_000_500_000_000_010n)).toBe(`1.5 QTZ`)
    expect(quartz.format(10n)).toBe(`0 QTZ`)
    expect(quartz.format(10n, 17)).toBe(`0.00000000000000001 QTZ`)
    expect(quartz.format(15n, 17)).toBe(`0.00000000000000001 QTZ`)
    expect(quartz.format(1n, 17)).toBe(`0 QTZ`)

    expect(quartz.format(117535000000000000n, 9)).toBe(`0.117535 QTZ`)
    expect(quartz.format(11753500000000000n, 9)).toBe(`0.0117535 QTZ`)
    expect(quartz.format(11700000000000000n)).toBe(`0.0117 QTZ`)
  })
  test.concurrent('dangerouslyCoinsToWei', () => {
    expect(quartz.dangerouslyCoinsToWei(1.5)).toBe(1_500_000_000_000_000_000n)
    expect(quartz.dangerouslyCoinsToWei(1)).toBe(1_000_000_000_000_000_000n)
    expect(quartz.dangerouslyCoinsToWei(1_000_000_000.123)).toBe(1_000_000_000_123_000_000_000_000_000n)
    expect(quartz.dangerouslyCoinsToWei(0.000_000_000_000_001)).toBe(1_000n)
  })
  test.concurrent('coinsToWei', () => {
    expect(quartz.coinsToWei('1.5')).toBe(1_500_000_000_000_000_000n)
    expect(quartz.coinsToWei('1')).toBe(1_000_000_000_000_000_000n)
    expect(quartz.coinsToWei('1000000000.123')).toBe(1_000_000_000_123_000_000_000_000_000n)
    expect(quartz.coinsToWei('0.000000000000001')).toBe(1_000n)
  })
})
