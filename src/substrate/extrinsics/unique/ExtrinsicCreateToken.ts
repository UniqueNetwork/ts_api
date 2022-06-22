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



export interface ExtrinsicCreateTokenParams {
  collectionId: number
  owner: AnyInputAddress
  tokenProperties: PropertiesArray
}

export interface ExtrinsicCreateTokenResult extends ExtrinsicResult {
  collectionId: CollectionId | null
  tokenId: TokenId | null
  owner: any
}

export class ExtrinsicCreateToken extends AbstractExtrinsic<ExtrinsicCreateTokenParams, ExtrinsicCreateTokenResult> {
  constructor(api: ApiPromise, params: ExtrinsicCreateTokenParams, options?: ExtrinsicOptions) {
    const properties = JSON.parse(JSON.stringify(params.tokenProperties))

    let owner = utils.address.is.substrateOrEthereumAddressObj(params.owner) ? params.owner : null
    if (owner === null) {
      if (typeof params.owner !== 'string') {
        throw new Error(`create token: owner should be valid object or string, got ${typeof params.owner}: ${params.owner}`)
      }
      if (utils.address.is.ethereumAddress(params.owner)) {
        owner = {Ethereum: params.owner}
      } else if (utils.address.is.substrateAddress(params.owner)) {
        owner = {Substrate: params.owner}
      } else {
        throw new Error(`create token: owner should be valid ethereum or substrate address, got "${params.owner}"`)
      }
    }

    const tx = api.tx.unique.createItem(params.collectionId, owner, {nft: {properties}})
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
