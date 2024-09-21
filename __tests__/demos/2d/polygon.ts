import { Polygon } from '@antv/g';

export async function polygon(context) {
  const { canvas } = context;
  await canvas.ready;

  const polygon = new Polygon({
    style: {
      points: [
        [10, 10],
        [10, 30],
        [30, 30],
      ],
      stroke: 'red',
      lineWidth: 6,
    },
  });
  canvas.appendChild(polygon);

  // dashed
  const polyline2 = polygon.cloneNode();
  polyline2.style.lineDash = [2];
  polyline2.translate(30, 0);
  canvas.appendChild(polyline2);

  // lineCap
  const polyline3 = polygon.cloneNode();
  polyline3.style.lineCap = 'round';
  polyline3.translate(60, 0);
  canvas.appendChild(polyline3);
  const polyline4 = polygon.cloneNode();
  polyline4.style.lineCap = 'square';
  polyline4.translate(90, 0);
  canvas.appendChild(polyline4);

  // lineJoin
  const polyline5 = polygon.cloneNode();
  polyline5.style.lineJoin = 'round';
  polyline5.translate(120, 0);
  canvas.appendChild(polyline5);

  const polyline6 = polygon.cloneNode();
  polyline6.style.lineJoin = 'miter'; // "bevel" | "miter" | "round";
  polyline6.translate(150, 0);
  canvas.appendChild(polyline6);
}
