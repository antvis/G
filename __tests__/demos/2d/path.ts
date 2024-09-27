import { Path } from '@antv/g';

export async function path(context) {
  const { canvas } = context;
  await canvas.ready;

  const path = new Path({
    style: {
      d: 'M10,10 L30,30 L10, 30',
      stroke: 'red',
      lineWidth: 6,
    },
  });
  canvas.appendChild(path);

  // dashed
  const polyline2 = path.cloneNode();
  polyline2.style.lineDash = [2];
  polyline2.translate(30, 0);
  canvas.appendChild(polyline2);

  // lineCap
  const polyline3 = path.cloneNode();
  polyline3.style.lineCap = 'round';
  polyline3.translate(60, 0);
  canvas.appendChild(polyline3);
  const polyline4 = path.cloneNode();
  polyline4.style.lineCap = 'square';
  polyline4.translate(90, 0);
  canvas.appendChild(polyline4);

  // lineJoin
  const polyline5 = path.cloneNode();
  polyline5.style.lineJoin = 'round';
  polyline5.translate(120, 0);
  canvas.appendChild(polyline5);

  const polyline6 = path.cloneNode();
  polyline6.style.lineJoin = 'miter'; // "bevel" | "miter" | "round";
  polyline6.translate(150, 0);
  canvas.appendChild(polyline6);

  const path2 = new Path({
    style: {
      d:
        'M 100,300' +
        'l 50,-25' +
        'a25,25 -30 0,1 50,-25' +
        'l 50,-25' +
        'a25,50 -30 0,1 50,-25' +
        'l 50,-25' +
        'a25,75 -30 0,1 50,-25' +
        'l 50,-25' +
        'a25,100 -30 0,1 50,-25' +
        'l 50,-25' +
        'l 0, 200,' +
        'z',
      lineWidth: 10,
      lineJoin: 'round',
      stroke: '#54BECC',
      cursor: 'pointer',
    },
  });
  canvas.appendChild(path2);
  path2.scale(0.5);
  path2.translateLocal(0, 20);
}
