import '@unique-nft/types/augment-api'

import {ISubmittableResult, ApiPromise, CollectionId} from '../../../types'
import {utils} from '../../../utils'
import {ExtrinsicError, findEventDataBySectionAndMethod} from '../../extrinsicTools'
import {AbstractExtrinsic, ExtrinsicOptions, ExtrinsicResult, ExtrinsicSendOptions} from '../AbstractExtrinsic'

import {CollectionParams} from "./types";

export interface ExtrinsicSetCollectionSponsorParams {
  collectionId: CollectionId
  newSponsorAddress: string
}

export interface ExtrinsicSetCollectionSponsorResult extends ExtrinsicResult {
  isSuccess: boolean
}

export class ExtrinsicSetCollectionSponsor extends AbstractExtrinsic<ExtrinsicSetCollectionSponsorParams, ExtrinsicSetCollectionSponsorResult> {
  constructor(api: ApiPromise, params: ExtrinsicSetCollectionSponsorParams, options?: ExtrinsicOptions) {
    const tx = api.tx.unique.setCollectionSponsor(params.collectionId, params.newSponsorAddress)
    super(api, tx, params)
  }

  protected async processResult(txResult: ISubmittableResult, options: ExtrinsicSendOptions) {
    const result = await this.getBaseResult(txResult, options)

    const data = findEventDataBySectionAndMethod(txResult, 'unique', 'CollectionSponsorSet')

    const isSuccess = !!data && !isNaN((parseInt(data[0].toString(), 10)))

    return {
      ...result,
      isSuccess
    }
  }
}
