import { Polyline } from '@antv/g';
import { DASH_LINE_STYLE, DEFAULT_LINE_HOVER_STYLE, DEFAULT_LINE_STYLE } from '../constants/style';
import type { DrawerState } from '../interface/drawer';
import { renderDrawLine } from './drawline-render';
import { renderDrawPoints } from './drawPoint-render';

const renderDrawingLine = (context, anno: DrawerState) => {
  const total = anno.path.length;
  const drawingPoints = [anno.path[total - 2], anno.path[total - 1]];
  const polyline = new Polyline({
    style: {
      points: drawingPoints.map((p) => [p.x, p.y]),
      ...DASH_LINE_STYLE,
    },
    className: anno.id,
    id: `${anno.id}-drawingline`,
  });
  context.canvas?.appendChild(polyline);
};
export const renderPolyline = (context, anno: DrawerState) => {
  if (anno.isDrawing) {
    renderDrawPoints(context, anno);
    renderDrawLine(context, anno);
    renderDrawingLine(context, anno);
    return;
  }
  const polyline = new Polyline({
    style: {
      points: anno.path.map((p) => [p.x, p.y]),
      ...DEFAULT_LINE_STYLE,
    },
    className: anno.id,
    id: `${anno.id}-polyline`,
  });
  context.canvas?.appendChild(polyline);

  polyline.addEventListener('mouseover', () => {
    polyline.attr(DEFAULT_LINE_HOVER_STYLE);
  });

  polyline.addEventListener('mouseout', () => {
    polyline.attr(DEFAULT_LINE_STYLE);
  });

  polyline.addEventListener('mousedown', (e) => {
    context.setActiveAnnotation(anno.id);
    e.stopPropagation();
  });

  polyline.addEventListener('mousedown', (e) => {
    context.setActiveAnnotation(anno.id);
    e.stopPropagation();
  });
};
