import {defineConfig} from 'tsup'


const addressConfig = {
  entry: {
    address: "src/utils/address/index.ts",
  },
  name: 'ADDRESS',
  target: 'es2020',
  sourcemap: true,
}

export default defineConfig([
  {
    entry: {
      index: "src/index.ts",
      schema: "src/schema/index.ts",
    },
    format: [
      "esm",
      "cjs"
    ],
    target: 'es2020',
    dts: true,
    sourcemap: true,
  },
  {
    ...addressConfig,
    format: ['cjs'],
    metafile: true,
    noExternal: [/^base/, /@noble\/hashes/]
  },
  {
    ...addressConfig,
    format: ['iife'],
    minify: true,
    metafile: true,
    globalName: 'UniqueAddress',
    noExternal: [/^base/, /@noble\/hashes/]
  },
  {
    ...addressConfig,
    format: ['esm'],
    dts: true,
    external: [/^base/, /\^@noble/]
  },
])
