import {getPolkadotExtensionDapp} from "../libs";
import {utils} from "../utils";

export const enablePolkadotExtension = async (appName: string) => {
  console.log('Enabling polkadot.js extension', appName)
  utils.common.checkEnvironmentIsBrowser()
  const extension = getPolkadotExtensionDapp()
  await extension.web3Enable(appName)
}

export const getAllAccounts = async() => {
  utils.common.checkEnvironmentIsBrowser()
  const extension = getPolkadotExtensionDapp()
  return await extension.web3Accounts()
}
