import {ISubmittableResult, ApiPromise} from '../../../types'
import {utils} from '../../../utils'
import {findEventDataBySectionAndMethod} from '../../extrinsicTools'
import {Transaction, TransactionOptions} from '../../Transaction'

export interface ExtrinsicTransferCoinsParams {
  toAddress: string
  amountInWei: bigint
}

export interface ExtrinsicTransferCoinsOptions extends TransactionOptions {
  keepAccountAlive?: boolean
}

export class ExtrinsicTransferCoins extends Transaction<ExtrinsicTransferCoinsParams> {
  private readonly toAddress: string

  constructor(api: ApiPromise, params: ExtrinsicTransferCoinsParams, options?: ExtrinsicTransferCoinsOptions) {
    const toAddress = utils.address.addressToAsIsOrSubstrateMirror(params.toAddress)

    const method = options?.keepAccountAlive ? 'transferKeepAlive' : 'transfer'
    const tx = api.tx.balances[method](toAddress, params.amountInWei)

    super(api, tx, params, options)

    this.toAddress = toAddress
  }

  protected async processResult(txResult: ISubmittableResult) {
    const data = findEventDataBySectionAndMethod(txResult, 'balances', 'Transfer')

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
