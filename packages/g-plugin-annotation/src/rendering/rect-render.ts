import { Rect, Text } from '@antv/g';
import { DEFAULT_STYLE, DASH_LINE_STYLE, DEFAULT_AREA_HOVER_STYLE } from '../constants/style';
import type { Annotation } from '../interface/annotation';
import { renderControl } from './control-render';
import type { AnnotationPlugin } from '../AnnotationPlugin';

export const renderRect = (context: AnnotationPlugin, anno: Annotation) => {
  const { path, id } = anno;
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

  if (anno.tag) {
    const text = new Text({
      style: {
        fontSize: 12,
        fill: 'red',
        text: anno.tag,
        x: left + width + 2,
        y: top + 8,
      },
      className: anno.id,
      id: `${anno.id}-text`,
    });
    context.canvas?.appendChild(text);
  }

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
    rect.attr(DEFAULT_AREA_HOVER_STYLE);
  });

  rect.addEventListener('mouseout', () => {
    rect.attr(DEFAULT_STYLE);
  });

  rect.addEventListener('mousedown', (e) => {
    context.freezeDrawer();
    context.setActiveAnnotation(anno.id);
    e.stopPropagation();
  });

  rect.addEventListener('mouseup', (e) => {
    context.unfreezeDrawer();
    e.stopPropagation();
  });

  context.canvas?.appendChild(rect);
};
