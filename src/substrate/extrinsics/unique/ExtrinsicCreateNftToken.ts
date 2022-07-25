import {ApiPromise, CrossAccountId, ISubmittableResult} from '../../../types'
import {findEventDataBySectionAndMethod} from '../../extrinsicTools'
import {AbstractExtrinsic, ExtrinsicOptions, ExtrinsicResult, ExtrinsicSendOptions} from '../AbstractExtrinsic'
import {ExtrinsicError} from '../../../utils/errors'
import {TokenToMint, validateAndFixTokenOwner} from "./utils";

export interface ExtrinsicCreateNftTokenParams {
  collectionId: number
  token: TokenToMint
}

export interface ExtrinsicCreateNftTokenResult extends ExtrinsicResult {
  collectionId: number
  tokenId: number
  owner: CrossAccountId
}

export class ExtrinsicCreateNftToken extends AbstractExtrinsic<ExtrinsicCreateNftTokenParams, ExtrinsicCreateNftTokenResult> {
  constructor(api: ApiPromise, params: ExtrinsicCreateNftTokenParams, options?: ExtrinsicOptions) {
    const token = validateAndFixTokenOwner(JSON.parse(JSON.stringify(params.token)))

    const tx = api.tx.unique.createItem(params.collectionId, token.owner, {NFT: {properties: token.properties}})
    super(api, tx, params)
  }

  protected async processResult(txResult: ISubmittableResult, options: ExtrinsicSendOptions) {
    const result = await this.getBaseResult(txResult, options)

    const data = findEventDataBySectionAndMethod(txResult, 'common', 'ItemCreated')

    if (!data) {
      throw new Error(`No event common.ItemCreated found`)
    }

    const collectionId = parseInt(data[0].toString(), 10)
    const tokenId = parseInt(data[1].toString(), 10)
    const owner = data[2].toJSON() as CrossAccountId

    if (!tokenId) {
      throw new ExtrinsicError(txResult, 'No token id found')
    }

    return {
      ...result,
      collectionId,
      tokenId,
      owner,
    }
  }
}
