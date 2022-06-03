import '@unique-nft/types/augment-api'

import {ISubmittableResult, ApiPromise, CollectionId} from '../../../types'
import {utils} from '../../../utils'
import {ExtrinsicError, findEventDataBySectionAndMethod} from '../../extrinsicTools'
import {Transaction, TransactionOptions, TransactionResult} from '../../Transaction'

import {CollectionParams} from "./types";

export interface ExtrinsicCreateCollectionParams {
  collection: CollectionParams
}

export interface ExtrinsicCreateCollectionResult extends TransactionResult {
  collectionId: CollectionId
}

export class ExtrinsicCreateCollection extends Transaction<ExtrinsicCreateCollectionParams, ExtrinsicCreateCollectionResult> {
  constructor(api: ApiPromise, params: ExtrinsicCreateCollectionParams, options?: TransactionOptions) {
    const collection = JSON.parse(JSON.stringify(params.collection))

    if (!collection.mode) {
      collection.mode = {nft: null}
    }

    for (const fieldName of ['name', 'description', 'tokenPrefix']) {
      ;(collection as any)[fieldName] = utils.common.str2vec((collection as any)[fieldName])
    }

    const tx = api.tx.unique.createCollectionEx(collection)
    super(api, tx, params, options)
  }

  protected async processResult(txResult: ISubmittableResult) {
    const data = findEventDataBySectionAndMethod(txResult, 'common', 'CollectionCreated')
    console.log('data', data, data?.toHuman())

    const collectionId = (!!data && parseInt(data[0].toString(), 10) as CollectionId) || null

    if (!collectionId) {
      throw new ExtrinsicError(txResult, 'No collection id found')
    }

    if (typeof window !== 'undefined') {
      ;(window as any).createCollectionExResult = data
    }

    return {
      isSuccess: true,
      txResult: txResult,
      collectionId,
      extrinsicResultData: await this.extractExtrinsicResultDataFromTxResult(txResult)
    }
  }
}
