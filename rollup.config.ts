import ts from 'rollup-plugin-typescript2'
import {terser} from 'rollup-plugin-terser'
import dts from 'rollup-plugin-dts'
import {OutputOptions, RollupOptions} from 'rollup'
import del from 'rollup-plugin-delete'
import analyze from 'rollup-plugin-analyzer'
import gzipPlugin from 'rollup-plugin-gzip'

// This suppresses warning when using custom flag (--analyze)
const onwarn: RollupOptions['onwarn'] = function onwarn(warning, warn) {
  if (
    warning.code === 'UNKNOWN_OPTION' &&
    ['analyze', 'mingzip']
      .some(flag => warning.message.startsWith(`Unknown CLI flags: ${flag}`))
  ) {
    return
  }
  warn(warning)
}

export default (cliOptions: any) => {

  const buildPlugins = [
    del({targets: 'lib/*'}),
    ts({
      useTsconfigDeclarationDir: true
    }),
  ]
  if (cliOptions.analyze) {
    buildPlugins.push(analyze({summaryOnly: true}))
  }
  if (cliOptions.mingzip) {
    buildPlugins.push(gzipPlugin({filter: /bundle\.min\.js/}))
  }

  const output: OutputOptions[] = [
    {file: "lib/bundle.cjs", format: "cjs", sourcemap: true},
    {file: "lib/bundle.js", format: "es", sourcemap: true},
  ]
  if(cliOptions.mingzip) {
    output.push({file: "lib/bundle.min.js", format: "umd", name: "unique_tslib", sourcemap: true, plugins: [terser()]})
  }

  const options: RollupOptions[] = [
    {
      input: './src/index.ts',
      output,
      //[
        // {
        //   file: "lib/bundle.umd.min.js",
        //   name: "unique",
        //   format: "umd",
        //   plugins: [
        //     // terser()
        //   ],
        //   globals: {
        //     '@polkadot/util': 'polkadotUtil',
        //     '@polkadot/util-crypto': 'polkadotUtilCrypto',
        //     '@polkadot/extension-dapp': 'polkadotExtensionDapp',
        //     '@polkadot/api': 'polkadotApi',
        //     'ethers': 'ethers',
        //   },
        //   sourcemap: true,
        // },
      // ],

      // external: ['@polkadot/util-crypto', '@polkadot/api']
      plugins: buildPlugins,
      onwarn,
    },
    {
      input: "./lib/dts/src/index.d.ts",
      output: [{file: "lib/bundle.d.ts", format: "es"}],
      plugins: [
        dts(),
        del({hook: "buildEnd", targets: ["./lib/dts", "./lib/bundle.d.ts.map"]}),
      ],
      onwarn,
    },
  ]

  return options
}
