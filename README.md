Works in browser and Node.js as well.

```shell
yarn add unique_tslib
```

```typescript
import {init, Substrate, utils} from 'unique_tslib'

const run = async() => {
  await init()

  console.log(utils.address.normalizeAddress('yGHGXr2qCKygrxFw16XXEYRLmQwQt8RN8eMN5UuuJ17ZFPosP'))


  const api = await Substrate.connectToSubstrate(`wss://quartz.unique.network`)
  console.log(await Substrate.getChainProperties(api))

  await api.disconnect()
}
run().catch(err => console.error(er))
```