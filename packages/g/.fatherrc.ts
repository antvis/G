import { visualizer } from 'rollup-plugin-visualizer';

const isBundleVis = !!process.env.BUNDLE_VIS;

export default {
  umd: {
    name: 'G',
  },
  extraRollupPlugins: [...(isBundleVis ? [visualizer()] : [])],
};
