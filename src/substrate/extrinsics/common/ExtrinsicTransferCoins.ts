import {ISubmittableResult} from '../../../types'
import {utils} from '../../../utils'
import {findEventDataBySectionAndMethod} from '../../extrinsicTools'
import {TransactionProcessor, TransactionProcessorOptions} from '../../TransactionProcessor'
import {ApiPromise} from "@polkadot/api";

export interface ExtrinsicTransferCoinsParams {
  toAddress: string
  amountInWei: bigint
}

export class ExtrinsicTransferCoins extends TransactionProcessor<ExtrinsicTransferCoinsParams> {
  private readonly toAddress: string

  constructor(api: ApiPromise, params: ExtrinsicTransferCoinsParams, options?: TransactionProcessorOptions) {
    const toAddress = utils.address.addressToAsIsOrSubstrateMirror(params.toAddress)

    const tx = api.tx.balances.transfer(toAddress, params.amountInWei)
    super(api, tx, params, options)

    this.toAddress = toAddress
  }

  protected async processResult(txResult: ISubmittableResult) {
    const data = findEventDataBySectionAndMethod(txResult, 'balances', 'Transfer')
    console.log('data', data, data?.toHuman())

    const isSuccess = !!data &&
      utils.address.compareSubstrateAddresses(this.tx.signer.toString(), data[0].toString()) &&
      utils.address.compareSubstrateAddresses(this.toAddress, data[1].toString()) &&
      data[2].eq(this.params.amountInWei)

    return {
      isSuccess,
      txResult: txResult,
      extrinsicResultData: await this.extractExtrinsicResultDataFromTxResult(txResult)
    }
  }
}
