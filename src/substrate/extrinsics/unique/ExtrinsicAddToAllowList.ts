import '@unique-nft/types/augment-api'
import { addressToObject } from '../../../utils/addressUtils'

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

    const data = findEventDataBySectionAndMethod(txResult, 'unique', 'AllowListAddressAdded')

    const isSuccess = !!data &&
      !isNaN((parseInt(data[0].toString(), 10))) &&
      !!data[1].toString()

    // console.log(!!data ? JSON.parse(data[1].toString()) : 'null')

    return {
      ...result,
      isSuccess,
    }
  }
}
