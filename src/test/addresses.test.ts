import {describe, expect, test} from 'vitest'
import {init, utils} from '../index'

describe('addresses', async () => {
  await init()

  const opal = '5D7WxWqqUYNm962RUNdf1UTCcuasXCigHFMGG4hWX6hkp7zU'
  const quartz = 'yGDnKaHASMGaWSKS4Tv3SNQpTyJH89Ao3LfhgzcMbdhz6y2VT'
  const unique = 'unfZsSFU21ZtJwkEztT1Tc7c6T9R9GxseJgeUDwFQLSs8UDLb'
  const ethMirror = '0x2E61479A581F023808AAa5f2EC90bE6c2b250102'
  const doubleMirror = '5HikVEnsQT3U9LyTh5X9Bewud1wv4WkS7ovxrHRMCT2DFZPY'

  test.concurrent('subToEthMirror', () => {
    expect(utils.address.subToEthMirror(opal)).toBe(ethMirror)
    expect(() => {
      utils.address.subToEthMirror('123')
    }).toThrowError()
  })

  test.concurrent('ethToSubMirror', () => {
    expect(utils.address.ethToSubMirror(ethMirror)).toBe(doubleMirror)
    expect(() => {
      utils.address.ethToSubMirror('123')
    }).toThrowError()
  })

  test.concurrent('normalizeAddress', () => {
    expect(utils.address.normalizeAddress(quartz)).toBe(opal)
    expect(utils.address.normalizeAddress(quartz, 7391)).toBe(unique)
    expect(() => {
      utils.address.normalizeAddress('123')
    }).toThrowError()
  })

  test.concurrent('Collection address ', () => {
    expect(utils.address.collectionIdToEthAddress(127))
      .toBe('0x17c4e6453cC49aAAAeACa894E6d9683E0000007f')

    expect(() => {
      utils.address.collectionIdToEthAddress(2 ** 32)
    }).toThrow()

    expect(utils.address.ethAddressToCollectionId('0x17c4E6453CC49AAAAEAca894E6D9683e000000fF'))
      .toBe(255)

    expect(() => {
      utils.address.ethAddressToCollectionId('0x17c4E6453CC49AAAAEAca894E6D9683e000000f')
    }).toThrow()
  })

  test.concurrent('Nesting address', () => {
    expect(utils.address.nestingAddressToCollectionIdAndTokenNumber('0xF8238cCfFf8Ed887463Fd5E00000000000000000'))
      .toEqual({collectionId: 0, tokenNumber: 0})

    expect(utils.address.nestingAddressToCollectionIdAndTokenNumber('0xF8238CCFfF8ed887463fd5E0000000fE0000007F'))
      .toEqual({collectionId: 254, tokenNumber: 127})

    expect(utils.address.nestingAddressToCollectionIdAndTokenNumber('0xF8238CcFFF8ed887463fD5E0fffffFFFFFfFFffF'))
      .toEqual({collectionId: 2 ** 32 - 1, tokenNumber: 2 ** 32 - 1})

    expect(() => {utils.address.nestingAddressToCollectionIdAndTokenNumber('0xF8238CCFfF8ed887463fd5E0000000fE0000007')})
      .toThrow()

    expect(utils.address.collectionIdAndTokenNumberToNestingAddress(0, 0))
      .toBe('0xF8238cCfFf8Ed887463Fd5E00000000000000000')

    expect(utils.address.collectionIdAndTokenNumberToNestingAddress(254, 127))
      .toBe('0xF8238CCFfF8ed887463fd5E0000000fE0000007F')

    expect(utils.address.collectionIdAndTokenNumberToNestingAddress(2 ** 32 - 1, 2 ** 32 - 1))
      .toBe('0xF8238CcFFF8ed887463fD5E0fffffFFFFFfFFffF')

    expect(() => {
      utils.address.collectionIdAndTokenNumberToNestingAddress(-1, 0)
    }).toThrow()
    expect(() => {
      utils.address.collectionIdAndTokenNumberToNestingAddress(2 ** 32, 0)
    }).toThrow()
    expect(() => {
      utils.address.collectionIdAndTokenNumberToNestingAddress(0, -1)
    }).toThrow()
    expect(() => {
      utils.address.collectionIdAndTokenNumberToNestingAddress(0, 2 ** 32)
    }).toThrow()
    expect(() => {
      utils.address.collectionIdAndTokenNumberToNestingAddress(-1, -1)
    }).toThrow()
    expect(() => {
      utils.address.collectionIdAndTokenNumberToNestingAddress(2 ** 32, 2 ** 32)
    }).toThrow()
  })
})
