import chai, { expect } from 'chai';
// @ts-ignore
import chaiAlmost from 'chai-almost';
// @ts-ignore
import sinon from 'sinon';
// @ts-ignore
import sinonChai from 'sinon-chai';
import { AbstractRenderer } from '@antv/g';

describe('Abstract renderer', () => {
  it('should generate correct composed path', () => {
    const renderer = new AbstractRenderer();

    expect(renderer.getConfig()).to.be.eqls({
      enableAutoRendering: true,
      enableDirtyRectangleRendering: true,
      enableDirtyRectangleRenderingDebug: false,
      enableTAA: false,
    });

    renderer.setConfig({ enableAutoRendering: false });
    expect(renderer.getConfig()).to.be.eqls({
      enableAutoRendering: false,
      enableDirtyRectangleRendering: true,
      enableDirtyRectangleRenderingDebug: false,
      enableTAA: false,
    });

    expect(renderer.getPlugins().length).to.be.eqls(0);

    renderer.registerPlugin({
      init: () => {},
      destroy: () => {},
    });

    expect(renderer.getPlugins().length).to.be.eqls(1);
  });
});
