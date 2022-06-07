# @unique-nft/api

Definitely typed JS API for the Unique Network 

Install

```shell
yarn add @unique-nft/api
```

```shell
npm install @unique-nft/api
```

Since this project requires BigInt support there may be needed some additional bundler settings.

For Vite there may be useful to set esbuild target to es2020 at least, example of `vite.config.ts`:

```typescript
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  // ...
  build: {
    target: 'es2020'
  }
})

```

---
Brief overview

```typescript
import {init, Substrate, utils} from '@unique-nft/api'

const run = async () => {
  await init({})

  console.log(utils.address.normalizeAddress('yGHGXr2qCKygrxFw16XXEYRLmQwQt8RN8eMN5UuuJ17ZFPosP'))

  const chain = new Substrate.Unique()
  await chain.connect(`wss://quartz.unique.network`)

  console.log(chain.ss58Prefix)
  console.log(chain.coin.format(1_500_000_000_000_000_000n))

  console.log(await chain.getChainProperties())

  await chain.disconnect()
}
run().catch(err => console.error(er))
```

---

#### Initializing

Initializing with polkadot extension enabling (works only in browser)

```typescript
import {init} from '@unique-nft/api'

await init({initPolkadotExtensionWithName: 'my app'})
```

or, gives the same result:

```typescript
import {init, polkadotExtensionTools} from '@unique-nft/api'

await init()
await polkadotExtensionTools.enablePolkadotExtension('my app')
```

---

#### Signer

Transaction may be signed with keyring as well as with an account from the polkadot extension.

With keyring (available in both browser and Node.js):

```typescript
import {Substrate, substrateTools, WS_RPC} from '@unique-nft/api'

const chain = new Substrate.Unique().connect(WS_RPC.quartz)

const keyring = substrateTools.signerTools.fromSeed('electric suit...')

const result = await chain.transferCoins({...}).signAndSend(keyring)
```

With the polkadot extension (available in browser only):

```typescript
import {Substrate, polkadotExtensionTools, WS_RPC} from '@unique-nft/api'

const quartz = new Substrate.Unique().connect(WS_RPC.quartz)
const kusama = new Substrate.Common().connect(WS_RPC.kusama)

const accounts = await polkadotExtensionTools.getAllAccounts()
const account = accounts.find(account => account.address === '5...')

const QTZTransfer = await quartz.transferCoins({...}).signAndSend(account)
const KSMTransfer = await kusama.transferCoins({...}).signAndSend(account)
```

---

#### Extrinsics

Substrate class provide methods which take transaction parameters and return Transaction object.

Example:

```typescript
const result = await quartz
  .transferCoins({toAddress: '5...', amountInWei: 1n})
  .signAndSend(keyringOrAccount)
```

More verbose example:

```typescript
const tx = quartz.transferCoins({toAddress: '5...', amountInWei: 1n})
await tx.sign(keyringOrAccount)
console.log(tx.getRawTx().toJSON())
const result = await tx.send()
```

All params have own typings which can be imported like that:

```typescript
import {SubstrateMethodsParams} from '@unique-nft/api'

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
