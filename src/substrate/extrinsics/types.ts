import {ExtrinsicCreateCollectionParams} from "./unique/ExtrinsicCreateCollection";
import {ExtrinsicTransferCoinsParams} from "./common/ExtrinsicTransferCoins";
import {ExtrinsicAddCollectionAdminParams} from "./unique/ExtrinsicAddCollectionAdmin";
import {ExtrinsicRemoveCollectionAdminParams} from "./unique/ExtrinsicRemoveCollectionAdmin";
import {ExtrinsicSetCollectionSponsorParams} from "./unique/ExtrinsicSetCollectionSponsor";
import {ExtrinsicConfirmSponsorshipParams} from "./unique/ExtrinsicConfirmSponsorship";
import {ExtrinsicAddToAllowListParams} from "./unique/ExtrinsicAddToAllowList";
import {ExtrinsicChangeCollectionOwnerParams} from "./unique/ExtrinsicChangeCollectionOwner";
import {ExtrinsicRemoveCollectionSponsorParams} from "./unique/ExtrinsicRemoveCollectionSponsor";
import {ExtrinsicRemoveFromAllowListParams} from "./unique/ExtrinsicRemoveFromAllowList";
import {ExtrinsicCreateNftToken} from "./unique/ExtrinsicCreateNftToken";
import {ExtrinsicCreateMultipleNftTokensParams} from "./unique/ExtrinsicCreateMultipleNftTokens";


export namespace SubstrateMethodsParams {
  export type TransferCoins = ExtrinsicTransferCoinsParams
  export type CreateCollection = ExtrinsicCreateCollectionParams
  export type AddCollectionAdmin = ExtrinsicAddCollectionAdminParams
  export type RemoveCollectionAdmin = ExtrinsicRemoveCollectionAdminParams
  export type SetCollectionSponsor = ExtrinsicSetCollectionSponsorParams
  export type ConfirmCollectionSponsor = ExtrinsicConfirmSponsorshipParams
  export type AddToAllowList = ExtrinsicAddToAllowListParams
  export type ChangeCollectionOwner = ExtrinsicChangeCollectionOwnerParams
  export type RemoveCollectionSponsor = ExtrinsicRemoveCollectionSponsorParams
  export type RemoveFromAllowList = ExtrinsicRemoveFromAllowListParams
  export type CreateNftToken = ExtrinsicCreateNftToken
  export type CreateMultipleNftTokens = ExtrinsicCreateMultipleNftTokensParams
}
