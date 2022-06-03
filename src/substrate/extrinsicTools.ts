import '@unique-nft/types/augment-api'

import {
  GenericEventData,
  InjectedAccountWithMeta,
  ISigner,
  ISubmittableResult,
  KeyringPair,
  SubmittableExtrinsic,
  SubmittableResult
} from '../types'
import {getPolkadotExtensionDapp} from '../libs'
import {utils} from '../utils'

const signerIs = {
  keyring(signer: ISigner): signer is KeyringPair {
    return typeof (signer as KeyringPair).sign === 'function'
  },
  extensionAccount(signer: ISigner): signer is InjectedAccountWithMeta {
    const address = (signer as InjectedAccountWithMeta).address
    return utils.address.is.substrateAddress(address) && typeof signer.meta.source === "string"
  },
}

export const findEventDataBySectionAndMethod = (txResult: ISubmittableResult, section: string, method: string): GenericEventData | undefined => {
  return txResult.events.find(event =>
    event.event.section === section && event.event.method === method
  )?.event.data
}

export class ExtrinsicError extends Error {
  txResult: ISubmittableResult

  constructor(txResult: SubmittableResult, errMessage: string, label?: string)  {
    if (!label) {
      const info = txResult.dispatchInfo?.toHuman()
      label = `transaction ${info?.section}${info?.method}`
    }
    super(`Transaction failed: "${errMessage}"${label ? ' for' + label : ''}.`)
    this.txResult = txResult
  }
}

enum TransactionStatus {
  NOT_READY= 'NOT_READY',
  FAIL= 'FAIL',
  SUCCESS= 'SUCCESS'
}
const getTransactionStatus = ({events, status}: SubmittableResult): TransactionStatus => {
  if (status.isReady) {
    return TransactionStatus.NOT_READY;
  }
  if (status.isBroadcast) {
    return TransactionStatus.NOT_READY;
  }
  if (status.isInBlock || status.isFinalized) {
    if (events.find(e => e.event.data.method === 'ExtrinsicFailed')) {
      return TransactionStatus.FAIL;
    }
    if (events.find(e => e.event.data.method === 'ExtrinsicSuccess')) {
      return TransactionStatus.SUCCESS;
    }
  }

  return TransactionStatus.FAIL;
}


export const signTransaction = async <T extends SubmittableExtrinsic>(tx: T, signer: ISigner, label = ''): Promise<T> => {
  if (signerIs.keyring(signer)) {
    return tx.signAsync(signer)
  }

  if (signerIs.extensionAccount(signer)) {
    if (typeof window === 'undefined') {
      throw new Error('cannot sign with extenion not in browser')
    }
    const extension = getPolkadotExtensionDapp()
    const injector = await extension.web3FromAddress(signer.address)
    return tx.signAsync(signer.address, {signer: injector.signer})
  }

  throw new Error('Attempt to sign failed: no keyring or valid substrate address to sign by extension provided')
}

export const sendTransaction = async <T extends SubmittableExtrinsic>(tx: T, label = '') => {
  if (!label) {
    const {section, method} = tx.unwrap().method.toHuman()
    label = `transaction ${section}.${method}`
  }

  return new Promise<ISubmittableResult>(async (resolve, reject) => {
    let unsub = await tx.send(txResult => {
      const status = getTransactionStatus(txResult)

      if (status === TransactionStatus.SUCCESS) {
        resolve(txResult);
        unsub();
      } else if (status === TransactionStatus.FAIL) {
        let errMessage = ''

        if (txResult.dispatchError?.isModule) {
          // for module errors, we have the section indexed, lookup
          const decoded = tx.registry.findMetaError(txResult.dispatchError.asModule);
          const {docs, name, section} = decoded;
          errMessage = `${section}.${name}: ${docs.join(' ')}`
        } else {
          // Other, CannotLookup, BadOrigin, no extra info
          errMessage = txResult.dispatchError?.toString() || 'Unknown error'
        }

        reject(new ExtrinsicError(txResult, errMessage, label))
        unsub()
      }
    });
  });
}

export const signAndSendTransaction = async <T extends SubmittableExtrinsic>(tx: T, signer: ISigner, label = '') => {
  return await sendTransaction(await signTransaction(tx, signer))
}

