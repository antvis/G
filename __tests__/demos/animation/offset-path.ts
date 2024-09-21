import { Circle, Path, Line, Polyline } from '@antv/g';

export async function offsetPath(context) {
  const { canvas } = context;

  await canvas.ready;

  const offsetPathLine = new Line({
    style: {
      x1: 100,
      y1: 100,
      x2: 300,
      y2: 100,
    },
  });
  const offsetPathPolyline = new Polyline({
    style: {
      stroke: 'black',
      points: [
        [50, 50],
        [100, 50],
        [100, 100],
        [150, 100],
        [150, 150],
        [200, 150],
        [200, 200],
        [250, 200],
        [250, 250],
        [300, 250],
        [300, 300],
        [350, 300],
        [350, 350],
        [400, 350],
        [400, 400],
        [450, 400],
      ],
    },
  });

  const offsetPathPath = new Path({
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
    },
  });

  const circle1 = new Circle({
    style: {
      cx: 0,
      cy: 0,
      r: 60,
      fill: '#1890FF',
      stroke: '#F04864',
      lineWidth: 4,
      offsetPath: offsetPathLine,
    },
  });
  const circle2 = new Circle({
    style: {
      cx: 0,
      cy: 0,
      r: 10,
      fill: '#1890FF',
      stroke: '#F04864',
      lineWidth: 4,
      offsetPath: offsetPathPolyline,
    },
  });
  const circle3 = new Circle({
    style: {
      cx: 0,
      cy: 0,
      r: 60,
      fill: '#1890FF',
      stroke: '#F04864',
      lineWidth: 4,
      offsetPath: offsetPathPath,
    },
  });

  let animation;

  canvas.appendChild(offsetPathPolyline);
  canvas.appendChild(circle1);
  canvas.appendChild(circle2);
  canvas.appendChild(circle3);

  circle1.animate([{ offsetDistance: 0 }, { offsetDistance: 1 }], {
    duration: 2500,
    easing: 'cubic-bezier(0.250, 0.460, 0.450, 0.940)',
    iterations: Infinity,
    direction: 'alternate',
  });
  animation = circle2.animate([{ offsetDistance: 0 }, { offsetDistance: 1 }], {
    duration: 3500,
    easing: 'linear',
    iterations: Infinity,
    direction: 'alternate',
  });

  circle3.animate([{ offsetDistance: 0 }, { offsetDistance: 1 }], {
    duration: 4500,
    easing: 'cubic-bezier(0.250, 0.460, 0.450, 0.940)',
    iterations: Infinity,
    direction: 'alternate',
  });
}
