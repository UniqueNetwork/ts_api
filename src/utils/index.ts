import * as Address from './address'

const StringUtils = Address.StringUtils

const Browser = {
  checkEnvironmentIsBrowser: (safe?: boolean) => {
    if (typeof window === 'undefined') {
      if (safe) {
        return false
      } else {
        throw new Error('cannot sign with extenion not in browser')
      }
    }
    return true
  }
}

export {Address, StringUtils, Browser}


export const UniqueUtils = {
  Browser,
  StringUtils,
  Address,
}
