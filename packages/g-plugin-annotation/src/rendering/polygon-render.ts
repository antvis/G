import { Circle, Polygon, Polyline } from '@antv/g';
export const renderPolygon = (context, anno) => {
  if (anno.isDrawing) {
    const startPoint = anno.path[0];
    const circle = new Circle({
      style: {
        cx: startPoint.x,
        cy: startPoint.y,
        r: 8,
        fill: 'yellow',
        stroke: 'blue',
        lineWidth: 4,
        cursor: 'pointer',
      },
      className: anno.id,
      id: `${anno.id}-circle`,
    });

    circle.addEventListener('mouseover', () => {
      circle.style.fill = 'blue';
      circle.style.r = 10;
    });

    circle.addEventListener('mouseout', () => {
      circle.style.fill = 'yellow';
      circle.style.r = 8;
    });

    const polyline = new Polyline({
      style: {
        points: anno.path.map((p) => [p.x, p.y]),
        stroke: 'blue',
        lineWidth: context.lineWidth,
      },
      className: anno.id,
      id: `${anno.id}-polyline`,
    });
    context.canvas?.appendChild(circle);
    context.canvas?.appendChild(polyline);
  }

  if (!anno.isDrawing) {
    const polygon = new Polygon({
      style: {
        points: anno.path.map((p) => [p.x, p.y]),
        stroke: 'blue',
        lineWidth: context.lineWidth,
      },
      className: anno.id,
      id: anno.id,
    });

    polygon.addEventListener('mouseover', () => {
      polygon.style.stroke = 'red';
    });

    polygon.addEventListener('mouseout', () => {
      polygon.style.stroke = 'blue';
    });

    polygon.addEventListener('mousedown', (e) => {
      if (anno.active) {
        anno.active = false;
      } else {
        anno.active = true;
      }
      context.activeTool.isActive = true;
      e.stopPropagation();
    });

    context.canvas?.appendChild(polygon);
  }
};
