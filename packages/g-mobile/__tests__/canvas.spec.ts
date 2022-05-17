import { Canvas, Circle } from '../src';
import { createContext } from './util';
import { Renderer as CanvasRenderer } from '@antv/g-mobile-canvas';
import { Renderer as WebglRenderer } from '@antv/g-mobile-webgl';
import { Renderer as SvgRenderer } from '@antv/g-mobile-svg';

describe('canvas', () => {
  it('基础图形 canvas render', async () => {
    const context = createContext();

    // 创建渲染器
    const renderer = new CanvasRenderer();
    const canvas = new Canvas({
      context,
      devicePixelRatio: 4,
      renderer,
    });

    // create a circle
    const circle = new Circle({
      style: {
        cx: 20,
        cy: 20,
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

  it('基础图形 webgl render', async () => {
    const context = createContext('webgl: ', {}, 'webgl');

    // 创建渲染器
    const renderer = new WebglRenderer();
    const canvas = new Canvas({
      context,
      devicePixelRatio: 1,
      renderer,
    });

    // create a circle
    const circle = new Circle({
      style: {
        cx: 20,
        cy: 20,
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

  it('基础图形 svg render', async () => {
    const div = document.createElement('div');
    document.body.appendChild(div);
    // 创建渲染器
    const renderer = new SvgRenderer();
    const canvas = new Canvas({
      container: div,
      width: 300,
      height: 200,
      devicePixelRatio: 2,
      renderer,
    });

    // create a circle
    const circle = new Circle({
      style: {
        cx: 20,
        cy: 20,
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
