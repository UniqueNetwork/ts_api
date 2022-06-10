import {ExtrinsicCreateCollectionParams} from "./unique/ExtrinsicCreateCollection";
import {ExtrinsicTransferCoinsParams} from "./common/ExtrinsicTransferCoins";
import { ExtrinsicSetCollectionSponsorParams } from "./unique/ExtrinsicSetCollectionSponsor";
import { ExtrinsicConfirmSponsorshipParams } from "./unique/ExtrinsicConfirmSponsorship";

export namespace SubstrateMethodsParams {
  export type TransferCoins = ExtrinsicTransferCoinsParams
  export type CreateCollection = ExtrinsicCreateCollectionParams
  export type SetCollectionSponsor = ExtrinsicSetCollectionSponsorParams
  export type ConfirmCollectionSponsor = ExtrinsicConfirmSponsorshipParams
}
