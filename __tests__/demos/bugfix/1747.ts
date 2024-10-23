import { Canvas, Text, Path, Rect } from '@antv/g';

export async function test_pick(context: { canvas: Canvas }) {
  const { canvas } = context;
  await canvas.ready;

  const test = (shape, property) => {
    shape.addEventListener('pointerenter', () => {
      shape.style[property] = 'red';
    });
    shape.addEventListener('pointerleave', () => {
      shape.style[property] = 'black';
    });
  };

  const text = new Text({
    style: {
      text: 'test123213',
      fontSize: 20,
      x: 300,
      y: 300,
      cursor: 'pointer',
      transform: 'rotate(45)',
      transformOrigin: 'center',
    },
  });
  console.log(text.getBounds());

  const path = new Path({
    style: {
      d: 'M 100,100 L 150,100 L 150,150 Z',
      fill: 'black',
      // transform: 'rotate(45)',
      cursor: 'pointer',
    },
  });

  test(text, 'fill');
  test(path, 'fill');

  canvas.appendChild(text);
  canvas.appendChild(path);

  const { x, y, width, height } = text.getBBox();
  const rect = new Rect({
    style: {
      x,
      y,
      width,
      height,
      stroke: 'black',
      // transform: 'rotate(45)',
      cursor: 'pointer',
    },
  });
  test(rect, 'stroke');

  canvas.appendChild(rect);
}
