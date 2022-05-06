import ts from 'rollup-plugin-typescript2'
import {terser} from 'rollup-plugin-terser'
import dts from 'rollup-plugin-dts'
import {RollupOptions} from 'rollup'

const config: RollupOptions[] = [
  {
    input: './src/index.ts',
    output: [
      {file: "lib/bundle.cjs", format: "cjs", sourcemap: true},
      {file: "lib/bundle.esm.mjs", format: "es", sourcemap: true},
      {file: "lib/bundle.esm.min.js", format: "es", plugins: [terser()], sourcemap: true},
      {
        file: "lib/bundle.min.js",
        name: "unique",
        format: "iife",
        plugins: [terser()],
        globals: {
          'util-crypto': 'utilCrypto',
          'web3': 'Web3',
        },
        sourcemap: true
      },
    ],
    plugins: [
      ts({
        useTsconfigDeclarationDir: true
      })
    ],
  },
  {
    input: "./lib/dts/src/index.d.ts",
    output: [{ file: "lib/bundle.d.ts", format: "es" }],
    plugins: [dts({
      compilerOptions: {
        declarationMap: true
      }
    })],
  },
]

export default config