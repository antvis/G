import { Canvas, Rect } from '@antv/g';

/**
 * @see https://github.com/antvis/G/issues/1176
 */
export async function issue_1176(context: { canvas: Canvas }) {
  const { canvas } = context;
  await canvas.ready;

  const rect1 = new Rect({
    style: {
      x: 0,
      y: 0,
      width: 45,
      height: 45,
      stroke: 'black',
      fill: 'red',
      transform: 'translate(200px, 200px)',
    },
  });
  const rect2 = rect1.cloneNode();
  rect2.style.y = 55;
  rect2.style.fill = '#00ff00';
  const rect3 = rect1.cloneNode();
  rect3.style.x = 55;
  rect3.style.y = 55;
  rect3.style.fill = '#0000ff';
  const rect4 = rect1.cloneNode();
  rect4.style.x = 55;
  rect4.style.y = 0;
  rect4.style.fill = '#00ffff';

  canvas.appendChild(rect1);
  canvas.appendChild(rect2);
  canvas.appendChild(rect3);
  canvas.appendChild(rect4);
}
