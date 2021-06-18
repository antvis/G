import { string } from 'rollup-plugin-string';

export default {
  disableTypeCheck: true,
  extraRollupPlugins: [string({ include: '**/*.glsl' })],
};
