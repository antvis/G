import { Renderer as SVGRenderer } from '../../../packages/g-svg/src';
import { Canvas, CanvasEvent } from '../../../packages/g/src';

describe('Canvas.destroy event references', () => {
  it('clears the propagation path on reused lifecycle events', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const canvas = new Canvas({
      container,
      width: 100,
      height: 100,
      renderer: new SVGRenderer(),
    });
    let retainedEvent: any;

    await canvas.ready;
    canvas.addEventListener(CanvasEvent.BEFORE_RENDER, (event) => {
      retainedEvent = event as CustomEvent;
    });
    canvas.render();

    expect(retainedEvent?.path).toContain(canvas);

    canvas.destroy();

    expect(retainedEvent?.path).toEqual([]);
    container.remove();
  });
});
