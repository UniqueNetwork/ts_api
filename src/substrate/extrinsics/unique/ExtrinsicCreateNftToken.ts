import {
  ISubmittableResult,
  ApiPromise,
  TokenId,
  AnyInputAddress,
  PropertiesArray, CollectionId
} from '../../../types'
import {utils} from '../../../utils'
import {findEventDataBySectionAndMethod} from '../../extrinsicTools'
import {AbstractExtrinsic, ExtrinsicOptions, ExtrinsicResult, ExtrinsicSendOptions} from '../AbstractExtrinsic'
import {ExtrinsicError} from '../../../utils/errors'
import {TokenToMint, validateAndFixTokenOwner} from "./utils";



export interface ExtrinsicCreateNftTokenParams {
  collectionId: number
  token: TokenToMint
}

export interface ExtrinsicCreateNftTokenResult extends ExtrinsicResult {
  collectionId: CollectionId | null
  tokenId: TokenId | null
  owner: any
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


    const collectionId = (!!data && parseInt(data[0].toString(), 10) as CollectionId) || null
    const tokenId = (!!data && parseInt(data[1].toString(), 10) as TokenId) || null
    const owner = (!!data && data[2].toJSON()) || null

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
