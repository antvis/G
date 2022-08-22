import { Polyline } from '@antv/g';
import type { AnnotationPlugin } from '../AnnotationPlugin';
import { DRAW_LINE_STYLE } from '../constants/style';
import type { DrawerState } from '../interface/drawer';

export const renderDrawLine = (context: AnnotationPlugin, anno: DrawerState) => {
  const drawPoints = anno.path.slice(0, anno.path.length - 1);

  if (drawPoints.length < 2) {
    return;
  }

  let polyline = context.savedPolyline;
  if (!polyline) {
    polyline = new Polyline({
      style: {
        points: [],
        ...DRAW_LINE_STYLE,
      },
      className: anno.id,
      id: `${anno.id}-line`,
    });
    context.canvas?.appendChild(polyline);
    context.savedPolyline = polyline;
  }

  polyline.attr({
    points: drawPoints.map((p) => [p.x, p.y]),
    visibility: 'visible',
  });
};
