import ts from 'rollup-plugin-typescript2'
import {terser} from 'rollup-plugin-terser'
import dts from 'rollup-plugin-dts'
import {RollupOptions} from 'rollup'
import del from 'rollup-plugin-delete'

// "source": "./src/index.ts",

const config: RollupOptions[] = [
  {
    input: './src/index.ts',
    output: [
      {file: "lib/bundle.cjs", format: "cjs", sourcemap: true},
      {file: "lib/bundle.js", format: "es", sourcemap: true},
      {
        file: "lib/bundle.umd.min.js",
        name: "unique",
        format: "umd",
        plugins: [
          // terser()
        ],
        globals: {
          '@polkadot/util': 'polkadotUtil',
          '@polkadot/util-crypto': 'polkadotUtilCrypto',
          '@polkadot/extension-dapp': 'polkadotExtensionDapp',
          '@polkadot/api': 'polkadotApi',
          'web3': 'Web3',
        },
        sourcemap: true,
      },
    ],
    plugins: [
      del({targets: 'lib/*'}),
      ts({
        useTsconfigDeclarationDir: true
      })
    ],
    // external: ['@polkadot/util-crypto', '@polkadot/api']

  },
  {
    input: "./lib/dts/src/index.d.ts",
    output: [{file: "lib/bundle.d.ts", format: "es"}],
    plugins: [
      dts(),
      del({hook: "buildEnd", targets: ["./lib/dts", "./lib/bundle.d.ts.map"]}),
    ],
  },
]

export default config
