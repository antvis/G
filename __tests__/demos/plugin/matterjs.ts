import { Circle, Image, Line, Polygon, Rect } from '@antv/g';
import { Plugin as PluginMatterjs } from '@antv/g-plugin-matterjs';

export async function matterjs(context) {
  const { canvas } = context;

  await canvas.ready;

  const ground1 = new Line({
    style: {
      x1: 0,
      y1: 200,
      x2: 50,
      y2: 400,
      stroke: '#1890FF',
      lineWidth: 2,
      // @ts-ignore
      width: 1000,
      height: 10,
      rigid: 'static', // static ground
    },
  });
  canvas.appendChild(ground1);
  const ground2 = new Line({
    style: {
      x1: 50,
      y1: 400,
      x2: 400,
      y2: 400,
      stroke: '#1890FF',
      lineWidth: 2,
      // @ts-ignore
      width: 1000,
      height: 10,
      rigid: 'static', // static ground
    },
  });
  canvas.appendChild(ground2);
  const ground3 = new Line({
    style: {
      x1: 400,
      y1: 400,
      x2: 400,
      y2: 200,
      stroke: '#1890FF',
      lineWidth: 2,
      // @ts-ignore
      width: 1000,
      height: 10,
      rigid: 'static', // static ground
    },
  });
  canvas.appendChild(ground3);

  for (let i = 0; i < 10; i++) {
    const rect = new Rect({
      style: {
        fill: '#C6E5FF',
        stroke: '#1890FF',
        lineWidth: 2,
        width: 50,
        height: 50,
        // @ts-ignore
        rigid: 'dynamic',
        density: 0.1,
        x: Math.random() * 100 + 100,
        y: Math.random() * 100,
      },
    });
    canvas.appendChild(rect);
  }

  const circle = new Circle({
    style: {
      fill: '#1890FF',
      r: 100,
      // @ts-ignore
      rigid: 'dynamic',
      density: 0.1,
      restitution: 0.5,
      cx: 300,
      cy: 0,
      transform: 'scale(0.5)',
    },
  });
  canvas.appendChild(circle);
  // const text = new Text({
  //   id: 'text',
  //   style: {
  //     fontFamily: 'PingFang SC',
  //     text: 'Circle',
  //     fontSize: 16,
  //     fill: '#fFF',
  //     textAlign: 'center',
  //     textBaseline: 'middle',
  //   },
  // });
  // circle.appendChild(text);

  const polygon = new Polygon({
    style: {
      points: [
        [20, 10],
        [40, 10],
        [40 + 20 * Math.sin(Math.PI / 6), 10 + 20 * Math.cos(Math.PI / 6)],
        [40, 10 + 20 * Math.cos(Math.PI / 6) * 2],
        [20, 10 + 20 * Math.cos(Math.PI / 6) * 2],
        [20 - 20 * Math.sin(Math.PI / 6), 10 + 20 * Math.cos(Math.PI / 6)],
        // [10, 10],
        // [30, 10],
        // [30, 30],
        // [10, 30],
      ],
      fill: '#C6E5FF',
      stroke: '#1890FF',
      lineWidth: 2,
      // @ts-ignore
      rigid: 'dynamic',
      density: 10,
    },
  });
  polygon.setPosition(100, 100);
  canvas.appendChild(polygon);

  const image = new Image({
    style: {
      x: 200,
      y: 100,
      width: 80,
      height: 80,
      src: 'https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*N4ZMS7gHsUIAAAAAAAAAAABkARQnAQ',
      // @ts-ignore
      rigid: 'dynamic',
      density: 10,
    },
  });
  canvas.appendChild(image);
}

matterjs.initRenderer = (renderer, type) => {
  renderer.registerPlugin(
    new PluginMatterjs({
      debug: true, // 开启 debug 模式，将物理引擎世界也渲染出来
      debugContainer: document.getElementById('app')!,
      debugCanvasWidth: 640,
      debugCanvasHeight: 640,
    }),
  );
};
