# @unique-nft/api

Definitely typed JS API for the Unique Network 

Install

```shell
yarn add @unique-nft/api
```

```shell
npm install @unique-nft/api
```

Since this project requires the BigInt support, there may be needed some additional bundler settings. 

For example, you may need to add the following to your `tsconfig.json` file: 
```typescript
"compilerOptions" {
...
"target": "es2020",
...
}
```
For Vite, you can do the same. Example of `vite.config.ts`:

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

One more thing before you start, please make sure that you delete the **^** symbol in the `package.json` file. This is needed to avoid compatibility conflicts. The version of the library must be without this symbol: 

```
"dependencies": {
    "@unique-nft/api": "0.0.7",
```

---
#### Quick Start

Feel free to execute the code below to check some library features. 

```typescript
import {init, Substrate, utils} from '@unique-nft/api'

const run = async () => {
  await init({})

  console.log(utils.address.normalizeSubstrateAddress('yGHGXr2qCKygrxFw16XXEYRLmQwQt8RN8eMN5UuuJ17ZFPosP'))

  const chain = new Substrate.Unique()
  await chain.connect(`wss://quartz.unique.network`)

  console.log(chain.ss58Prefix)
  console.log(chain.coin.format(1_500_000_000_000_000_000n))

  console.log(await chain.getChainProperties())

  await chain.disconnect()
}
run().catch(err => console.error(err))
```

---

#### Initializing

Initializing with Polkadot extension enabling (works only in browser)

```typescript
import {init} from '@unique-nft/api'

await init({connectToPolkadotExtensionsAs: 'my app'})
```

or, another way to do the same:

```typescript
import {init, Substrate} from '@unique-nft/api'

await init()
await Substrate.extension.connectAs('my app')
```

---

#### Signer

Transaction may be signed with keyring as well as with an account from the Polkadot extension.

With keyring (available in both browser and Node.js):

```typescript
import {Substrate, init, WS_RPC} from '@unique-nft/api'

await init()

const chain = new Substrate.Unique()
await chain.connect(WS_RPC.quartz)

const keyring = Substrate.signer.keyringFromSeed('electric suit...')

const result = await chain.transferCoins({toAddress: "5C...", amountInWei: 1_500_000_000_000_000_000n}).signAndSend(keyring)
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

_Note_: in case of `Substrate.Unique.transferCoins`
(but not for `Substrate.Common`),  
we can pass both substrate address (starting from 5 in normal form)
and an Ethereum address (starting from 0x...).

Unique's `transferCoins` (and other functions where it makes sense) can accept any address - substrate or ethereum.

---

#### Extrinsics

`Substrate` class provides methods which take transaction parameters and return a `Transaction` object.

Example:

```typescript
const result = await quartz
  .transferCoins({toAddress: '5...', amountInWei: 1n})
  .signAndSend(keyringOrAccount)
```

More verbose example:

```typescript
const quartz = new Substrate.Unique()
const tx = quartz.transferCoins({toAddress: '5...', amountInWei: 1n})
await tx.sign(keyringOrAccount)
console.log(tx.getRawTx().toJSON())
const result = await tx.send()
```

All params have typings which can be imported this way:

```typescript
import {SubstrateMethodsParams} from '@unique-nft/api'

const params: SubstrateMethodsParams.TransferCoins = {
  toAddress: '5...',
  amountInWei: 1n
}
```

`Transaction` instance fields and methods:

- `async sign(signer: KeyringPair | InjectedAccountWithMeta)` - returns it's instance
- `async send()` - returns transaction result
- `async signAndSend(signer: KeyringPair | InjectedAccountWithMeta)` - returns transaction result
- `isSigned` - boolean
- `getRawTx()` - returns `SubmittableExtrinsic` object

