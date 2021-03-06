import {ApiPromise, ISubmittableResult} from '../../../types'
import {findEventDataBySectionAndMethod} from '../../extrinsicTools'
import {AbstractExtrinsic, ExtrinsicOptions, ExtrinsicResult, ExtrinsicSendOptions} from '../AbstractExtrinsic'


export interface ExtrinsicRemoveCollectionSponsorParams {
  collectionId: number
}

export interface ExtrinsicRemoveCollectionSponsorResult extends ExtrinsicResult {
  isSuccess: boolean
}

export class ExtrinsicRemoveCollectionSponsor extends AbstractExtrinsic<ExtrinsicRemoveCollectionSponsorParams, ExtrinsicRemoveCollectionSponsorResult> {
  constructor(api: ApiPromise, params: ExtrinsicRemoveCollectionSponsorParams, options?: ExtrinsicOptions) {
    const tx = api.tx.unique.removeCollectionSponsor(params.collectionId)

    super(api, tx, params)
  }

  protected async processResult(txResult: ISubmittableResult, options: ExtrinsicSendOptions) {
    const result = await this.getBaseResult(txResult, options)

    const data = findEventDataBySectionAndMethod(txResult, 'unique', 'CollectionSponsorRemoved')

    const isSuccess = !!data && !isNaN((parseInt(data[0].toString(), 10)))

    return {
      ...result,
      isSuccess,
    }
  }
}
