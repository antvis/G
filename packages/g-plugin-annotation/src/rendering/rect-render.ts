import { Rect } from '@antv/g';
import { DEFAULT_STYLE, DASH_LINE_STYLE } from '../constants/style';
import type { AnnotationPlugin } from '../AnnotationPlugin';
import type { DrawerState } from '../interface/drawer';

export const renderRect = (context: AnnotationPlugin, anno: DrawerState) => {
  const { path } = anno;
  const left = path[0].x;
  const top = path[0].y;
  const height = path[2].y - path[0].y;
  const width = path[2].x - path[0].x;
  const style = anno.isDrawing ? DASH_LINE_STYLE : DEFAULT_STYLE;
  const rect = new Rect({
    style: {
      x: left,
      y: top,
      height,
      width,
      ...style,
    },
    className: anno.id,
    id: anno.id,
  });

  rect.addEventListener('mousedown', (e) => {
    context.freezeDrawer();
    context.setActiveAnnotation(anno.id);
  });

  rect.addEventListener('mouseup', (e) => {
    context.unfreezeDrawer();
  });

  context.canvas?.appendChild(rect);
};
