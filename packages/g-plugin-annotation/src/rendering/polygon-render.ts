import { definedProps, Polyline } from '@antv/g-lite';
import { DASH_LINE_STYLE } from '../constants/style';
import type { DrawerState } from '../interface/drawer';
import { renderDrawLine } from './drawline-render';
import { renderDrawPoints } from './drawPoint-render';

const renderDrawingLine = (context, anno: DrawerState) => {
  const total = anno.path.length;
  const drawingPoints = [
    ...[anno.path[total - 2], anno.path[total - 1]].filter((point) => !!point),
    anno.path[0],
  ];

  let polyline = context.polylineLastSegment;
  if (drawingPoints.length < 2) {
    if (polyline) {
      polyline.style.visibility = 'hidden';
    }
    return;
  }

  const {
    polylineActiveSegmentStroke,
    polylineActiveSegmentStrokeWidth,
    polylineActiveSegmentLineDash,
  } = context.annotationPluginOptions.drawerStyle;

  if (!polyline) {
    polyline = new Polyline({
      style: {
        points: [],
        isSizeAttenuation: true,
        ...DASH_LINE_STYLE,
        ...definedProps({
          stroke: polylineActiveSegmentStroke,
          lineWidth: polylineActiveSegmentStrokeWidth,
          lineDash: polylineActiveSegmentLineDash,
        }),
      },
      className: anno.id,
      id: `${anno.id}-drawingline`,
    });
    context.canvas?.appendChild(polyline);
    context.polylineLastSegment = polyline;
  }

  polyline.attr({
    points: drawingPoints.map((p) => [p.x, p.y]),
    visibility: 'visible',
  });
};

export const renderPolygon = (context, anno: DrawerState) => {
  renderDrawPoints(context, anno);
  renderDrawLine(context, anno);
  renderDrawingLine(context, anno);
};
