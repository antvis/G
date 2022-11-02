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

    await canvas.ready;
    canvas.appendChild(circle);

    canvas.addEventListener('pointerdown', (e) => {
      console.log('pointerdown');
    });
    canvas.addEventListener('pointerup', (e) => {
      console.log('pointerup');
    });
    canvas.addEventListener('pointermove', (e) => {
      console.log('pointermove');
    });
    canvas.addEventListener('pointerover', (e) => {
      console.log('pointerover');
    });
    canvas.addEventListener('dragstart', (e) => {
      console.log('dragstart');
    });
    canvas.addEventListener('drag', (e) => {
      console.log('drag');
    });
    canvas.addEventListener('dragend', (e) => {
      console.log('dragend');
    });

    canvas.addEventListener('click', (e) => {
      console.log('click');
    });
  });
});
