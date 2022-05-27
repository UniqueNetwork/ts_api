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
    expect(quartz.format(1_500_000_500_000_000_010n)).toBe(`1.500001 QTZ`)
    expect(quartz.format(10n)).toBe(`0 QTZ`)
    expect(quartz.format(10n, 17)).toBe(`0.00000000000000001 QTZ`)
    expect(quartz.format(15n, 17)).toBe(`0.00000000000000002 QTZ`)
    expect(quartz.format(1n, 17)).toBe(`0 QTZ`)
  })
})
