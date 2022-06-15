import {CollectionId} from "../../../types";

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
  pendingSponsor?: string
  limits?: {
    accountTokenOwnershipLimit?: number | null
    sponsoredDataSize?: number | null
    sponsoredDataRateLimit?: number | null
    tokenLimit?: number | null
    sponsorTransferTimeout?: number | null
    sponsorApproveTimeout?: number | null
    ownerCanTransfer?: boolean | null
    ownerCanDestroy?: boolean | null
    transfersEnabled?: boolean | null
  }
  permissions?: {
    access?: 'Normal' | 'AllowList'
    mintMode?: boolean
    nesting?: 'Disabled' | 'Owner' | {OwnerRestricted: Array<number>}
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

export type CollectionLimits = Required<CollectionParams>['limits']
export type CollectionPermissions = Required<CollectionParams>['permissions']
export type CollectionTokenPropertyPermissions = Required<CollectionParams>['tokenPropertyPermissions']
export type CollectionProperties = Required<CollectionParams>['properties']

// export interface CollectionParamsWithVectorizedStrings extends Omit<CollectionParams, 'name' | 'tokenPrefix' | 'description'> {
//   name: number[]
//   tokenPrefix: number[]
//   description: number[]
// }
