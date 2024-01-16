import {
  Image,
  Rect,
  Circle,
  Ellipse,
  Line,
  Polyline,
  Polygon,
} from '../../../packages/g';
import { Plugin as PluginDragndrop } from '../../../packages/g-plugin-dragndrop';
import { Plugin as PluginAnnotation } from '../../../packages/g-plugin-annotation';

let annotationPlugin;
export async function annotation(context) {
  const { canvas } = context;

  await canvas.ready;

  const circle = new Circle({
    style: {
      cx: 200,
      cy: 200,
      r: 100,
      stroke: '#F04864',
      lineWidth: 10,
      // @ts-ignore
      selectable: true,
    },
  });

  const ellipse = new Ellipse({
    style: {
      cx: 440,
      cy: 200,
      rx: 100,
      ry: 50,
      stroke: '#F04864',
      lineWidth: 10,
      // @ts-ignore
      selectable: true,
    },
  });

  const image = new Image({
    style: {
      x: 300,
      y: 280,
      width: 200,
      height: 200,
      src: 'https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*N4ZMS7gHsUIAAAAAAAAAAABkARQnAQ',
      // transform: 'scale(0.5) rotate(30deg)',
      // @ts-ignore
      selectable: true,
    },
  });
  image.addEventListener('selected', () => {
    console.log('image selected');
  });
  image.addEventListener('deselected', () => {
    console.log('image deselected');
  });

  const rect = new Rect({
    style: {
      x: 100,
      y: 280,
      width: 100,
      height: 200,
      fill: 'blue',
      stroke: 'red',
      // @ts-ignore
      selectable: true,
    },
  });

  const line = new Line({
    style: {
      x1: 100,
      y1: 100,
      x2: 100,
      y2: 300,
      lineWidth: 10,
      stroke: 'red',
      // @ts-ignore
      selectable: true,
    },
  });

  const polyline = new Polyline({
    style: {
      points: [
        [200, 100],
        [300, 100],
        [300, 200],
        [300, 300],
      ],
      lineWidth: 10,
      stroke: 'red',
      // @ts-ignore
      selectable: true,
    },
  });

  canvas.appendChild(circle);
  canvas.appendChild(ellipse);
  canvas.appendChild(image);
  canvas.appendChild(rect);
  canvas.appendChild(line);
  canvas.appendChild(polyline);

  annotationPlugin.setDrawingMode(true);
  annotationPlugin.setDrawer('rect');

  annotationPlugin.addEventListener('drawer:enable', (setDrawer) => {
    console.log('drawer:enable', setDrawer);
  });

  annotationPlugin.addEventListener('draw:start', (toolstate) => {
    console.log('draw:start', toolstate);
  });

  annotationPlugin.addEventListener('draw:complete', ({ type, path }) => {
    // use any brush you preferred
    const brush = {
      stroke: 'black',
      strokeWidth: 10,
      selectable: true,
    };

    if (type === 'polyline') {
      const polyline = new Polyline({
        style: {
          ...brush,
          points: path.map(({ x, y }) => [x, y]),
        },
      });
      canvas.appendChild(polyline);
    } else if (type === 'polygon') {
      const polygon = new Polygon({
        style: {
          ...brush,
          points: path.map(({ x, y }) => [x, y]),
        },
      });
      canvas.appendChild(polygon);
    } else if (type === 'rect') {
      const rect = new Rect({
        style: {
          ...brush,
          x: path[0].x,
          y: path[0].y,
          width: path[2].x - path[0].x,
          height: path[2].y - path[0].y,
        },
      });
      canvas.appendChild(rect);
    } else if (type === 'circle') {
      const circle = new Circle({
        style: {
          ...brush,
          cx: path[0].x,
          cy: path[0].y,
          r: 20,
        },
      });
      canvas.appendChild(circle);
    }
  });

  annotationPlugin.addEventListener('draw:cancel', (toolstate) => {
    console.log('draw:cancel', toolstate);
  });
}

annotation.initRenderer = (renderer) => {
  renderer.registerPlugin(
    new PluginDragndrop({
      dragstartDistanceThreshold: 10,
      dragstartTimeThreshold: 100,
    }),
  );

  annotationPlugin = new PluginAnnotation({
    enableDeleteTargetWithShortcuts: true,
    enableAutoSwitchDrawingMode: true,
    selectableStyle: {
      selectionFill: 'rgba(24,144,255,0.15)',
      selectionStroke: '#1890FF',
      selectionStrokeWidth: 2.5,
      anchorFill: '#1890FF',
      anchorStroke: '#1890FF',
    },
  });

  renderer.registerPlugin(annotationPlugin);
};
