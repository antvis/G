import { Polygon, Polyline } from '@antv/g';
import { DEFAULT_STYLE } from '../constants/style';
import type { Annotation } from '../interface/annotation';
import { DEFAULT_AREA_HOVER_STYLE, DASH_LINE_STYLE } from '../constants/style';
import { renderDrawPoints } from './drawPoint-render';
import { renderDrawLine } from './drawline-render';

const renderDrawingLine = (context, anno: Annotation) => {
  const total = anno.path.length;
  const drawingPoints = [anno.path[total - 2], anno.path[total - 1], anno.path[0]];
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

export const renderPolygon = (context, anno: Annotation) => {
  if (anno.isDrawing) {
    renderDrawPoints(context, anno);
    renderDrawLine(context, anno);
    renderDrawingLine(context, anno);
    return;
  }

  if (!anno.isDrawing) {
    const polygon = new Polygon({
      style: {
        points: anno.path.map((p) => [p.x, p.y]),
        ...DEFAULT_STYLE,
      },
      className: anno.id,
      id: anno.id,
    });

    polygon.addEventListener('mouseover', () => {
      polygon.attr(DEFAULT_AREA_HOVER_STYLE);
    });

    polygon.addEventListener('mouseout', () => {
      polygon.attr(DEFAULT_STYLE);
    });

    polygon.addEventListener('mousedown', (e) => {
      context.freezeDrawer();
      context.setActiveAnnotation(anno.id);
      e.stopPropagation();
    });

    polygon.addEventListener('mouseup', (e) => {
      context.unfreezeDrawer();
      e.stopPropagation();
    });

    context.canvas?.appendChild(polygon);
  }
};
