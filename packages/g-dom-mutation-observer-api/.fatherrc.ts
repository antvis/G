import { visualizer } from 'rollup-plugin-visualizer';

const isBundleVis = !!process.env.BUNDLE_VIS;

export default {
  umd: {
    name: 'G.DOMMutationObserverAPI',
    globals: {
      '@antv/g-lite': 'window.G',
    },
  },
  extraRollupPlugins: [...(isBundleVis ? [visualizer()] : [])],
};
