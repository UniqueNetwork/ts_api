import {getPolkadotExtensionDapp} from "../libs";
import {UniqueUtils} from "../utils";

export const connectAs = async (appName: string) => {
  UniqueUtils.Browser.checkEnvironmentIsBrowser()
  const extension = getPolkadotExtensionDapp()
  await extension.web3Enable(appName)
}

export const getAllAccounts = async() => {
  UniqueUtils.Browser.checkEnvironmentIsBrowser()
  const extension = getPolkadotExtensionDapp()
  return await extension.web3Accounts()
}
