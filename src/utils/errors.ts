import {ISubmittableResult, SubmittableResult} from "../types";

export class ValidationError extends TypeError {
  constructor(message: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

export class ExtrinsicError extends Error {
  txResult: ISubmittableResult

  constructor(txResult: SubmittableResult, errMessage: string, label?: string) {
    if (!label) {
      const info = txResult.dispatchInfo?.toHuman()
      label = `transaction ${info?.section}${info?.method}`
    }
    super(`Transaction failed: "${errMessage}"${label ? ' for' + label : ''}.`)
    this.txResult = txResult
  }
}
