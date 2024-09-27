import { Circle } from '@antv/g';
import { Renderer as CanvasRenderer } from '@antv/g-canvas';
import { Renderer as SVGRenderer } from '@antv/g-svg';
import { Renderer as WebGLRenderer } from '@antv/g-webgl';

export async function switchRenderer(context) {
  const { canvas, gui } = context;

  await canvas.ready;

  const circle = new Circle({
    style: {
      cx: 100,
      cy: 100,
      r: 50,
      fill: 'red',
    },
  });

  canvas.appendChild(circle);

  const folder = gui.addFolder('renderer');
  folder
    .add({ renderer: 'canvas' }, 'renderer', ['canvas', 'svg', 'webgl'])
    .onChange((name) => {
      let renderer;
      if (name === 'canvas') renderer = new CanvasRenderer();
      else if (name === 'svg') renderer = new SVGRenderer();
      else if (name === 'webgl') renderer = new WebGLRenderer();

      canvas.setRenderer(renderer);

      canvas.ready.then(() => {
        alert(`Switch to ${name} renderer`);
      });
    });
}
