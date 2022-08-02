import { Polyline } from '@antv/g';
import { DRAW_LINE_STYLE } from '../constants/style';
import type { DrawerState } from '../interface/drawer';

export const renderDrawLine = (context, anno: DrawerState) => {
  const drawPoints = anno.path.slice(0, anno.path.length - 1);
  const polyline = new Polyline({
    style: {
      points: drawPoints.map((p) => [p.x, p.y]),
      ...DRAW_LINE_STYLE,
    },
    className: anno.id,
    id: `${anno.id}-line`,
  });
  context.canvas?.appendChild(polyline);
};
