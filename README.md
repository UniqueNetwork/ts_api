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

await init({connectToPolkadotExtensionsAs: 'my app'})
```

or, gives the same result:

```typescript
import {init, Substrate} from '@unique-nft/api'

await init()
await Substrate.extension.connectAs('my app')
```

---

#### Signer

Transaction may be signed with keyring as well as with an account from the polkadot extension.

With keyring (available in both browser and Node.js):

```typescript
import {Substrate, init, WS_RPC} from '@unique-nft/api'

await init()

const chain = new Substrate.Unique()
await chain.connect(WS_RPC.quartz)

const keyring = Substrate.signer.keyringFromSeed('electric suit...')

const result = await chain.transferCoins({...}).signAndSend(keyring)
```

With the polkadot extension (available in browser only):

```typescript
import {Substrate, WS_RPC} from '@unique-nft/api'

const quartz = new Substrate.Unique()
const kusama = new Substrate.Common()

await init({connectToPolkadotExtensionsAs: 'my app'})

// we can create instances before init 
// but connect must be invoked only after init call
await quartz.connect(WS_RPC.quartz)
await kusama.connect(WS_RPC.kusama)

const accounts = await Substrate.extension.getAllAccounts()
const account = accounts[0]
// or, better option take some specific account
// accounts.find(account => account.address === '5...')

const KSMTransfer = await kusama.transferCoins({...}).signAndSend(account)

const QTZTransfer = await quartz.transferCoins({...}).signAndSend(account)
```

Note: in case of Substrate.Unique.transferCoins 
(not Substrate.Common),  
we can pass not only substrate address (5... in normal form)
and also an ethereum address (0x...)

Unique's transferCoins (and other functions where it makes sense) can take any address - substrate and ethereum.

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
