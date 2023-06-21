import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import { builtinModules } from 'module';

export function createConfig({
  pkg,
  external = [],
  umdName = '',
  globals = {},
  plugins = [],
}) {
  const sharedPlugins = [
    ...plugins,
    nodeResolve({
      mainFields: ['module', 'browser', 'main'],
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.es6', '.es', '.mjs'],
    }),
    commonjs(),
    typescript({ sourceMap: true }),
  ];

  return [
    {
      input: 'src/index.ts',
      external: Object.keys(pkg.dependencies || {})
        .concat(Object.keys(pkg.peerDependencies || {}))
        .concat(builtinModules),
      // onwarn: (warning) => {
      //   throw Object.assign(new Error(), warning);
      // },
      strictDeprecations: true,
      output: [
        {
          format: 'cjs',
          file: pkg.main,
          exports: 'named',
          // footer: 'module.exports = Object.assign(exports.default, exports);',
          sourcemap: true,
        },
        {
          format: 'es',
          file: pkg.module,
          sourcemap: true,
        },
      ],
      plugins: sharedPlugins,
    },
    {
      input: 'src/index.ts',
      output: {
        format: 'umd',
        file: pkg.unpkg,
        name: umdName,
        globals,
        sourcemap: true,
      },
      external,
      plugins: [
        ...sharedPlugins,
        terser({
          compress: {
            pure_getters: true,
            unsafe: true,
            unsafe_comps: true,
            warnings: false,
          },
        }),
      ],
    },
  ];
}
