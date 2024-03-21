import { definedProps, Polyline } from '@antv/g-lite';
import type { AnnotationPlugin } from '../AnnotationPlugin';
import { DRAW_LINE_STYLE } from '../constants/style';
import type { DrawerState } from '../interface/drawer';

export const renderDrawLine = (
  context: AnnotationPlugin,
  anno: DrawerState,
) => {
  const drawPoints = anno.path.slice(0, anno.path.length - 1);

  let polyline = context.savedPolyline;
  if (drawPoints.length < 2) {
    if (polyline) {
      polyline.style.visibility = 'hidden';
    }
    return;
  }

  const {
    polylineSegmentStroke,
    polylineSegmentStrokeWidth,
    polylineSegmentLineDash,
  } = context.annotationPluginOptions.drawerStyle;

  if (!polyline) {
    polyline = new Polyline({
      style: {
        points: [],
        isSizeAttenuation: true,
        ...DRAW_LINE_STYLE,
        ...definedProps({
          stroke: polylineSegmentStroke,
          lineWidth: polylineSegmentStrokeWidth,
          lineDash: polylineSegmentLineDash,
        }),
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
