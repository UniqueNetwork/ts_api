import {ExtrinsicCreateCollectionParams} from "./unique/ExtrinsicCreateCollection";
import {ExtrinsicTransferCoinsParams} from "./common/ExtrinsicTransferCoins";
import {ExtrinsicAddCollectionAdminParams} from "./unique/ExtrinsicAddCollectionAdmin";
import {ExtrinsicRemoveCollectionAdminParams} from "./unique/ExtrinsicRemoveCollectionAdmin";
import {ExtrinsicSetCollectionSponsorParams} from "./unique/ExtrinsicSetCollectionSponsor";
import {ExtrinsicConfirmSponsorshipParams} from "./unique/ExtrinsicConfirmSponsorship";


export namespace SubstrateMethodsParams {
  export type TransferCoins = ExtrinsicTransferCoinsParams
  export type CreateCollection = ExtrinsicCreateCollectionParams
  export type AddCollectionAdmin = ExtrinsicAddCollectionAdminParams
  export type RemoveCollectionAdmin = ExtrinsicRemoveCollectionAdminParams
  export type SetCollectionSponsor = ExtrinsicSetCollectionSponsorParams
  export type ConfirmCollectionSponsor = ExtrinsicConfirmSponsorshipParams
}
