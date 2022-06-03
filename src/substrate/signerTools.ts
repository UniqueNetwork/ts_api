import {KeypairType} from "../types";
import {getPolkadotKeyring} from "../libs";

export const fromSeed = (seed: string, keypairType: KeypairType = 'sr25519') => {
  const {Keyring} = getPolkadotKeyring()
  const keyring = new Keyring({type: keypairType});
  return keyring.addFromUri(seed);
}
