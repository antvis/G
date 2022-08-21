import { Circle } from '@antv/g';
import type { AnnotationPlugin } from '../AnnotationPlugin';
import {
  ACTIVE_DRAWPOINT_STYLE,
  HOVER_DRAWPOINT_STYLE,
  NORMAL_DRAWPOINT_STYLE,
} from '../constants/style';
import type { DrawerState } from '../interface/drawer';

export const renderDrawPoints = (context: AnnotationPlugin, anno: DrawerState) => {
  const points = anno.path.slice(0, anno.path.length - 1);
  const length = points.length;
  points.forEach((point, index) => {
    const styles = index === length - 1 ? ACTIVE_DRAWPOINT_STYLE : NORMAL_DRAWPOINT_STYLE;

    let circle = context.polylineControlPoints[index];
    if (!circle) {
      circle = new Circle({
        style: {
          cx: 0,
          cy: 0,
          r: 0,
          cursor: 'pointer',
        },
        className: anno.id,
        id: `${anno.id}-circle-${index}`,
      });

      context.canvas?.appendChild(circle);

      context.polylineControlPoints[index] = circle;
    }

    circle.attr({
      cx: point.x,
      cy: point.y,
      visibility: 'visible',
      ...styles,
    });

    // todo:  修改不生效
    circle.addEventListener('mouseover', () => {
      circle.attr({ ...circle.style, ...HOVER_DRAWPOINT_STYLE, r: 10 });
    });

    circle.addEventListener('mouseout', () => {
      circle.style = { ...circle.style, ...HOVER_DRAWPOINT_STYLE };
    });
  });
};
