import {ISubmittableResult, ApiPromise, CollectionId} from '../../../types'
import {utils} from '../../../utils'
import {findEventDataBySectionAndMethod} from '../../extrinsicTools'
import {AbstractExtrinsic, ExtrinsicOptions, ExtrinsicResult, ExtrinsicSendOptions} from '../AbstractExtrinsic'
import {ExtrinsicError} from '../../../utils/errors'

import {CollectionParams} from "./types";

export interface ExtrinsicCreateCollectionParams {
  collection: CollectionParams
}

export interface ExtrinsicCreateCollectionResult extends ExtrinsicResult {
  collectionId: number
}

export class ExtrinsicCreateCollection extends AbstractExtrinsic<ExtrinsicCreateCollectionParams, ExtrinsicCreateCollectionResult> {
  constructor(api: ApiPromise, params: ExtrinsicCreateCollectionParams, options?: ExtrinsicOptions) {
    const collection = JSON.parse(JSON.stringify(params.collection))

    if (!collection.mode) {
      collection.mode = {nft: null}
    }

    for (const fieldName of ['name', 'description', 'tokenPrefix']) {
      ;(collection as any)[fieldName] = utils.common.str2vec((collection as any)[fieldName])
    }

    const tx = api.tx.unique.createCollectionEx(collection)
    super(api, tx, params)
  }

  protected async processResult(txResult: ISubmittableResult, options: ExtrinsicSendOptions) {
    const result = await this.getBaseResult(txResult, options)

    const data = findEventDataBySectionAndMethod(txResult, 'common', 'CollectionCreated')
    // console.log('data', data, data?.toHuman())

    const collectionId = (!!data && parseInt(data[0].toString(), 10) as CollectionId) || null

    if (!collectionId) {
      throw new ExtrinsicError(txResult, 'No collection id found')
    }

    return {
      ...result,
      collectionId,
    }
  }
}
