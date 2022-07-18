import { Circle } from '@antv/g';
import type { Annotation } from '../interface/annotation';

export const renderCircle = (context: any, anno: Annotation) => {
  const circle = new Circle({
    style: {
      cx: anno.path[0].x,
      cy: anno.path[0].y,
      r: context.keyPointSize,
      fill: 'blue',
      cursor: 'pointer',
    },
    className: anno.id,
    id: `${anno.id}-circle`,
  });
  circle.addEventListener('mouseover', () => {
    circle.style.fill = 'yellow';
    circle.style.stroke = 'blue';
    circle.style.lineWidth = 3;
  });

  circle.addEventListener('mouseout', () => {
    circle.style.fill = 'blue';
    circle.style.stroke = 'blue';
    circle.style.lineWidth = 0;
  });

  circle.addEventListener('mousedown', () => {
    context.activeTool.isActive = true;
  });

  context.canvas.appendChild(circle);
  return [circle];
};
