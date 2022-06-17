import '@unique-nft/types/augment-api'
import { addressToObject } from '../../../utils/addressUtils'

import {ISubmittableResult, ApiPromise, CollectionId} from '../../../types'
import {utils} from '../../../utils'
import {findEventDataBySectionAndMethod} from '../../extrinsicTools'
import {AbstractExtrinsic, ExtrinsicOptions, ExtrinsicResult, ExtrinsicSendOptions} from '../AbstractExtrinsic'


export interface ExtrinsicRemoveFromAllowListParams {
  collectionId: CollectionId
  address: string
}

export interface ExtrinsicRemoveFromAllowListResult extends ExtrinsicResult {
  isSuccess: boolean
}

export class ExtrinsicRemoveFromAllowList extends AbstractExtrinsic<ExtrinsicRemoveFromAllowListParams, ExtrinsicRemoveFromAllowListResult> {
  constructor(api: ApiPromise, params: ExtrinsicRemoveFromAllowListParams, options?: ExtrinsicOptions) {
    const tx = api.tx.unique.removeFromAllowList(params.collectionId, addressToObject(params.address))
    super(api, tx, params)
  }

  protected async processResult(txResult: ISubmittableResult, options: ExtrinsicSendOptions) {
    const result = await this.getBaseResult(txResult, options)

    const data = findEventDataBySectionAndMethod(txResult, 'unique', 'AllowListAddressRemoved')

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
