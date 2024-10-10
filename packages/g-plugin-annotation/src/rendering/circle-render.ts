import { Circle } from '@antv/g-lite';
import type { AnnotationPlugin } from '../AnnotationPlugin';
import { EDIT_POINT_STYLE } from '../constants/style';
import type { DrawerState } from '../interface/drawer';

export const renderCircle = (context: AnnotationPlugin, anno: DrawerState) => {
  const { path } = anno;

  let { pointCircle } = context;
  if (!pointCircle) {
    pointCircle = new Circle({
      style: {
        isSizeAttenuation: true,
        ...EDIT_POINT_STYLE,
      },
      className: anno.id,
      id: anno.id,
    });

    context.canvas.appendChild(pointCircle);
    context.pointCircle = pointCircle;
  }

  pointCircle.attr({
    cx: path[0].x,
    cy: path[0].y,
    visibility: 'visible',
  });
};
