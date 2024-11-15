import { AbstractRenderer, RendererPlugin } from '../../packages/g/src';

describe('Abstract renderer', () => {
  it('should generate correct composed path', () => {
    const renderer = new AbstractRenderer();

    expect(renderer.getConfig()).toStrictEqual({
      enableAutoRendering: true,
      enableDirtyCheck: true,
      enableCulling: false,
      enableDirtyRectangleRendering: true,
      enableDirtyRectangleRenderingDebug: false,
      enableRenderingOptimization: false,
      enableSizeAttenuation: true,
    });

    renderer.setConfig({ enableAutoRendering: false });
    expect(renderer.getConfig()).toStrictEqual({
      enableAutoRendering: false,
      enableDirtyCheck: true,
      enableCulling: false,
      enableDirtyRectangleRendering: true,
      enableDirtyRectangleRenderingDebug: false,
      enableSizeAttenuation: true,
    });

    expect(renderer.getPlugins().length).toBe(0);

    const plugin = {
      name: 'test',
      init: () => {},
      destroy: () => {},
    } as unknown as RendererPlugin;

    renderer.registerPlugin(plugin);
    expect(renderer.getPlugins().length).toBe(1);

    expect(renderer.getPlugin('test')).toBe(plugin);

    renderer.unregisterPlugin(plugin);
    expect(renderer.getPlugins().length).toBe(0);

    renderer.unregisterPlugin({ name: 'xx' } as RendererPlugin);
    expect(renderer.getPlugins().length).toBe(0);
  });
});
