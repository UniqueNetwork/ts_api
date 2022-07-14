import {CollectionId, SubstrateAddress} from "../../../types";

export interface TokenPropertyPermission {
  mutable: boolean
  collectionAdmin: boolean
  tokenOwner: boolean
}

export interface TokenPropertyPermissionObject {
  key: string
  permission: TokenPropertyPermission
}

export interface CollectionParams {
  name: string
  description: string
  tokenPrefix: string

  mode?: {nft: null}
  access?: 'Normal' | 'AllowList'
  limits?: {
    accountTokenOwnershipLimit?: number | null
    ownerCanDestroy?: boolean | null
    ownerCanTransfer?: boolean | null
    sponsorApproveTimeout?: number | null
    sponsorTransferTimeout?: number | null
    sponsoredDataRateLimit?: number | null
    sponsoredDataSize?: number | null
    tokenLimit?: number | null
    transfersEnabled?: boolean | null
  }
  permissions?: {
    access?: 'Normal' | 'AllowList'
    mintMode?: boolean
    nesting?: {tokenOwner: boolean, collectionAdmin: boolean, restricted: Array<number>}
  }
  tokenPropertyPermissions?: Array<TokenPropertyPermissionObject>
  properties?: Array<{
    key: string
    value: string
  }>
}

export interface Collection extends CollectionParams {
  id: CollectionId
}

export interface RawCollection extends Omit<Collection, 'name' | 'description' | 'properties'> {
  name: number[]
  description: number[]
  properties: CollectionProperties
}

export type CollectionLimits = Required<CollectionParams>['limits']
export type CollectionPermissions = Required<Required<CollectionParams>['permissions']>
export type CollectionTokenPropertyPermissions = Required<CollectionParams>['tokenPropertyPermissions']
export type CollectionProperties = Required<CollectionParams>['properties']

export type CollectionSponsorship = 'Disabled' | {Confirmed: SubstrateAddress} | {Unconfirmed: SubstrateAddress}

// export interface CollectionParamsWithVectorizedStrings extends Omit<CollectionParams, 'name' | 'tokenPrefix' | 'description'> {
//   name: number[]
//   tokenPrefix: number[]
//   description: number[]
// }
