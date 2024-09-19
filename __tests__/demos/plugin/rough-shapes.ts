import {
  CanvasEvent,
  Circle,
  convertToPath,
  Ellipse,
  Group,
  Image,
  Line,
  Path,
  Polygon,
  Polyline,
  Rect,
  Text,
} from '@antv/g';
import { Plugin as PluginRoughCanvasRenderer } from '@antv/g-plugin-rough-canvas-renderer';
import { Plugin as PluginRoughSVGRenderer } from '@antv/g-plugin-rough-svg-renderer';
import WebFont from 'webfontloader';
export async function roughShapes(context) {
  const { canvas } = context;
  await canvas.ready;

  /**
  solarSystem
    |    |
    |   sun
    |
  earthOrbit
    |    |
    |  earth
    |
    moonOrbit
        |
      moon
  */
  const solarSystem = new Group({
    id: 'solarSystem',
  });
  const earthOrbit = new Group({
    id: 'earthOrbit',
  });
  const moonOrbit = new Group({
    id: 'moonOrbit',
  });

  const sun = new Circle({
    id: 'sun',
    style: {
      r: 100,
      fill: '#1890FF',
      stroke: '#F04864',
      lineWidth: 4,
    },
  });
  const earth = new Circle({
    id: 'earth',
    style: {
      r: 50,
      fill: '#1890FF',
      stroke: '#F04864',
      lineWidth: 4,
    },
  });
  const moon = new Circle({
    id: 'moon',
    style: {
      r: 25,
      fill: '#1890FF',
      stroke: '#F04864',
      lineWidth: 4,
    },
  });

  solarSystem.appendChild(sun);
  solarSystem.appendChild(earthOrbit);
  earthOrbit.appendChild(earth);
  earthOrbit.appendChild(moonOrbit);
  moonOrbit.appendChild(moon);

  // solarSystem.setPosition(300, 250);
  // earthOrbit.translate(100, 0);
  // moonOrbit.translate(100, 0);
  solarSystem.style.transform = 'translate(300, 250)';
  earthOrbit.style.transform = 'translate(100, 0)';
  moonOrbit.style.transform = 'translate(100, 0)';

  canvas.appendChild(solarSystem);
  canvas.addEventListener(CanvasEvent.AFTER_RENDER, () => {
    solarSystem.rotateLocal(1);
    earthOrbit.rotateLocal(2);
  });

  /**
   * Ellipse
   */
  const ellipse = new Ellipse({
    style: {
      cx: 150,
      cy: 100,
      rx: 25,
      ry: 15,
      fill: '#1890FF',
      stroke: '#F04864',
      strokeOpacity: 0.5,
      lineWidth: 4,
      cursor: 'pointer',
    },
  });
  canvas.appendChild(ellipse);

  /**
   * Rect
   */
  const rect = new Rect({
    style: {
      x: 50,
      y: 50,
      width: 50,
      height: 50,
      fill: '#1890FF',
      fillOpacity: 0.5,
      stroke: '#F04864',
      lineWidth: 4,
      bowing: 4,
      cursor: 'pointer',
    },
  });
  canvas.appendChild(rect);
  rect.addEventListener('pointerenter', function () {
    rect.style.fill = 'yellow';
  });
  rect.addEventListener('pointerleave', function () {
    rect.style.fill = '#1890FF';
  });

  /**
   * Line
   */
  const line = new Line({
    style: {
      x1: 50,
      y1: 120,
      x2: 50,
      y2: 200,
      stroke: '#F04864',
      lineWidth: 4,
      cursor: 'pointer',
    },
  });
  canvas.appendChild(line);

  /**
   * Polyline
   */
  const polyline = new Polyline({
    style: {
      points: [
        [50, 250],
        [50, 300],
        [100, 300],
        [100, 350],
      ],
      stroke: '#F04864',
      lineWidth: 4,
      cursor: 'pointer',
    },
  });
  canvas.appendChild(polyline);

  /**
   * Polygon
   */
  const polygon = new Polygon({
    style: {
      points: [
        [50, 400],
        [100, 400],
        [100, 450],
      ],
      fill: '#1890FF',
      stroke: '#F04864',
      lineWidth: 4,
      cursor: 'pointer',
    },
  });
  canvas.appendChild(polygon);

  /**
   * Path
   */
  const rectPath = convertToPath(
    new Rect({
      style: {
        x: 100,
        y: 0,
        width: 200,
        height: 100,
        transformOrigin: 'center',
      },
    }),
  );
  const starPath = new Path({
    style: {
      d: 'M301.113,12.011l99.25,179.996l201.864,38.778L461.706,380.808l25.508,203.958l-186.101-87.287L115.01,584.766l25.507-203.958L0,230.785l201.86-38.778L301.113,12.011',
    },
  });
  starPath.translate(200, 0);
  starPath.scale(0.2);
  const pathG = new Path({
    style: {
      d: rectPath,
      lineWidth: 2,
      cursor: 'pointer',
    },
  });
  canvas.appendChild(pathG);
  pathG.animate(
    [
      { d: rectPath, stroke: '#F04864', fill: 'blue' },
      { d: convertToPath(starPath), stroke: 'blue', fill: '#F04864' },
    ],
    {
      duration: 2500,
      easing: 'ease',
      iterations: Infinity,
      direction: 'alternate',
    },
  );
  pathG.translate(300, 0);

  /**
   * Text
   */
  WebFont.load({
    google: {
      families: ['Gaegu'],
    },
    active: () => {
      const text = new Text({
        style: {
          x: 100,
          y: 450,
          fontFamily: 'Gaegu',
          text: 'Almost before we knew it, we had left the ground.',
          fontSize: 30,
          fill: '#1890FF',
          stroke: '#F04864',
          lineWidth: 5,
          cursor: 'pointer',
        },
      });
      canvas.appendChild(text);
    },
  });

  const image = new Image({
    style: {
      x: 90,
      y: 130,
      width: 100,
      height: 100,
      src: 'https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*N4ZMS7gHsUIAAAAAAAAAAABkARQnAQ',
    },
  });
  canvas.appendChild(image);
}

roughShapes.initRenderer = (renderer, type) => {
  if (type === 'canvas') {
    renderer.registerPlugin(new PluginRoughCanvasRenderer());
  } else if (type === 'svg') {
    renderer.registerPlugin(new PluginRoughSVGRenderer());
  }
};
