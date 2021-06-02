import { string } from 'rollup-plugin-string';

export default {
  cjs: 'rollup',
  esm: 'rollup',
  umd: {
    minFile: true,
  },
  disableTypeCheck: true,
  extraRollupPlugins: [string({ include: '**/*.glsl' })],
};
