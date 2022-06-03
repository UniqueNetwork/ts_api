Works in browser and Node.js as well.

Install

```shell
yarn add unique_tslib
```

```shell
npm install unique_tslib
```

---
Brief overview

```typescript
import {init, Substrate, utils} from 'unique_tslib'

const run = async () => {
  await init({})

  console.log(utils.address.normalizeAddress('yGHGXr2qCKygrxFw16XXEYRLmQwQt8RN8eMN5UuuJ17ZFPosP'))

  const chain = new Substrate()
  await chain.connect(`wss://quartz.unique.network`)

  console.log(chain.ss58Prefix)
  console.log(chain.coin.format(1_500_000_000_000_000_000n))

  console.log(await substrate.getChainProperties())

  await chain.disconnect()
}
run().catch(err => console.error(er))
```

---

#### Initializing

Initializing with polkadot extension enabling (works only in browser)

```typescript
import {init} from 'unique_tslib'

await init({initPolkadotExtensionWithName: 'my app'})
```

or, gives the same result:

```typescript
import {init, polkadotExtensionTools} from 'unique_tslib'

await init()
await polkadotExtensionTools.enablePolkadotExtension('my app')
```

---

#### Signer

Transaction may be signed with keyring as well as with an account from the polkadot extension.

With keyring (available in both browser and Node.js):

```typescript
import {Substrate, substrateTools} from 'unique_tslib'

const chain = new Substrate().connect('wss://...')

const keyring = substrateTools.signerTools.fromSeed('electric suit...')

const result = await chain.transferCoins({...}).signAndSend(keyring)
```

With the polkadot extension (available in browser only):

```typescript
import {Substrate, polkadotExtensionTools} from 'unique_tslib'

const chain = new Substrate().connect('wss://...')

const accounts = await polkadotExtensionTools.getAllAccounts()
const account = accounts.find(account => account.address === '5...')

const result = await chain.transferCoins({...}).signAndSend(account)
```

---

#### Extrinsics

Substrate class provides methods which take transaction parameters and return Transaction object.

Example:

```typescript
const result = await chain
  .transferCoins({toAddress: '5...', amountInWei: 1n})
  .signAndSend(keyringOrAccount)
```

More verbose example:

```typescript
const tx = chain.transferCoins({toAddress: '5...', amountInWei: 1n})
await tx.sign(keyringOrAccount)
console.log(tx.getRawTx().toJSON())
const result = await tx.send()
```

All params have own typings which can be imported like that:

```typescript
import {SubstrateMethodsParams} from 'unique_tslib'

const params: SubstrateMethodsParams.TransferCoins = {
  toAddress: '5...',
  amountInWei: 1n
}
```

Transaction instance fields and methods:

- `async sign(signer: KeyringPair | InjectedAccountWithMeta)` - returns it's instance
- `async send()` - returns transaction result
- `async signAndSend(signer: KeyringPair | InjectedAccountWithMeta)` - returns transaction result
- `isSigned` - boolean
- `getRawTx()` - returns `SubmittableExtrinsic` object
