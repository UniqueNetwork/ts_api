import {KeypairType, KeyringOptions, Prefix} from "../types";
import {getPolkadotKeyring} from "../libs";

export const keyringFromSeed = (seed: string, keypairType: KeypairType = 'sr25519', ss58Format: Prefix = 42) => {
  const keyring = createKeyring({type: keypairType, ss58Format})
  return keyring.addFromUri(seed);
}
export const createKeyring = (options?: KeyringOptions) => {
  const {Keyring} = getPolkadotKeyring()
  return new Keyring(options);
}
export {KeypairType}
