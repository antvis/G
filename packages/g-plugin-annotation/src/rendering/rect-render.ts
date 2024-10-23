import type { PointLike, PolygonStyleProps } from '@antv/g-lite';
import { Polygon, definedProps } from '@antv/g-lite';
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

  const [tl, tr, br, bl] = path;

  let { brushRect } = context;
  if (!brushRect) {
    brushRect = new Polygon({
      id: anno.id,
      className: anno.id,
      style: {
        points: [],
      },
    });

    context.canvas?.appendChild(brushRect);
    context.brushRect = brushRect;
  }

  const rectStyle: PolygonStyleProps = {
    points: [
      [tl.x, tl.y],
      [tr.x, tr.y],
      [br.x, br.y],
      [bl.x, bl.y],
    ],
    visibility: 'visible',
    ...style,
    ...definedProps({
      fill: rectFill,
      fillOpacity: rectFillOpacity,
      stroke: rectStroke,
      strokeOpacity: rectStrokeOpacity,
      lineWidth: rectStrokeWidth,
      lineDash: rectLineDash,
    }),
  };

  const zoom = context.canvas.getCamera().getZoom();
  // @ts-ignore
  rectStyle.lineWidth /= zoom;

  brushRect.attr(rectStyle);
};
