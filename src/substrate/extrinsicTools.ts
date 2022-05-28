/*
import {getPolkadotKeyring} from "../libs";
import {KeypairType} from '../types'
import {connectToSubstrate} from "./substrate";

enum TransactionStatus {
  NOT_READY = 'NOT_READY',
  FAIL = 'FAIL',
  SUCCESS = 'SUCCESS'
}

interface CreationResult<R = any> {
  status: TransactionStatus,
  result: R
}

const callSmth = async () => {
  const api = await connectToSubstrate('ws')
  const result = await api.tx.unique.createCollectionEx('s').signAndSend('s', (result) => {
    if (result.status.isInBlock) {
      console.log(result.status.asInBlock, result.status.index)
    }
  })
}

export const UniqueUtil = {
  fromSeed: (seed: string, keypairType: KeypairType = 'sr25519') => {
    const {Keyring} = getPolkadotKeyring()
    const keyring = new Keyring({type: keypairType});
    return keyring.addFromUri(seed);
  },

  extractCollectionIdFromCreationResult: (creationResult: CreationResult, label: string = 'new collection') => {
    const wrappedLabel = label ? ` (${label})` : ''
    if (creationResult.status !== TransactionStatus.SUCCESS) {
      throw new Error(`Unable to create collection${wrappedLabel}`);
    }

    let collectionId = null
    creationResult.result.events.forEach((event: any) => {
      const {data, method, section} = event.event
      if ((section === 'common') && (method === 'CollectionCreated')) {
        collectionId = parseInt(data[0].toString(), 10);
      }
    })

    if (collectionId === null) {
      throw Error(`No CollectionCreated event found${wrappedLabel}`)
    }

    return collectionId;
  },

  extractTokensFromCreationResult: (creationResult: CreationResult, label = 'new tokens') => {
    if (creationResult.status !== this.transactionStatus.SUCCESS) {
      throw Error(`Unable to create tokens for ${label}`);
    }
    let success = false, tokens = [];
    creationResult.result.events.forEach(({event: {data, method, section}}) => {
      if (method === 'ExtrinsicSuccess') {
        success = true;
      } else if ((section === 'common') && (method === 'ItemCreated')) {
        tokens.push({
          collectionId: parseInt(data[0].toString(), 10),
          tokenId: parseInt(data[1].toString(), 10),
          owner: data[2].toJSON()
        });
      }
    });
    return {success, tokens};
  }

  static extractTokensFromBurnResult(burnResult, label = 'burned tokens') {
    if (burnResult.status !== this.transactionStatus.SUCCESS) {
      throw Error(`Unable to burn tokens for ${label}`);
    }
    let success = false, tokens = [];
    burnResult.result.events.forEach(({event: {data, method, section}}) => {
      if (method === 'ExtrinsicSuccess') {
        success = true;
      } else if ((section === 'common') && (method === 'ItemDestroyed')) {
        tokens.push({
          collectionId: parseInt(data[0].toString(), 10),
          tokenId: parseInt(data[1].toString(), 10),
          owner: data[2].toJSON()
        });
      }
    });
    return {success, tokens};
  }

  static findCollectionInEvents(events, collectionId, expectedSection, expectedMethod, label) {
    let eventId = null;
    events.forEach(({event: {data, method, section}}) => {
      if ((section === expectedSection) && (method === expectedMethod)) {
        eventId = parseInt(data[0].toString(), 10);
      }
    });

    if (eventId === null) {
      throw Error(`No ${expectedMethod} event for ${label}`);
    }
    return eventId === collectionId;
  }

  static isTokenTransferSuccess(events, collectionId, tokenId, fromAddressObj, toAddressObj) {
    const normalizeAddress = address => {
      if (address.Substrate) return {Substrate: this.normalizeSubstrateAddress(address.Substrate)};
      if (address.Ethereum) return {Ethereum: address.Ethereum.toLocaleLowerCase()};
      return address;
    }
    let transfer = {collectionId: null, tokenId: null, from: null, to: null, amount: 1};
    events.forEach(({event: {data, method, section}}) => {
      if ((section === 'common') && (method === 'Transfer')) {
        let hData = data.toHuman();
        transfer = {
          collectionId: parseInt(hData[0]),
          tokenId: parseInt(hData[1]),
          from: normalizeAddress(hData[2]),
          to: normalizeAddress(hData[3]),
          amount: parseInt(hData[4])
        };
      }
    });
    let isSuccess = parseInt(collectionId) === transfer.collectionId && parseInt(tokenId) === transfer.tokenId;
    isSuccess = isSuccess && JSON.stringify(normalizeAddress(fromAddressObj)) === JSON.stringify(transfer.from);
    isSuccess = isSuccess && JSON.stringify(normalizeAddress(toAddressObj)) === JSON.stringify(transfer.to);
    isSuccess = isSuccess && 1 === transfer.amount;
    return isSuccess;
  }
}
*/
