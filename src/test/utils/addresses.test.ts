import {describe, expect, test} from 'vitest'
import {init, UniqueUtils} from '../../index'

describe('addresses', async () => {
  await init()

  const opal = '5D7WxWqqUYNm962RUNdf1UTCcuasXCigHFMGG4hWX6hkp7zU'
  const quartz = 'yGDnKaHASMGaWSKS4Tv3SNQpTyJH89Ao3LfhgzcMbdhz6y2VT'
  const unique = 'unfZsSFU21ZtJwkEztT1Tc7c6T9R9GxseJgeUDwFQLSs8UDLb'
  const ethMirror = '0x2E61479A581F023808AAa5f2EC90bE6c2b250102'
  const doubleMirror = '5HikVEnsQT3U9LyTh5X9Bewud1wv4WkS7ovxrHRMCT2DFZPY'

  const ethAddress = '0x1B7AAcb25894D792601BBE4Ed34E07Ed14Fd31eB'
  const subMirrorOfEthAddress = '5EctGy9Wyoa8XT8fV8hrJHL6ywaSb2ui29vs47Ybe8jfMYHR'

  test.concurrent('is', () => {
    expect(UniqueUtils.Address.is.substrateAddress(opal)).toBe(true)
    expect(UniqueUtils.Address.is.substrateAddress(ethAddress)).toBe(false)
    expect(UniqueUtils.Address.is.substrateAddress('123')).toBe(false)

    expect(UniqueUtils.Address.is.ethereumAddress(opal)).toBe(false)
    expect(UniqueUtils.Address.is.ethereumAddress(ethAddress)).toBe(true)
    expect(UniqueUtils.Address.is.ethereumAddress('123')).toBe(false)
  })

  test.concurrent('subToEthMirror', () => {
    expect(UniqueUtils.Address.subToEthMirror(opal)).toBe(ethMirror)
    expect(() => {
      UniqueUtils.Address.subToEthMirror('123')
    }).toThrowError()
  })

  test.concurrent('ethToSubMirror', () => {
    expect(UniqueUtils.Address.ethToSubMirror(ethMirror)).toBe(doubleMirror)
    expect(UniqueUtils.Address.ethToSubMirror(ethAddress)).toBe(subMirrorOfEthAddress)
    expect(() => {
      UniqueUtils.Address.ethToSubMirror('123')
    }).toThrowError()
  })

  test.concurrent('normalizeSubstrateAddress', () => {
    expect(UniqueUtils.Address.normalizeSubstrateAddress(quartz)).toBe(opal)
    expect(UniqueUtils.Address.normalizeSubstrateAddress(quartz, 7391)).toBe(unique)
    expect(() => {
      UniqueUtils.Address.normalizeSubstrateAddress('123')
    }).toThrowError()
  })

  test.concurrent('normalizeEthereumAddress', () => {
    expect(UniqueUtils.Address.normalizeEthereumAddress(ethMirror.toLowerCase())).toBe(ethMirror)
    expect(() => {
      UniqueUtils.Address.normalizeEthereumAddress('123')
    }).toThrowError()
  })

  test.concurrent('Collection address ', () => {
    expect(UniqueUtils.Address.collectionIdToEthAddress(127))
      .toBe('0x17c4e6453cC49aAAAeACa894E6d9683E0000007f')

    expect(() => {
      UniqueUtils.Address.collectionIdToEthAddress(2 ** 32)
    }).toThrow()

    expect(UniqueUtils.Address.ethAddressToCollectionId('0x17c4E6453CC49AAAAEAca894E6D9683e000000fF'))
      .toBe(255)

    expect(() => {
      UniqueUtils.Address.ethAddressToCollectionId('0x17c4E6453CC49AAAAEAca894E6D9683e000000f')
    }).toThrow()
  })

  test.concurrent('Nesting address', () => {
    expect(UniqueUtils.Address.nestingAddressToCollectionIdAndTokenId('0xF8238cCfFf8Ed887463Fd5E00000000000000000'))
      .toEqual({collectionId: 0, tokenId: 0})

    expect(UniqueUtils.Address.nestingAddressToCollectionIdAndTokenId('0xF8238CCFfF8ed887463fd5E0000000fE0000007F'))
      .toEqual({collectionId: 254, tokenId: 127})

    expect(UniqueUtils.Address.nestingAddressToCollectionIdAndTokenId('0xF8238CcFFF8ed887463fD5E0fffffFFFFFfFFffF'))
      .toEqual({collectionId: 2 ** 32 - 1, tokenId: 2 ** 32 - 1})

    expect(() => {UniqueUtils.Address.nestingAddressToCollectionIdAndTokenId('0xF8238CCFfF8ed887463fd5E0000000fE0000007')})
      .toThrow()

    expect(UniqueUtils.Address.collectionIdAndTokenIdToNestingAddress(0, 0))
      .toBe('0xF8238cCfFf8Ed887463Fd5E00000000000000000')

    expect(UniqueUtils.Address.collectionIdAndTokenIdToNestingAddress(254, 127))
      .toBe('0xF8238CCFfF8ed887463fd5E0000000fE0000007F')

    expect(UniqueUtils.Address.collectionIdAndTokenIdToNestingAddress(2 ** 32 - 1, 2 ** 32 - 1))
      .toBe('0xF8238CcFFF8ed887463fD5E0fffffFFFFFfFFffF')

    expect(() => {
      UniqueUtils.Address.collectionIdAndTokenIdToNestingAddress(-1, 0)
    }).toThrow()
    expect(() => {
      UniqueUtils.Address.collectionIdAndTokenIdToNestingAddress(2 ** 32, 0)
    }).toThrow()
    expect(() => {
      UniqueUtils.Address.collectionIdAndTokenIdToNestingAddress(0, -1)
    }).toThrow()
    expect(() => {
      UniqueUtils.Address.collectionIdAndTokenIdToNestingAddress(0, 2 ** 32)
    }).toThrow()
    expect(() => {
      UniqueUtils.Address.collectionIdAndTokenIdToNestingAddress(-1, -1)
    }).toThrow()
    expect(() => {
      UniqueUtils.Address.collectionIdAndTokenIdToNestingAddress(2 ** 32, 2 ** 32)
    }).toThrow()
  })
})
