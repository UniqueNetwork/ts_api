import {CrossAccountId, CrossAccountIdOrString, EventRecord, ISubmittableResult} from "../types";
import {UniqueUtils} from "../utils";

interface IReturnableToken {
  collectionId: number,
  tokenId: number,
  owner: CrossAccountId
}

export const extractCollectionIdFromCreationResult = (txResult: ISubmittableResult, label: string = 'new collection') => {
  const wrappedLabel = label ? ` (${label})` : ''
  if (txResult.dispatchError) {
    throw new Error(`Unable to create collection${wrappedLabel}`);
  }

  let collectionId = null
  txResult.events.forEach((event) => {
    const {data, method, section} = event.event
    if ((section === 'common') && (method === 'CollectionCreated')) {
      collectionId = parseInt(data[0].toString(), 10);
    }
  })

  if (collectionId === null) {
    throw Error(`No CollectionCreated event found${wrappedLabel}`)
  }

  return collectionId;
}

export const extractTokensFromCreationResult = (txResult: ISubmittableResult, label = 'new tokens') => {
  if (txResult.dispatchError) {
    throw Error(`Unable to create tokens for ${label}`);
  }
  let success = false, tokens: IReturnableToken[] = [];
  txResult.events.forEach(({event: {data, method, section}}) => {
    if (method === 'ExtrinsicSuccess') {
      success = true;
    } else if ((section === 'common') && (method === 'ItemCreated')) {
      tokens.push({
        collectionId: parseInt(data[0].toString(), 10),
        tokenId: parseInt(data[1].toString(), 10),
        owner: data[2].toJSON() as CrossAccountId
      });
    }
  });
  return {success, tokens};
}

export const extractTokensFromBurnResult = (txResult: ISubmittableResult, label = 'burned tokens') => {
  if (txResult.dispatchError) {
    throw Error(`Unable to burn tokens for ${label}`);
  }
  let success = false, tokens: IReturnableToken[] = [];
  txResult.events.forEach(({event: {data, method, section}}) => {
    if (method === 'ExtrinsicSuccess') {
      success = true;
    } else if ((section === 'common') && (method === 'ItemDestroyed')) {
      tokens.push({
        collectionId: parseInt(data[0].toString(), 10),
        tokenId: parseInt(data[1].toString(), 10),
        owner: data[2].toJSON() as CrossAccountId
      });
    }
  });
  return {success, tokens};
}

export const findCollectionInEvents = (events: EventRecord[], collectionId: number, expectedSection: string, expectedMethod: string, label: string = '') => {
  let collectionIdFromEvent = null;
  events.forEach(({event: {data, method, section}}) => {
    if ((section === expectedSection) && (method === expectedMethod)) {
      collectionIdFromEvent = parseInt(data[0].toString(), 10);
    }
  });

  if (collectionIdFromEvent === null) {
    throw Error(`No ${expectedMethod} event for ${label}`);
  }
  return collectionIdFromEvent === collectionId;
}

export const isTokenTransferSuccess = (events: EventRecord[], collectionId: number, tokenId: number, fromAddressObj: CrossAccountIdOrString, toAddressObj: CrossAccountIdOrString) => {
  const fromAddress = UniqueUtils.Address.extract.normalizedAddressFromObject(fromAddressObj)
  const toAddress = UniqueUtils.Address.extract.normalizedAddressFromObject(toAddressObj)

  let transfer = {
    collectionId: null as number | null,
    tokenId: null as number | null,
    from: null as string | null,
    to: null as string | null,
    amount: 1
  }
  events.forEach(({event: {data, method, section}}) => {
    if ((section === 'common') && (method === 'Transfer')) {
      let hData = data.toHuman() as string [];
      transfer = {
        collectionId: parseInt(hData[0])!,
        tokenId: parseInt(hData[1])!,
        from: UniqueUtils.Address.extract.normalizedAddressFromObject(hData[2]),
        to: UniqueUtils.Address.extract.normalizedAddressFromObject(hData[3]),
        amount: parseInt(hData[4])
      }
    }
  })

  let isSuccess =
    collectionId === transfer.collectionId &&
    tokenId === transfer.tokenId &&
    transfer.from === fromAddress &&
    transfer.to === toAddress &&
    transfer.amount === 1

  return isSuccess;
}
