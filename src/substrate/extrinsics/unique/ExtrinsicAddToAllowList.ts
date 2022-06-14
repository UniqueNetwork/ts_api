import '@unique-nft/types/augment-api'
import { addressToObject } from 'src/utils/addressUtils'

import {ISubmittableResult, ApiPromise, CollectionId} from '../../../types'
import {utils} from '../../../utils'
import {ExtrinsicError, findEventDataBySectionAndMethod} from '../../extrinsicTools'
import {AbstractExtrinsic, ExtrinsicOptions, ExtrinsicResult, ExtrinsicSendOptions} from '../AbstractExtrinsic'


export interface ExtrinsicAddToAllowListParams {
  collectionId: CollectionId
  address: string
}

export interface ExtrinsicAddToAllowListResult extends ExtrinsicResult {
  isSuccess: boolean
}

export class ExtrinsicAddToAllowList extends AbstractExtrinsic<ExtrinsicAddToAllowListParams, ExtrinsicAddToAllowListResult> {
  constructor(api: ApiPromise, params: ExtrinsicAddToAllowListParams, options?: ExtrinsicOptions) {
    const tx = api.tx.unique.addToAllowList(params.collectionId, addressToObject(params.address))
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
