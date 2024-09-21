import { HTML, Line, Rect, Text, CustomElement } from '@antv/g';

export async function html(context) {
  const { canvas } = context;
  await canvas.ready;

  // create a line
  const line = new Line({
    style: {
      x1: 200,
      y1: 100,
      x2: 400,
      y2: 100,
      stroke: '#1890FF',
      lineWidth: 2,
    },
  });
  const p1 = new HTML({
    id: 'p1',
    name: 'p1-name',
    className: 'p1-classname',
    style: {
      x: 200,
      y: 100,
      width: 60,
      height: 30,
      innerHTML: 'p1',
    },
  });
  const p2 = new HTML({
    id: 'p2',
    name: 'p2-name',
    className: 'p2-classname',
    style: {
      x: 400,
      y: 100,
      width: 60,
      height: 30,
      innerHTML: 'p2',
    },
  });

  const rect = new Rect({
    name: 'test-name',
    style: {
      x: 200,
      y: 200,
      width: 300,
      height: 100,
      fill: '#1890FF',
    },
  });
  const text = new Text({
    style: {
      x: 350,
      y: 250,
      text: 'Hover me!',
      fontSize: 22,
      fill: '#000',
      textAlign: 'center',
      textBaseline: 'middle',
    },
  });
  rect.appendChild(text);
  const tooltip = new HTML({
    style: {
      x: 0,
      y: 0,
      innerHTML: 'Tooltip',
      fill: 'white',
      stroke: 'black',
      lineWidth: 6,
      width: 100,
      height: 30,
      pointerEvents: 'none',
      visibility: 'hidden',
    },
  });

  canvas.appendChild(line);
  canvas.appendChild(p1);
  canvas.appendChild(p2);
  canvas.appendChild(rect);
  canvas.appendChild(tooltip);

  rect.addEventListener('mousemove', (e) => {
    tooltip.setPosition(e.x, e.y);
    tooltip.style.visibility = 'visible';

    console.log('move', e.target);
  });
  rect.addEventListener('mouseleave', (e) => {
    tooltip.setPosition(0, 0);
    tooltip.style.visibility = 'hidden';

    console.log('leave', e.target);
  });

  class Custom extends CustomElement<{}> {
    constructor(config) {
      super({
        ...config,
        type: 'custom',
      });

      const tooltip = new HTML({
        style: {
          x: 0,
          y: 0,
          innerHTML: 'Tooltip',
          fill: 'white',
          stroke: 'black',
          lineWidth: 6,
          width: 100,
          height: 30,
        },
      });
      this.appendChild(tooltip);
      this.appendChild(
        new Rect({
          style: { width: 100, height: 100, x: 0, y: 40, fill: 'red' },
        }),
      );
    }

    connectedCallback() {}
  }
  const customEl = new Custom({
    style: {
      transform: 'translate(200, 330)',
    },
  });
  canvas.appendChild(customEl);
}
