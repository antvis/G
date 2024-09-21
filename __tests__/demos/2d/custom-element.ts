import { Path, Polyline, Line } from '@antv/g';
import { Arrow } from '@antv/g-components';

export async function customElement(context) {
  const { canvas } = context;
  await canvas.ready;

  // create an arrow
  const lineArrow = new Arrow({
    id: 'lineArrow',
    style: {
      body: new Line({
        style: {
          x1: 200,
          y1: 100,
          x2: 0,
          y2: 0,
        },
      }),
      startHead: true,
      stroke: '#1890FF',
      lineWidth: 10,
      cursor: 'pointer',
      increasedLineWidthForHitTesting: 40,
    },
  });
  lineArrow.translate(200, 100);

  const polylineArrow = new Arrow({
    id: 'polylineArrow',
    style: {
      body: new Polyline({
        style: {
          points: [
            [0, 0],
            [50, 0],
            [50, 50],
            [100, 50],
            [100, 100],
            [150, 100],
          ],
        },
      }),
      startHead: true,
      stroke: '#1890FF',
      lineWidth: 10,
      cursor: 'pointer',
    },
  });
  polylineArrow.translate(200, 200);

  const pathArrow = new Arrow({
    id: 'pathArrow',
    style: {
      body: new Path({
        style: {
          d: 'M 100,300' + 'l 50,-25' + 'a25,25 -30 0,1 50,-80',
        },
      }),
      startHead: true,
      stroke: '#1890FF',
      lineWidth: 10,
      cursor: 'pointer',
    },
  });
  pathArrow.translate(100, 150);

  canvas.appendChild(lineArrow);
  canvas.appendChild(polylineArrow);
  canvas.appendChild(pathArrow);
}
