import { Path, Polyline, Circle } from '@antv/g';

export async function getPoint(context) {
  const { canvas, gui } = context;
  await canvas.ready;

  const path = new Path({
    style: {
      lineWidth: 1,
      stroke: '#54BECC',
      d: 'M 0,40 C 5.5555555555555545,40,22.222222222222218,44.44444444444445,33.33333333333333,40 C 44.444444444444436,35.55555555555556,55.55555555555554,14.66666666666667,66.66666666666666,13.333333333333336 C 77.77777777777777,12.000000000000002,88.88888888888887,32,100,32 C 111.11111111111113,32,122.22222222222221,14.66666666666667,133.33333333333331,13.333333333333336 C 144.44444444444443,12.000000000000002,155.55555555555557,24,166.66666666666669,24 C 177.7777777777778,24,188.8888888888889,11.111111111111114,200,13.333333333333336 C 211.1111111111111,15.555555555555557,222.22222222222226,35.111111111111114,233.33333333333334,37.333333333333336 C 244.44444444444443,39.55555555555555,255.55555555555551,31.22222222222223,266.66666666666663,26.66666666666667 C 277.77777777777777,22.111111111111114,294.4444444444444,12.777777777777779,300,10',
      transform: 'translate(100, 100)',
    },
  });
  const pointInPath = new Circle({
    style: {
      r: 10,
      fill: 'red',
    },
  });
  canvas.appendChild(path);
  canvas.appendChild(pointInPath);

  const polyline = new Polyline({
    style: {
      lineWidth: 1,
      stroke: '#54BECC',
      points: [
        [200, 200],
        [200, 300],
        [300, 300],
      ],
    },
  });
  const pointInPath2 = new Circle({
    style: {
      r: 10,
      fill: 'red',
    },
  });
  canvas.appendChild(polyline);
  canvas.appendChild(pointInPath2);

  const getPointFolder = gui.addFolder('getPoint');
  const getPointConfig = {
    ratio: 0,
  };
  getPointFolder.add(getPointConfig, 'ratio', 0, 1).onChange((ratio) => {
    let point = path.getPoint(ratio);
    if (point) {
      pointInPath.setPosition(point.x, point.y);
    }

    let point2 = polyline.getPoint(ratio);
    if (point2) {
      pointInPath2.setPosition(point2.x, point2.y);
    }
  });
}
