import {getPolkadotExtensionDapp} from "../libs";
import {UniqueUtils} from "../utils";

export const connectAs = async (appName: string) => {
  // console.log('Enabling polkadot.js extension', appName)
  UniqueUtils.Browser.checkEnvironmentIsBrowser()
  const extension = getPolkadotExtensionDapp()
  await extension.web3Enable(appName)
}

export const getAllAccounts = async() => {
  UniqueUtils.Browser.checkEnvironmentIsBrowser()
  const extension = getPolkadotExtensionDapp()
  return await extension.web3Accounts()
}
