import { Canvas, Path, Line } from '@antv/g';

/**
 * @see https://github.com/antvis/G/issues/1760
 * @see https://github.com/antvis/G/issues/1790
 * @see https://github.com/antvis/G/pull/1809
 */
export async function issue_1760(context: { canvas: Canvas }) {
  const { canvas } = context;
  await canvas.ready;

  const arrowMarker = new Path({
    style: {
      d: 'M 10,10 L -10,0 L 10,-10 Z',
      stroke: '#1890FF',
      transformOrigin: 'center',
    },
  });
  const arrowMarker1 = new Path({
    style: {
      d: 'M 10,10 L -10,0 L 10,-10 Z',
      stroke: '#ff90FF',
      transformOrigin: 'center',
    },
  });

  const path = new Path({
    style: {
      lineWidth: 1,
      stroke: '#54BECC',
      // d: 'M 0,40 L 100,100',
      // d: 'M 10,100 L 100,100',
      d: 'M 10,100 Q 100,100 150,150',
      // d: 'M 10,100 C 100,100 150,150 180,200',
      // d: 'M 10,100 A 30 50 0 0 1 162.55 162.45',
      // d: 'M 10,100 A 30 50 0 0 0 162.55 162.45',
      markerStart: arrowMarker,
      markerStartOffset: 30,
      markerEnd: arrowMarker1,
      markerEndOffset: 30,
    },
  });

  const line = new Line({
    style: {
      x1: 10,
      y1: 150,
      x2: 100,
      y2: 150,
      lineWidth: 1,
      stroke: '#54BECC',
      markerStart: arrowMarker,
      markerStartOffset: 30,
      markerEnd: arrowMarker,
      markerEndOffset: 30,
    },
  });

  canvas.appendChild(path);
  canvas.appendChild(line);
}
