import { Circle } from '@antv/g';
import type { Annotation } from '../interface/annotation';
import { EDIT_POINT_STYLE, NORMAL_POINT_STYLE, HOVER_POINT_STYLE } from '../constants/style';
import type { AnnotationPlugin } from '../AnnotationPlugin';

export const renderCircle = (context: AnnotationPlugin, anno: Annotation) => {
  const style = anno.isActive ? EDIT_POINT_STYLE : NORMAL_POINT_STYLE;
  const circle = new Circle({
    style: {
      cx: anno.path[0].x,
      cy: anno.path[0].y,
      ...style,
    },
    className: anno.id,
    id: anno.id,
  });

  context.canvas.appendChild(circle);
  circle.addEventListener('mouseover', (e) => {
    circle.attr(anno.isActive ? EDIT_POINT_STYLE : HOVER_POINT_STYLE);
  });

  circle.addEventListener('mouseout', (e) => {
    circle.attr(style);
  });

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
