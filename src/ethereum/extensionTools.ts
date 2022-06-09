export const requestAccounts = async () => {
  if (typeof window === 'undefined') {
    throw new Error(`Cannot access window. It's necessary `)
  }
  let accounts: string[] = []
  try {
    accounts = await window.ethereum.request({method: 'eth_requestAccounts'})
  } catch (err: any) {
    // console.error(err)

    if (err.code === 4001) {
      // EIP-1193 userRejectedRequest error
      // If this happens, the user rejected the connection request.
      throw new Error('User rejected')
    }
    throw err
  }
  return accounts
}
