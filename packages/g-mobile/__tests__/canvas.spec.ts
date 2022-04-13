import { Canvas, Renderer, Circle } from '../src';
import { createContext } from './util';

describe('canvas', () => {
  it('基础图形', async () => {
    const context = createContext();

    // 创建渲染器
    const renderer = new Renderer();
    const canvas = new Canvas({
      context,
      devicePixelRatio: 4,
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

    circle.addEventListener('touchstart', (e) => {
      console.log('touchstart');
    });
    circle.addEventListener('touchend', (e) => {
      console.log('touchend');
    });
    circle.addEventListener('touchmove', (e) => {
      console.log('touchmove');
    });

    circle.addEventListener('click', (e) => {
      console.log('click');
    });
    circle.addEventListener('mouseover', (e) => {
      console.log('mouseover');
    });
  });
});
