import {
  Circle,
  Ellipse,
  Path,
  Line,
  Polyline,
  Polygon,
  Rect,
  convertToPath,
} from '@antv/g';

export async function convert2Path(context) {
  const { canvas } = context;

  await canvas.ready;

  /**
   * show converted path in blue
   */
  const showConvertedPath = (object) => {
    const pathStr = convertToPath(object);
    const objectPath = new Path({
      style: {
        d: pathStr,
        fill: 'none',
        stroke: 'blue',
        lineWidth: 10,
      },
    });
    canvas.appendChild(objectPath);
  };

  /**
   * Circle -> Path
   */
  const circle = new Circle({
    style: {
      cx: 0,
      cy: 0,
      r: 100,
      transform: 'translate(100, 100)',
      fill: 'red',
      opacity: 0.5,
    },
  });
  canvas.appendChild(circle);
  circle.scale(0.5);
  showConvertedPath(circle);

  /**
   * Ellipse -> Path
   */
  const ellipse = new Ellipse({
    style: {
      cx: 0,
      cy: 0,
      rx: 100,
      ry: 60,
      fill: 'red',
      opacity: 0.5,
    },
  });
  ellipse.setPosition(300, 100);
  ellipse.setLocalScale(0.6);
  canvas.appendChild(ellipse);
  showConvertedPath(ellipse);

  /**
   * Rect -> Path
   */
  const rect = new Rect({
    style: {
      x: 200,
      y: 100,
      width: 100,
      height: 100,
      fill: 'red',
      opacity: 0.5,
      transformOrigin: '200 100',
    },
  });
  canvas.appendChild(rect);
  rect.rotateLocal(30);
  showConvertedPath(rect);

  /**
   * Line -> Path
   */
  const line = new Line({
    style: {
      x1: 100,
      y1: 200,
      x2: 100,
      y2: 300,
      lineWidth: 30,
      stroke: 'red',
      opacity: 0.5,
    },
  });
  canvas.appendChild(line);
  showConvertedPath(line);

  /**
   * Polyline -> Path
   */
  const polyline = new Polyline({
    style: {
      points: '100,360 100,400, 50,400',
      lineWidth: 30,
      stroke: 'red',
      opacity: 0.5,
      transformOrigin: 'center',
    },
  });
  canvas.appendChild(polyline);
  polyline.rotateLocal(90);
  showConvertedPath(polyline);

  /**
   * Polyline -> Path
   */
  const polygon = new Polygon({
    style: {
      points: '200,360 200,400, 250,400',
      fill: 'red',
      transform: 'scale(2)',
      transformOrigin: '200 360',
      opacity: 0.5,
    },
  });
  canvas.appendChild(polygon);
  showConvertedPath(polygon);

  /**
   * Path -> Path
   */
  const path = new Path({
    style: {
      d: 'M301.113,12.011l99.25,179.996l201.864,38.778L461.706,380.808l25.508,203.958l-186.101-87.287L115.01,584.766l25.507-203.958L0,230.785l201.86-38.778L301.113,12.011Z',
      fill: 'red',
      opacity: 0.5,
    },
  });
  path.translate(300, 250);
  path.scale(0.2);
  canvas.appendChild(path);
  showConvertedPath(path);
}
