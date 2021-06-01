import { string } from 'rollup-plugin-string';

export default {
  cjs: 'rollup',
  esm: 'rollup',
  disableTypeCheck: true,
  extraRollupPlugins: [string({ include: '**/*.glsl' })],
};
