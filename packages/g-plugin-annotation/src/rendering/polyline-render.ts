import { Polyline } from '@antv/g';
import type { AnnotationPlugin } from '../AnnotationPlugin';
import { DASH_LINE_STYLE } from '../constants/style';
import type { DrawerState } from '../interface/drawer';
import { renderDrawLine } from './drawline-render';
import { renderDrawPoints } from './drawPoint-render';

const renderDrawingLine = (context: AnnotationPlugin, anno: DrawerState) => {
  const total = anno.path.length;
  const drawingPoints = [anno.path[total - 2], anno.path[total - 1]];

  if (drawingPoints.length < 2) {
    return;
  }

  let polyline = context.polylineLastSegment;
  if (!polyline) {
    polyline = new Polyline({
      style: {
        points: [],
        ...DASH_LINE_STYLE,
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
export const renderPolyline = (context: AnnotationPlugin, anno: DrawerState) => {
  renderDrawPoints(context, anno);
  renderDrawLine(context, anno);
  renderDrawingLine(context, anno);
};
