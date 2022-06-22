import {ISubmittableResult, ApiPromise, CollectionId} from '../../../types'
import {utils} from '../../../utils'
import {findEventDataBySectionAndMethod} from '../../extrinsicTools'
import {AbstractExtrinsic, ExtrinsicOptions, ExtrinsicResult, ExtrinsicSendOptions} from '../AbstractExtrinsic'


export interface ExtrinsicChangeCollectionOwnerParams {
  collectionId: CollectionId
  newOwnerAddress: string
}

export interface ExtrinsicChangeCollectionOwnerResult extends ExtrinsicResult {
  isSuccess: boolean
}

export class ExtrinsicChangeCollectionOwner extends AbstractExtrinsic<ExtrinsicChangeCollectionOwnerParams, ExtrinsicChangeCollectionOwnerResult> {
  constructor(api: ApiPromise, params: ExtrinsicChangeCollectionOwnerParams, options?: ExtrinsicOptions) {
    const tx = api.tx.unique.changeCollectionOwner(params.collectionId, params.newOwnerAddress)
    super(api, tx, params)
  }

  protected async processResult(txResult: ISubmittableResult, options: ExtrinsicSendOptions) {
    const result = await this.getBaseResult(txResult, options)

    const data = findEventDataBySectionAndMethod(txResult, 'unique', 'CollectionOwnedChanged')

    const isSuccess = !!data && !isNaN((parseInt(data[0].toString(), 10)))

    return {
      ...result,
      isSuccess,
    }
  }
}
