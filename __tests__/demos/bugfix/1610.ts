import { Canvas, Circle, HTML } from '@antv/g';
import { Renderer as CanvasRenderer } from '@antv/g-canvas';

export async function html(context) {
  const { canvas, container } = context;
  await canvas.ready;
  canvas.resize(320, 320);

  const $div2 = document.createElement('div');
  $div2.id = 'div2';
  container.appendChild($div2);
  const canvasRenderer2 = new CanvasRenderer();
  const canvas2 = new Canvas({
    container: $div2,
    width: 320,
    height: 320,
    renderer: canvasRenderer2,
  });

  const circle1 = new Circle({
    style: {
      cx: 100,
      cy: 100,
      r: 50,
      fill: 'red',
      cursor: 'pointer',
    },
  });
  canvas.appendChild(circle1);
  const circle2 = new Circle({
    style: {
      cx: 100,
      cy: 100,
      r: 50,
      fill: 'green',
      cursor: 'pointer',
    },
  });
  canvas2.appendChild(circle2);

  const html = new HTML({
    id: 'html1',
    style: {
      x: 200,
      y: 100,
      width: 100,
      height: 100,
      innerHTML: 'canvas1',
      // pointerEvents: 'none',
    },
  });
  canvas.appendChild(html);
}
