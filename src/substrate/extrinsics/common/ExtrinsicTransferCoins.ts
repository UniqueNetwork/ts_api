import {ISubmittableResult, ApiPromise} from '../../../types'
import {utils} from '../../../utils'
import {findEventDataBySectionAndMethod} from '../../extrinsicTools'
import {AbstractExtrinsic, ExtrinsicOptions, ExtrinsicResult, ExtrinsicSendOptions} from "../AbstractExtrinsic";

export interface ExtrinsicTransferCoinsParams {
  toAddress: string
  amountInWei: bigint
}

export interface ExtrinsicTransferCoinsOptions extends ExtrinsicOptions {
  keepAccountAlive?: boolean
}

export interface ExtrinsicTransferCoinsResult extends ExtrinsicResult {
  isSuccess: boolean
}

export class ExtrinsicTransferCoins extends AbstractExtrinsic<ExtrinsicTransferCoinsParams, ExtrinsicTransferCoinsResult> {
  constructor(api: ApiPromise, params: ExtrinsicTransferCoinsParams, options?: ExtrinsicTransferCoinsOptions) {
    const method = options?.keepAccountAlive ? 'transferKeepAlive' : 'transfer'
    const tx = api.tx.balances[method](params.toAddress, params.amountInWei)

    super(api, tx, params)
  }

  protected async processResult(txResult: ISubmittableResult, options?: ExtrinsicSendOptions) {
    const result = await this.getBaseResult(txResult, options)

    const data = findEventDataBySectionAndMethod(txResult, 'balances', 'Transfer')
    const isSuccess = !!data &&
      utils.address.compareSubstrateAddresses(this.tx.signer.toString(), data[0].toString()) &&
      utils.address.compareSubstrateAddresses(this.params.toAddress, data[1].toString()) &&
      data[2].eq(this.params.amountInWei)

    return {
      ...result,
      isSuccess,
    }
  }
}
