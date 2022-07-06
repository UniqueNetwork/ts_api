import { defineConfig } from 'tsup'

export default defineConfig({
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
  clean: true
})
