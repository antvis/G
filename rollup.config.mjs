import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';
import terser from '@rollup/plugin-terser';
import replace from '@rollup/plugin-replace';
// import strip from '@rollup/plugin-strip';
import filesize from 'rollup-plugin-filesize';
// import { visualizer } from 'rollup-plugin-visualizer';
import { builtinModules } from 'module';
import process from 'node:process';
// import path from 'node:path';
// import { URL, fileURLToPath } from 'node:url';
// import fse from 'fs-extra';
import babelConfig from './babel.config.mjs';

// const WORKING_DIRECTORY = fileURLToPath(new URL('.', import.meta.url));
const __DEV__ = String(process.env.NODE_ENV).trim() === 'development';
const EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.es6', '.es', '.mjs'];
const buildBanner = (pkg) => {
  // see docs: https://github.com/terser/terser#keeping-copyright-notices-or-other-comments
  return `/*!
 * ${pkg.name}
 * @description ${pkg.description}
 * @version ${pkg.version}
 * @date ${new Date().toLocaleString()}
 * @author AntVis
 * @docs https://g.antv.antgroup.com/
 */`;
};

/**
 * @return {import('rollup').RollupOptions}
 */
export function createConfig({
  pkg,
  external = [],
  umdName = '',
  globals = {},
  plugins = [],
}) {
  const enableSourceMap = true;
  const banner = buildBanner(pkg);
  const sharedConfig = {
    watch: {
      include: 'src/**',
    },
    onwarn: (warning, warn) => {
      if (warning.code === 'CIRCULAR_DEPENDENCY') {
        return;
      }
      warn(warning);
    },
    strictDeprecations: true,
    input: 'src/index.ts',
    plugins: [
      nodeResolve({
        mainFields: ['module', 'browser', 'main'],
        extensions: EXTENSIONS,
      }),
      babel({
        ...babelConfig,
        babelrc: false,
        exclude: [/\/node_modules\//],
        extensions: EXTENSIONS,
        babelHelpers: 'runtime',
      }),
      commonjs({ sourceMap: true }),
      replace({
        preventAssignment: true,
        values: {
          'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
          __DEV__,
        },
        sourceMap: enableSourceMap,
      }),
      ...plugins,
      // strip({
      //   include: ['src/**/*.(ts|tsx|js|jsx|mjs)'],
      //   sourceMap: enableSourceMap,
      // }),
      filesize(),
    ],
  };

  return [
    {
      ...sharedConfig,
      output: [
        {
          format: 'cjs',
          file: pkg.main,
          exports: 'named',
          banner,
          sourcemap: enableSourceMap,
        },
        {
          format: 'es',
          file: pkg.module,
          banner,
          sourcemap: enableSourceMap,
        },
      ],
      external: [
        /@babel\/runtime/,
        ...Object.keys(pkg.dependencies || {}),
        ...Object.keys(pkg.peerDependencies || {}),
        ...builtinModules,
        ...external,
      ],
    },
    {
      ...sharedConfig,
      output: {
        format: 'umd',
        file: pkg.unpkg,
        name: umdName,
        globals,
        banner,
        sourcemap: enableSourceMap,
        plugins: [
          // visualizer({
          //   sourcemap: sourceMap,
          //   open: true,
          //   gzipSize: true,
          //   brotliSize: false,
          // }),
        ],
      },
      external,
      plugins: [
        ...sharedConfig.plugins,
        terser({
          compress: {
            pure_getters: true,
            unsafe: true,
            unsafe_comps: true,
            warnings: false,
          },
          sourceMap: enableSourceMap,
        }),
      ],
    },
  ];
}
