import { Canvas, Circle } from '@antv/g';
import { Renderer as CanvasRenderer } from '@antv/g-mobile-canvas';
import { createMobileCanvasElement } from '@antv/g-mobile-canvas-element';
import { createContext } from './util';

describe('canvas', () => {
  it('基础图形 canvas render', async () => {
    const context = createContext();
    const canvasElement = createMobileCanvasElement(context);

    // 创建渲染器
    const renderer = new CanvasRenderer();
    const canvas = new Canvas({
      canvas: canvasElement,
      devicePixelRatio: window.devicePixelRatio,
      renderer,
    });

    // create a circle
    const circle = new Circle({
      style: {
        cx: 100,
        cy: 100,
        r: 10,
        fill: '#1890FF',
        stroke: '#F04864',
        lineWidth: 2,
        shadowColor: 'black',
        shadowBlur: 20,
      },
    });

    canvas.appendChild(circle);

    circle.addEventListener('pointerdown', (e) => {
      console.log('pointerdown');
    });
    circle.addEventListener('pointerup', (e) => {
      console.log('pointerup');
    });
    circle.addEventListener('pointermove', (e) => {
      console.log('pointermove');
    });
    circle.addEventListener('pointerover', (e) => {
      console.log('pointerover');
    });

    circle.addEventListener('click', (e) => {
      console.log('click');
    });
  });
});
