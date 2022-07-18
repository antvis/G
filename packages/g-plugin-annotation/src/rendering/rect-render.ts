import { Rect } from '@antv/g';
import type { Annotation } from '../interface/annotation';
import { renderControl } from './control-render';
export const renderRect = (context: any, anno: Annotation) => {
  const { path, id } = anno;

  const rect = new Rect({
    style: {
      x: path[0].x,
      y: path[0].y,
      height: path[2].y - path[0].y,
      width: path[2].x - path[0].x,
      fill: null,
      stroke: 'blue',
      lineWidth: context.lineWidth,
    },
    className: anno.id,
    id: anno.id,
  });

  if (anno.isActive) {
    const controls1 = renderControl({
      x: path[0].x,
      y: path[0].y,
      controlId: `${id}-controls-1`,
      onDrag: (x, y) => {
        rect.style.x = x;
        rect.style.y = y;
      },
    });
    const controls2 = renderControl({
      x: path[2].x,
      y: path[2].y,
      controlId: `${id}-controls-2`,
      onDrag: (x, y) => {
        rect.style.width = x - (rect.style.x as number);
        rect.style.height = y - (rect.style.y as number);
        // TODO
        // rect.dispatchEvent(event);
      },
    });
    context.canvas?.appendChild(controls1);
    context.canvas?.appendChild(controls2);
  }

  rect.addEventListener('mouseover', () => {
    rect.style.stroke = 'red';
  });

  rect.addEventListener('mouseout', () => {
    rect.style.stroke = 'blue';
  });

  rect.addEventListener('mousedown', (e) => {
    if (anno.isActive) {
      anno.isActive = false;
    } else {
      anno.isActive = true;
    }
    context.activeTool.isActive = true;
    e.stopPropagation();
  });

  context.canvas?.appendChild(rect);
};
