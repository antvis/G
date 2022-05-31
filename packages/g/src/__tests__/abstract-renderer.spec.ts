import { AbstractRenderer } from '@antv/g';
import { expect } from 'chai';

describe('Abstract renderer', () => {
  it('should generate correct composed path', () => {
    const renderer = new AbstractRenderer();

    expect(renderer.getConfig()).to.be.eqls({
      enableAutoRendering: true,
      enableDirtyCheck: true,
      enableCulling: true,
      enableDirtyRectangleRendering: true,
      enableDirtyRectangleRenderingDebug: false,
    });

    renderer.setConfig({ enableAutoRendering: false });
    expect(renderer.getConfig()).to.be.eqls({
      enableAutoRendering: false,
      enableDirtyCheck: true,
      enableCulling: true,
      enableDirtyRectangleRendering: true,
      enableDirtyRectangleRenderingDebug: false,
    });

    expect(renderer.getPlugins().length).to.be.eqls(0);

    const plugin = {
      name: 'test',
      init: () => {},
      destroy: () => {},
    };

    renderer.registerPlugin(plugin);
    expect(renderer.getPlugins().length).to.be.eqls(1);

    expect(renderer.getPlugin('test')).to.be.eqls(plugin);

    renderer.unregisterPlugin(plugin);
    expect(renderer.getPlugins().length).to.be.eqls(0);

    // @ts-ignore
    renderer.unregisterPlugin({ name: 'xx' });
    expect(renderer.getPlugins().length).to.be.eqls(0);
  });
});
