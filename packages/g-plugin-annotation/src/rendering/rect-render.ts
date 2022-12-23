import type { PointLike } from '@antv/g-lite';
import { Rect, definedProps } from '@antv/g-lite';
import type { AnnotationPlugin } from '../AnnotationPlugin';
import { DASH_LINE_STYLE, DEFAULT_STYLE } from '../constants/style';
import type { DrawerState } from '../interface/drawer';

export function getWidthFromBbox(path: PointLike[]) {
  const [tl, tr] = path;
  const dy = tr.y - tl.y;
  const dx = tr.x - tl.x;
  return Math.sqrt(dy * dy + dx * dx);
}

export function getHeightFromBbox(path: PointLike[]) {
  const [, tr, br] = path;
  const dy = br.y - tr.y;
  const dx = br.x - tr.x;
  return Math.sqrt(dy * dy + dx * dx);
}

function getRotationFromBbox(path: PointLike[]) {
  const [tl, tr] = path;
  const dy = tr.y - tl.y;
  const dx = tr.x - tl.x;
  return (Math.atan(dy / dx) * 180) / Math.PI;
}

export const renderRect = (context: AnnotationPlugin, anno: DrawerState) => {
  const { path } = anno;
  const style = anno.isDrawing ? DASH_LINE_STYLE : DEFAULT_STYLE;
  const {
    rectFill,
    rectFillOpacity,
    rectStroke,
    rectStrokeOpacity,
    rectStrokeWidth,
    rectLineDash,
  } = context.annotationPluginOptions.drawerStyle;

  const [tl] = path;
  const { x, y } = tl;
  const width = getWidthFromBbox(path);
  const height = getHeightFromBbox(path);
  const rotation = getRotationFromBbox(path);

  let brushRect = context.brushRect;
  if (!brushRect) {
    brushRect = new Rect({
      id: anno.id,
      className: anno.id,
      style: {
        width: 0,
        height: 0,
      },
    });

    context.canvas?.appendChild(brushRect);
    context.brushRect = brushRect;
  }

  brushRect.attr({
    x,
    y,
    height,
    width,
    visibility: 'visible',
    ...style,
    ...definedProps({
      fill: rectFill,
      fillOpacity: rectFillOpacity,
      stroke: rectStroke,
      strokeOpacity: rectStrokeOpacity,
      strokeWidth: rectStrokeWidth,
      lineDash: rectLineDash,
    }),
  });
  if (!isNaN(rotation)) {
    brushRect.setLocalEulerAngles(rotation);
  }
};
