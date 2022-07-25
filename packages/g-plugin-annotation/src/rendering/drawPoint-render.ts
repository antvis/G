import { Circle } from '@antv/g';
import {
  ACTIVE_DRAWPOINT_STYLE,
  NORMAL_DRAWPOINT_STYLE,
  HOVER_DRAWPOINT_STYLE,
} from '../constants/style';
import type { Annotation } from '../interface/annotation';

export const renderDrawPoints = (context, anno: Annotation) => {
  const points = anno.path.slice(0, anno.path.length - 1);
  const length = points.length;
  points.forEach((point, index) => {
    const styles = index === length - 1 ? ACTIVE_DRAWPOINT_STYLE : NORMAL_DRAWPOINT_STYLE;
    const circle = new Circle({
      style: {
        cx: point.x,
        cy: point.y,
        ...styles,
      },
      className: anno.id,
      id: `${anno.id}-circle-${index}`,
    });
    circle.addEventListener('mouseover', () => {
      circle.attr({ ...circle.style, ...HOVER_DRAWPOINT_STYLE, r: 10 });
    });

    circle.addEventListener('mouseout', () => {
      circle.style = { ...circle.style, ...HOVER_DRAWPOINT_STYLE };
    });
    context.canvas?.appendChild(circle);
  });
};
