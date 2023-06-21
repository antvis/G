import Gesture from '../../../packages/g-gesture/src';
import { createMobileCanvasElement } from '../../../packages/g-mobile-canvas-element/src';
import { Renderer } from '../../../packages/g-mobile-canvas/src';
import { Canvas, Circle } from '../../../packages/g/src';
import { createContext, delay, gestureSimulator } from './util';

const context = createContext();
const canvasElement = createMobileCanvasElement(context);
// 创建渲染器
const renderer = new Renderer();
const canvas = new Canvas({
  canvas: canvasElement,
  renderer,
  supportsTouchEvents: true,
  width: 300,
  height: 225,
});

// create a circle
const circle = new Circle({
  style: {
    cx: 100,
    cy: 100,
    r: 100,
    fill: '#1890FF',
    stroke: '#F04864',
    lineWidth: 2,
    shadowColor: 'black',
    shadowBlur: 20,
  },
});

describe('gesture', () => {
  beforeAll(async () => {
    await canvas.ready;
    canvas.appendChild(circle);
  });

  afterAll(() => {
    canvas.destroy();
  });

  describe('基础事件', () => {
    it('基础事件', async () => {
      const pointerdownCallback = jest.fn();
      const pointermoveCallback = jest.fn();
      const pointerupCallback = jest.fn();

      circle.addEventListener('pointerdown', pointerdownCallback);
      circle.addEventListener('pointermove', pointermoveCallback);
      circle.addEventListener('pointerup', pointerupCallback);

      // 考虑 WebGL / WebGPU 实现，拾取是异步的
      await delay(100);
      gestureSimulator(context.canvas, 'touchstart', {
        x: 60,
        y: 60,
        identifier: 0,
      });
      gestureSimulator(context.canvas, 'touchmove', {
        x: 60,
        y: 80,
        identifier: 0,
      });
      gestureSimulator(context.canvas, 'touchend', {
        x: 60,
        y: 80,
        identifier: 0,
      });
      await delay(100);

      expect(pointerdownCallback.mock.calls.length).toBe(1);
      expect(pointermoveCallback.mock.calls.length).toBe(1);
      expect(pointerupCallback.mock.calls.length).toBe(1);
    });
  });

  describe('pan 平移', () => {
    it('pan 平移', async () => {
      const panstartCallback = jest.fn();
      const panCallback = jest.fn();
      const panendCallback = jest.fn();

      circle.removeAllEventListeners();

      const gesture = new Gesture(circle);

      gesture.on('panstart', panstartCallback);
      gesture.on('pan', panCallback);
      gesture.on('panend', panendCallback);

      await delay(100);
      gestureSimulator(context.canvas, 'touchstart', {
        x: 60,
        y: 60,
        identifier: 0,
      });
      gestureSimulator(context.canvas, 'touchmove', {
        x: 62,
        y: 80,
        identifier: 0,
      });
      gestureSimulator(context.canvas, 'touchend', {
        x: 62,
        y: 80,
        identifier: 0,
      });
      await delay(100);
      expect(panstartCallback.mock.calls.length).toBe(1);
      expect(panstartCallback.mock.calls[0][0].direction).toBe('down');
      expect(panstartCallback.mock.calls[0][0].deltaX).toBeCloseTo(2);
      expect(panstartCallback.mock.calls[0][0].deltaY).toBeCloseTo(20);

      expect(panCallback.mock.calls.length).toBe(1);
      expect(panendCallback.mock.calls.length).toBe(1);
    });
  });

  describe('press 按压', () => {
    it('press 按压', async () => {
      const pressstartCallback = jest.fn();
      const pressCallback = jest.fn();
      const pressendCallback = jest.fn();

      circle.removeAllEventListeners();

      const gesture = new Gesture(circle);

      gesture.on('pressstart', pressstartCallback);
      gesture.on('press', pressCallback);
      gesture.on('pressend', pressendCallback);

      await delay(100);
      gestureSimulator(context.canvas, 'touchstart', {
        x: 60,
        y: 60,
        identifier: 0,
      });
      gestureSimulator(context.canvas, 'touchmove', {
        x: 62,
        y: 80,
        identifier: 0,
      });
      gestureSimulator(context.canvas, 'touchend', {
        x: 62,
        y: 80,
        identifier: 0,
      });
      await delay(100);
      expect(pressstartCallback.mock.calls.length).toBe(1);
      expect(pressstartCallback.mock.calls[0][0].direction).toBe('down');
      expect(pressstartCallback.mock.calls[0][0].deltaX).toBeCloseTo(2);
      expect(pressstartCallback.mock.calls[0][0].deltaY).toBeCloseTo(20);

      expect(pressCallback.mock.calls.length).toBe(1);
      expect(pressendCallback.mock.calls.length).toBe(1);
    });

    it('长按触发 pressstart', async () => {
      const pressstartCallback = jest.fn();
      const pressCallback = jest.fn();
      const pressendCallback = jest.fn();

      circle.removeAllEventListeners();

      const gesture = new Gesture(circle);

      gesture.on('pressstart', pressstartCallback);
      gesture.on('press', pressCallback);
      gesture.on('pressend', pressendCallback);

      await delay(100);
      gestureSimulator(context.canvas, 'touchstart', {
        x: 60,
        y: 60,
        identifier: 0,
      });
      await delay(300);
      expect(pressstartCallback.mock.calls.length).toBe(1);
      expect(pressstartCallback.mock.calls[0][0].direction).toBe('none');
      expect(pressCallback.mock.calls.length).toBe(1);

      gestureSimulator(context.canvas, 'touchmove', {
        x: 62,
        y: 80,
        identifier: 0,
      });
      gestureSimulator(context.canvas, 'touchend', {
        x: 62,
        y: 80,
        identifier: 0,
      });
      await delay(100);
      expect(pressCallback.mock.calls.length).toBe(2);
      expect(pressendCallback.mock.calls.length).toBe(1);
    });
  });

  describe('pan & press 同时监听', () => {
    it('pan & press 同时监听', async () => {
      const panstartCallback = jest.fn();
      const panCallback = jest.fn();
      const panendCallback = jest.fn();
      const pressstartCallback = jest.fn();
      const pressCallback = jest.fn();
      const pressendCallback = jest.fn();

      circle.removeAllEventListeners();

      const gesture = new Gesture(circle);
      gesture.on('panstart', panstartCallback);
      gesture.on('pan', panCallback);
      gesture.on('panend', panendCallback);
      gesture.on('pressstart', pressstartCallback);
      gesture.on('press', pressCallback);
      gesture.on('pressend', pressendCallback);

      await delay(100);
      gestureSimulator(context.canvas, 'touchstart', {
        x: 60,
        y: 60,
        identifier: 0,
      });
      gestureSimulator(context.canvas, 'touchmove', {
        x: 62,
        y: 80,
        identifier: 0,
      });
      gestureSimulator(context.canvas, 'touchend', {
        x: 62,
        y: 80,
        identifier: 0,
      });
      await delay(100);

      // 触发pan
      expect(panstartCallback.mock.calls.length).toBe(1);
      expect(panCallback.mock.calls.length).toBe(1);
      expect(panendCallback.mock.calls.length).toBe(1);
      // 不触发 press
      expect(pressstartCallback.mock.calls.length).toBe(0);
      expect(pressCallback.mock.calls.length).toBe(0);
      expect(pressendCallback.mock.calls.length).toBe(0);

      await delay(300);
      gestureSimulator(context.canvas, 'touchstart', {
        x: 60,
        y: 60,
        identifier: 0,
      });
      await delay(400);
      gestureSimulator(context.canvas, 'touchmove', {
        x: 62,
        y: 62,
        identifier: 0,
      });
      gestureSimulator(context.canvas, 'touchend', {
        x: 62,
        y: 80,
        identifier: 0,
      });
      await delay(100);
      // 不触发pan
      expect(panstartCallback.mock.calls.length).toBe(1);
      expect(panCallback.mock.calls.length).toBe(1);
      expect(panendCallback.mock.calls.length).toBe(1);

      // 触发 press
      expect(pressstartCallback.mock.calls.length).toBe(1);
      // 长按延迟也会触发 press， 所以这里有 2 次
      expect(pressCallback.mock.calls.length).toBe(2);
      expect(pressendCallback.mock.calls.length).toBe(1);
    });
  });

  describe('swipe 快扫', () => {
    it('swipe 快扫', async () => {
      const swipeCallback = jest.fn();

      circle.removeAllEventListeners();

      const gesture = new Gesture(circle);

      gesture.on('swipe', swipeCallback);

      await delay(100);
      gestureSimulator(context.canvas, 'touchstart', {
        x: 60,
        y: 60,
        identifier: 0,
      });
      gestureSimulator(context.canvas, 'touchmove', {
        x: 80,
        y: 60,
        identifier: 0,
      });
      gestureSimulator(context.canvas, 'touchend', {
        x: 80,
        y: 80,
        identifier: 0,
      });
      await delay(100);
      expect(swipeCallback.mock.calls.length).toBe(1);
      expect(swipeCallback.mock.calls[0][0].direction).toBe('right');
      expect(swipeCallback.mock.calls[0][0].velocity).toBeTruthy();
    });
  });

  describe('pinch 多指', () => {
    it('pinch 多指', async () => {
      const pinchstartCallback = jest.fn();
      const pinchCallback = jest.fn();
      const pinchendCallback = jest.fn();
      const panstartCallback = jest.fn();
      const panCallback = jest.fn();
      const panendCallback = jest.fn();

      circle.removeAllEventListeners();

      const gesture = new Gesture(circle);

      gesture.on('pinchstart', pinchstartCallback);
      gesture.on('pinch', pinchCallback);
      gesture.on('pinchend', pinchendCallback);

      gesture.on('panstart', panstartCallback);
      gesture.on('pan', panCallback);
      gesture.on('panend', panendCallback);

      await delay(100);
      gestureSimulator(context.canvas, 'touchstart', {
        x: 60,
        y: 60,
        identifier: 0,
      });
      gestureSimulator(context.canvas, 'touchstart', {
        x: 80,
        y: 60,
        identifier: 1,
      });

      await delay(20);
      gestureSimulator(context.canvas, 'touchmove', {
        x: 50,
        y: 60,
        identifier: 0,
      });
      gestureSimulator(context.canvas, 'touchmove', {
        x: 90,
        y: 60,
        identifier: 1,
      });
      await delay(100);

      expect(pinchstartCallback.mock.calls.length).toBe(1);
      expect(pinchCallback.mock.calls.length).toBe(1);
      expect(pinchCallback.mock.calls[0][0].zoom > 1).toBe(true);

      gestureSimulator(context.canvas, 'touchend', {
        x: 90,
        y: 60,
        identifier: 1,
      });
      await delay(100);
      expect(pinchendCallback.mock.calls.length).toBe(1);

      // 另外一指继续滑动
      gestureSimulator(context.canvas, 'touchmove', {
        x: 52,
        y: 80,
        identifier: 0,
      });
      await delay(100);

      expect(panstartCallback.mock.calls.length).toBe(1);
      expect(panstartCallback.mock.calls[0][0].direction).toBe('down');
      expect(panstartCallback.mock.calls[0][0].deltaX).toBeCloseTo(2);
      expect(panstartCallback.mock.calls[0][0].deltaY).toBeCloseTo(20);
    });
    it('pinch 初始start未触发', async () => {
      const pinchstartCallback = jest.fn();
      const pinchCallback = jest.fn();
      const pinchendCallback = jest.fn();

      circle.removeAllEventListeners();

      const gesture = new Gesture(circle);

      gesture.on('pinchstart', pinchstartCallback);
      gesture.on('pinch', pinchCallback);
      gesture.on('pinchend', pinchendCallback);

      await delay(100);
      gestureSimulator(context.canvas, 'touchstart', {
        x: 60,
        y: 60,
        identifier: 0,
      });

      await delay(20);
      gestureSimulator(context.canvas, 'touchmove', {
        x: 50,
        y: 60,
        identifier: 0,
      });
      gestureSimulator(context.canvas, 'touchmove', {
        x: 90,
        y: 60,
        identifier: 1,
      });
      await delay(100);

      expect(pinchstartCallback.mock.calls.length).toBe(1);
      expect(pinchCallback.mock.calls.length).toBe(1);
      expect(pinchCallback.mock.calls[0][0].zoom > 1).toBe(true);
      expect(pinchCallback.mock.calls[0][0].type).toBe('pointermove');
    });
  });

  describe('事件节流', () => {
    it('事件节流', async () => {
      const panstartCallback = jest.fn();
      const panCallback = jest.fn();
      const panendCallback = jest.fn();

      circle.removeAllEventListeners();

      const gesture = new Gesture(circle);

      gesture.on('panstart', panstartCallback);
      gesture.on('pan', panCallback);
      gesture.on('panend', panendCallback);

      await delay(100);
      gestureSimulator(context.canvas, 'touchstart', {
        x: 60,
        y: 60,
        identifier: 0,
      });
      gestureSimulator(context.canvas, 'touchmove', {
        x: 61,
        y: 80,
        identifier: 0,
      });
      gestureSimulator(context.canvas, 'touchmove', {
        x: 62,
        y: 80,
        identifier: 0,
      });
      gestureSimulator(context.canvas, 'touchmove', {
        x: 63,
        y: 80,
        identifier: 0,
      });
      gestureSimulator(context.canvas, 'touchmove', {
        x: 64,
        y: 80,
        identifier: 0,
      });
      gestureSimulator(context.canvas, 'touchmove', {
        x: 65,
        y: 80,
        identifier: 0,
      });
      gestureSimulator(context.canvas, 'touchmove', {
        x: 66,
        y: 80,
        identifier: 0,
      });
      gestureSimulator(context.canvas, 'touchmove', {
        x: 67,
        y: 80,
        identifier: 0,
      });
      gestureSimulator(context.canvas, 'touchmove', {
        x: 68,
        y: 81,
        identifier: 0,
      });
      gestureSimulator(context.canvas, 'touchend', {
        x: 68,
        y: 81,
        identifier: 0,
      });
      await delay(100);
      expect(panstartCallback.mock.calls.length).toBe(1);
      expect(panCallback.mock.calls.length).toBe(1);
      expect(panCallback.mock.calls[0][0].x).toBe(68);
      expect(panCallback.mock.calls[0][0].y).toBe(81);
      expect(panendCallback.mock.calls.length).toBe(1);
    });
  });
});
