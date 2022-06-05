import {ISubmittableResult, ApiPromise} from '../../../types'
import {utils} from '../../../utils'
import {findEventDataBySectionAndMethod} from '../../extrinsicTools'
import {Transaction, TransactionOptions, TransactionResult, TransactionSendOptions} from '../../Transaction'

export interface ExtrinsicTransferCoinsParams {
  toAddress: string
  amountInWei: bigint
}

export interface ExtrinsicTransferCoinsOptions extends TransactionOptions {
  keepAccountAlive?: boolean
}

export interface ExtrinsicTransferCoinsResult extends TransactionResult {
  isSuccess: boolean
}

export class ExtrinsicTransferCoins extends Transaction<ExtrinsicTransferCoinsParams, ExtrinsicTransferCoinsResult> {
  private readonly toAddress: string

  constructor(api: ApiPromise, params: ExtrinsicTransferCoinsParams, options?: ExtrinsicTransferCoinsOptions) {
    const toAddress = utils.address.addressToAsIsOrSubstrateMirror(params.toAddress)

    const method = options?.keepAccountAlive ? 'transferKeepAlive' : 'transfer'
    const tx = api.tx.balances[method](toAddress, params.amountInWei)

    super(api, tx, params)

    this.toAddress = toAddress
  }

  protected async processResult(txResult: ISubmittableResult, options?: TransactionSendOptions) {
    const result = await this.getBaseResult(txResult, options)

    const data = findEventDataBySectionAndMethod(txResult, 'balances', 'Transfer')
    const isSuccess = !!data &&
      utils.address.compareSubstrateAddresses(this.tx.signer.toString(), data[0].toString()) &&
      utils.address.compareSubstrateAddresses(this.toAddress, data[1].toString()) &&
      data[2].eq(this.params.amountInWei)

    return {
      ...result,
      isSuccess,
    }
  }
}
