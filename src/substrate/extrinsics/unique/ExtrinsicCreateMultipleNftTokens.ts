import {ApiPromise, CrossAccountId, ISubmittableResult} from '../../../types'
import {findEventDataBySectionAndMethod, findManyEventsDataBySectionAndMethod} from '../../extrinsicTools'
import {AbstractExtrinsic, ExtrinsicOptions, ExtrinsicResult, ExtrinsicSendOptions} from '../AbstractExtrinsic'
import {TokenToMint, validateAndFixTokenOwner} from "./utils";


export interface ExtrinsicCreateMultipleNftTokensParams {
  collectionId: number
  tokens: Array<TokenToMint>
}

export interface ExtrinsicCreateMultipleNftTokensResult extends ExtrinsicResult {
  tokens: Array<{ tokenId: number, owner: CrossAccountId }>
}

export class ExtrinsicCreateMultipleNftTokens extends AbstractExtrinsic<ExtrinsicCreateMultipleNftTokensParams, ExtrinsicCreateMultipleNftTokensResult> {
  constructor(api: ApiPromise, params: ExtrinsicCreateMultipleNftTokensParams, options?: ExtrinsicOptions) {
    if (!Array.isArray(params.tokens)) {
      throw new Error(`params.tokens should be an array`)
    }
    if (params.tokens.length > 100) {
      throw new Error(`Minting multiple tokens: not more than 100 tokens at a time (got ${params.tokens.length} tokens)`)
    }

    const tokens = (JSON.parse(JSON.stringify(params.tokens)) as TokenToMint[])
      .map(validateAndFixTokenOwner)

    const tx = api.tx.unique.createMultipleItemsEx(params.collectionId, {NFT: tokens})
    super(api, tx, params)
  }

  protected async processResult(txResult: ISubmittableResult, options: ExtrinsicSendOptions) {
    const result = await this.getBaseResult(txResult, options)

    const successData = findEventDataBySectionAndMethod(txResult, 'system', 'ExtrinsicSuccess')
    const tokenDataElements = findManyEventsDataBySectionAndMethod(txResult, 'common', 'ItemCreated')

    const tokens = tokenDataElements.map(data => {
      const tokenId = (!!data && parseInt(data[1].toString(), 10))
      const owner = (!!data && data[2].toJSON()) as CrossAccountId
      return {tokenId, owner}
    })

    return {
      ...result,
      tokens,
    }
  }
}
