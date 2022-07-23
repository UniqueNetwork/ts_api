export const vec2str = (arr: Array<number | string>) => {
  return arr
    .map(x => String.fromCharCode(typeof x === 'number' ? x : parseInt(x, 10)))
    .join('')
}

export const str2vec = (str: string) => {
  if (typeof str !== 'string') {
    return str
  }
  return str.split('').map(x => x.charCodeAt(0))
}

export const strToU8a = (str: string): Uint8Array => new Uint8Array(str2vec(str))

export const hexToU8a = (hexString: string): Uint8Array =>
  Uint8Array.from(((hexString.startsWith('0x') ? hexString.slice(2) : hexString).match(/.{1,2}/g) || []).map((byte) => parseInt(byte, 16)))

export const u8aToHex = (bytes: number[] | Uint8Array): string => {
  const arr = bytes instanceof Uint8Array ? Array.from(bytes) : bytes
  return '0x' + arr.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');
}

export const hexStringToString = (hexString: string): string =>
  ((hexString.startsWith('0x') ? hexString.slice(2) : hexString).match(/.{1,2}/g) || [])
    .map(el => String.fromCharCode(parseInt(el, 16)))
    .join('')


export const parseAndCheckTheNumberIsDWORD = (n: number | string) => {
  const num: number = (typeof n === 'string') ? parseInt(n, 10) : n

  if (isNaN(num)) throw new Error(`Passed number is NaN: ${n}`)
  if (num < 0) throw new Error(`Passed number is less than 0: ${n}`)
  if (num > 0xFFFFFFFF) throw new Error(`Passed number is more than 2**32: ${n}`)

  return num
}

export const DWORDHexString = {
  fromNumber: (n: number): string => {
    return parseAndCheckTheNumberIsDWORD(n).toString(16).padStart(8, '0')
  },
  toNumber: (s: string): number => {
    const num: number = parseInt(s, 16)

    if (isNaN(num)) throw new Error(`Passed string is not hexadecimal: ${s}`)

    return num
  }
}
