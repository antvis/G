import { Circle } from '@antv/g';
import type { DrawerState } from '../interface/drawer';
import { EDIT_POINT_STYLE } from '../constants/style';
import type { AnnotationPlugin } from '../AnnotationPlugin';

export const renderCircle = (context: AnnotationPlugin, anno: DrawerState) => {
  const circle = new Circle({
    style: {
      cx: anno.path[0].x,
      cy: anno.path[0].y,
      ...EDIT_POINT_STYLE,
    },
    className: anno.id,
    id: anno.id,
  });

  context.canvas.appendChild(circle);

  circle.addEventListener('mousedown', (e) => {
    context.freezeDrawer();
    context.setActiveAnnotation(anno.id);
    e.stopPropagation();
  });

  circle.addEventListener('mouseup', (e) => {
    context.unfreezeDrawer();
    e.stopPropagation();
  });

  return [circle];
};
