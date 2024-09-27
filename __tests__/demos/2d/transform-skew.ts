import { Rect } from '@antv/g';

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/transform-function/skewX
 */
export async function transformSkew(context) {
  const { canvas } = context;
  await canvas.ready;

  const rect1 = new Rect({
    style: {
      x: 100,
      y: 100,
      width: 100,
      height: 100,
      fill: 'red',
    },
  });
  canvas.appendChild(rect1);
  const rect2 = new Rect({
    style: {
      x: 100,
      y: 200,
      width: 100,
      height: 100,
      fill: 'blue',
      transform: 'skewX(10deg)',
    },
  });
  canvas.appendChild(rect2);
  const rect3 = new Rect({
    style: {
      x: 100,
      y: 300,
      width: 100,
      height: 100,
      fill: 'red',
      transform: 'rotate3d(1, 1, 1, 45deg)',
    },
  });
  canvas.appendChild(rect3);
}
