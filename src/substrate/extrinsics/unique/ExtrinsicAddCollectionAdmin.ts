import {Address} from '../../../utils'

import {ApiPromise, ISubmittableResult} from '../../../types'
import {findEventDataBySectionAndMethod} from '../../extrinsicTools'
import {AbstractExtrinsic, ExtrinsicOptions, ExtrinsicResult, ExtrinsicSendOptions} from '../AbstractExtrinsic'

export interface ExtrinsicAddCollectionAdminParams {
  collectionId: number
  newAdminAddress: string
}

export interface ExtrinsicAddCollectionAdminResult extends ExtrinsicResult {
  isSuccess: boolean
}

export class ExtrinsicAddCollectionAdmin extends AbstractExtrinsic<ExtrinsicAddCollectionAdminParams, ExtrinsicAddCollectionAdminResult> {
  constructor(api: ApiPromise, params: ExtrinsicAddCollectionAdminParams, options?: ExtrinsicOptions) {

    const tx = api.tx.unique.addCollectionAdmin(params.collectionId, Address.to.crossAccountId(params.newAdminAddress))

    super(api, tx, params)
  }

  protected async processResult(txResult: ISubmittableResult, options: ExtrinsicSendOptions) {
    const result = await this.getBaseResult(txResult, options)

    const data = findEventDataBySectionAndMethod(txResult, 'unique', 'CollectionAdminAdded')

    const isSuccess = !!data && !isNaN((parseInt(data[0].toString(), 10)))

    return {
      ...result,
      isSuccess,
    }
  }
}
