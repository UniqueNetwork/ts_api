import * as Address from './address'
import {Semver} from './semver'

const StringUtils = Address.string

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

export {Address, StringUtils, Semver, Browser}


export const UniqueUtils = {
  Browser,
  StringUtils,
  Address,
  Semver,
}
