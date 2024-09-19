import { Image, Line, Polyline, Rect, Path } from '@antv/g';

export async function zoom(context) {
  const { canvas } = context;
  await canvas.ready;

  const rect = new Rect({
    style: {
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      fill: 'red',
      stroke: 'black',
      strokeWidth: 2,
    },
  });
  canvas.appendChild(rect);

  const image = new Image({
    style: {
      x: 150,
      y: 0,
      width: 100,
      height: 100,
      src: 'https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*_aqoS73Se3sAAAAAAAAAAAAAARQnAQ',
    },
  });
  canvas.appendChild(image);

  const line = new Line({
    style: {
      x1: 250,
      y1: 0,
      x2: 300,
      y2: 200,
      stroke: 'black',
      lineWidth: 0.1,
    },
  });
  canvas.appendChild(line);

  const polyline = new Polyline({
    style: {
      points: [
        [0, 100],
        [10, 130],
        [30, 130],
      ],
      stroke: 'red',
      lineWidth: 0.1,
    },
  });
  canvas.appendChild(polyline);

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
      lineWidth: 0.1,
      lineJoin: 'round',
      stroke: '#54BECC',
      cursor: 'pointer',
    },
  });
  canvas.appendChild(path2);

  const camera = canvas.getCamera();
  camera.setZoom(0.5);
}
