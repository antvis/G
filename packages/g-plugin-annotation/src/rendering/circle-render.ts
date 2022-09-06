import type { FederatedEvent } from '@antv/g-lite';
import { Circle } from '@antv/g-lite';
import type { AnnotationPlugin } from '../AnnotationPlugin';
import { EDIT_POINT_STYLE } from '../constants/style';
import type { DrawerState } from '../interface/drawer';

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

  circle.addEventListener('mousedown', (e: FederatedEvent) => {
    context.freezeDrawer();
    context.setActiveAnnotation(anno.id);
    e.stopPropagation();
  });

  circle.addEventListener('mouseup', (e: FederatedEvent) => {
    context.unfreezeDrawer();
    e.stopPropagation();
  });

  return [circle];
};
