import { Canvas, Path, Line } from '@antv/g';

/**
 * @see https://github.com/antvis/G/issues/1760
 * @see https://github.com/antvis/G/issues/1790
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

  const path = new Path({
    style: {
      lineWidth: 1,
      stroke: '#54BECC',
      // d: 'M 0,40 L 100,100',
      d: 'M 10,100 L 100,100',
      markerStart: arrowMarker,
      markerStartOffset: 30,
      markerEnd: arrowMarker,
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
