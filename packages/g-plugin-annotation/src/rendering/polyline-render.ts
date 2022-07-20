import { Polyline } from '@antv/g';
export const renderPolyline = (context, anno) => {
  const polyline = new Polyline({
    style: {
      points: anno.path.map((p) => [p.x, p.y]),
      stroke: 'blue',
      lineWidth: context.lineWidth,
    },
    className: anno.id,
    id: `${anno.id}-polyline`,
  });
  context.canvas?.appendChild(polyline);

  if (!anno.isDrawing) {
    polyline.addEventListener('mouseover', () => {
      polyline.style.stroke = 'red';
    });

    polyline.addEventListener('mouseout', () => {
      polyline.style.stroke = 'blue';
    });

    polyline.addEventListener('mousedown', (e) => {
      if (anno.active) {
        anno.active = false;
      } else {
        anno.active = true;
      }
      context.activeTool.isActive = true;
      e.stopPropagation();
    });
  }
};
