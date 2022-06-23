import {ISubmittableResult, ApiPromise, CollectionId} from '../../../types'
import {utils} from '../../../utils'
import {findEventDataBySectionAndMethod} from '../../extrinsicTools'
import {AbstractExtrinsic, ExtrinsicOptions, ExtrinsicResult, ExtrinsicSendOptions} from '../AbstractExtrinsic'


export interface ExtrinsicConfirmSponsorshipParams {
  collectionId: CollectionId
}

export interface ExtrinsicConfirmSponsorshipResult extends ExtrinsicResult {
  isSuccess: boolean
}

export class ExtrinsicConfirmSponsorship extends AbstractExtrinsic<ExtrinsicConfirmSponsorshipParams, ExtrinsicConfirmSponsorshipResult> {
  constructor(api: ApiPromise, params: ExtrinsicConfirmSponsorshipParams, options?: ExtrinsicOptions) {
    const tx = api.tx.unique.confirmSponsorship(params.collectionId)

    super(api, tx, params)
  }

  protected async processResult(txResult: ISubmittableResult, options: ExtrinsicSendOptions) {
    const result = await this.getBaseResult(txResult, options)

    const data = findEventDataBySectionAndMethod(txResult, 'unique', 'SponsorshipConfirmed')

    const isSuccess = !!data && !isNaN((parseInt(data[0].toString(), 10)))

    return {
      ...result,
      isSuccess,
    }
  }
}
