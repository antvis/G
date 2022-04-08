import { Canvas, Circle } from '../src';
import { Renderer } from '@antv/g-json';
import { createContext } from './util';

describe('json render', () => {
  it('JSONRender', async () => {
    const context = createContext();

    // 创建渲染器
    const renderer = new Renderer();
    const canvas = new Canvas({
      context,
      devicePixelRatio: 2,
      renderer,
    });

    // create a circle
    const circle = new Circle({
      style: {
        x: 20,
        y: 20,
        r: 10,
        fill: '#1890FF',
        stroke: '#F04864',
        lineWidth: 2,
        shadowColor: 'black',
        shadowBlur: 20,
      },
    });

    canvas.appendChild(circle);

    // const text = canvas.getContextService().getContext().getJSON();
    // const root = toJSON(canvas.getRoot());
    // console.log(root);
    // context.toJSON();
  });
});
