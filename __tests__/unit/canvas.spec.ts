import { Renderer as SVGRenderer } from '../../packages/g-svg/src';
import type { FederatedPointerEvent } from '../../packages/g/src';
import { Canvas, CanvasEvent, Circle, Group } from '../../packages/g/src';
import { sleep } from './utils';

const $container = document.createElement('div');
$container.id = 'container';
document.body.prepend($container);

const renderer = new SVGRenderer();

// create a canvas
const canvas = new Canvas({
  container: 'container',
  width: 600,
  height: 500,
  renderer,
});

describe.skip('Canvas', () => {
  afterEach(() => {
    canvas.destroyChildren();
  });

  afterAll(() => {
    canvas.destroy();
  });

  it('should not trigger CanvasEvent when switching renderer', () => {
    const readyCallback = jest.fn();
    const beforeDestroyCallback = jest.fn();
    canvas.addEventListener(CanvasEvent.READY, readyCallback);
    canvas.addEventListener(CanvasEvent.BEFORE_DESTROY, beforeDestroyCallback);

    canvas.setRenderer(new SVGRenderer());

    expect(readyCallback).toBeCalledTimes(0);
    expect(beforeDestroyCallback).toBeCalledTimes(0);
  });

  it('should generate correct composed path', (done) => {
    let point = canvas.getClientByPoint(0, 0);
    expect(point.x).toBe(8);
    expect(point.y).toBe(8);

    point = canvas.getPointByClient(8, 8);
    expect(point.x).toBe(0);
    expect(point.y).toBe(0);

    const circle = new Circle({
      style: {
        cx: 100,
        cy: 100,
        r: 100,
        fill: 'red',
      },
    });

    canvas.appendChild(circle);

    setTimeout(() => {
      const $canvas = canvas.getContextService().getDomElement()!;

      $canvas.dispatchEvent(
        new PointerEvent('pointerdown', {
          pointerType: 'mouse',
          clientX: 100,
          clientY: 100,
          screenX: 200,
          screenY: 200,
        }),
      );
    }, 300);

    const handlePointerDown = (e) => {
      // target
      expect(e.target).toBe(circle);
      // currentTarget
      expect(e.currentTarget).toBe(canvas);

      // composed path
      const path = e.composedPath();
      expect(path.length).toBe(4);
      expect(path[0]).toBe(circle);
      expect(path[1]).toBe(canvas.document.documentElement);
      expect(path[2]).toBe(canvas.document);
      expect(path[3]).toBe(canvas);

      // pointer type
      expect(e.pointerType).toBe('mouse');

      // coordinates
      expect(e.clientX).toBe(100);
      expect(e.clientY).toBe(100);
      expect(e.screenX).toBe(200);
      expect(e.screenY).toBe(200);

      done();
    };

    canvas.addEventListener('pointerdown', handlePointerDown, { once: true });
  });

  it('should return Document & Canvas when hit nothing', async () => {
    const circle = new Circle({
      style: {
        cx: 100,
        cy: 100,
        r: 100,
        fill: 'red',
      },
    });

    await canvas.ready;
    canvas.appendChild(circle);

    await new Promise((resovle) => {
      canvas.addEventListener(
        'pointerdown',
        (e) => {
          // target
          expect(e.target).toBe(canvas.document);
          // currentTarget
          expect(e.currentTarget).toBe(canvas);

          // composed path
          const path = e.composedPath();

          expect(path.length).toBe(2);
          expect(path[0]).toBe(canvas.document);
          expect(path[1]).toBe(canvas);

          resovle(undefined);
        },
        { once: true },
      );
    });

    await sleep(100);

    const $canvas = canvas.getContextService().getDomElement()!;
    $canvas.dispatchEvent(
      new PointerEvent('pointerdown', {
        pointerType: 'mouse',
        clientX: 400,
        clientY: 400,
        screenX: 500,
        screenY: 500,
      }),
    );

    canvas.addEventListener(
      'pointermove',
      (e) => {
        // target
        expect(e.target).toBe(canvas.document);

        // composed path
        const path = e.composedPath();

        expect(path.length).toBe(2);
        expect(path[0]).toBe(canvas.document);
        expect(path[1]).toBe(canvas);
      },
      { once: true },
    );
    $canvas.dispatchEvent(
      new PointerEvent('pointermove', {
        pointerType: 'mouse',
        clientX: 2400,
        clientY: 2400,
        screenX: 2500,
        screenY: 2500,
      }),
    );

    await sleep(300);
  });

  it('should convert client & viewport coordinates correctly', async () => {
    const circle = new Circle({
      style: {
        cx: 100,
        cy: 100,
        r: 100,
        fill: 'red',
      },
    });

    await canvas.ready;
    canvas.appendChild(circle);

    const $canvas = canvas.getContextService().getDomElement()!;
    const { top, left } = (
      $canvas as HTMLCanvasElement
    ).getBoundingClientRect();

    await new Promise((resovle) => {
      canvas.addEventListener(
        'pointerdown',
        (e: FederatedPointerEvent) => {
          // currentTarget
          expect(e.currentTarget).toBe(canvas);

          // coordinates
          expect(e.clientX).toBe(100);
          expect(e.clientY).toBe(100);
          expect(e.screenX).toBe(200);
          expect(e.screenY).toBe(200);
          expect(e.viewportX).toBeCloseTo(100 - left);
          expect(e.viewportY).toBeCloseTo(100 - top);
          expect(e.canvasX).toBeCloseTo(100 - left);
          expect(e.canvasY).toBeCloseTo(100 - top);
          expect(e.x).toBeCloseTo(100 - left);
          expect(e.y).toBeCloseTo(100 - top);

          const viewport = canvas.canvas2Viewport({
            x: e.canvasX,
            y: e.canvasY,
          });

          expect(viewport.x).toBeCloseTo(100 - left);
          expect(viewport.y).toBeCloseTo(100 - top);

          const { x: canvasX, y: canvasY } = canvas.viewport2Canvas({
            x: e.viewportX,
            y: e.viewportY,
          });
          expect(canvasX).toBeCloseTo(100 - left);
          expect(canvasY).toBeCloseTo(100 - top);

          resovle(undefined);
        },
        { once: true },
      );
    });

    await sleep(100);

    $canvas.dispatchEvent(
      new PointerEvent('pointerdown', {
        pointerType: 'mouse',
        clientX: 100,
        clientY: 100,
        screenX: 200,
        screenY: 200,
      }),
    );

    await sleep(300);
  });

  it("should account for camera's position when converting", async () => {
    const camera = canvas.getCamera();
    const $canvas = canvas.getContextService().getDomElement()!;
    const { top, left } = (
      $canvas as HTMLCanvasElement
    ).getBoundingClientRect();

    const circle = new Circle({
      style: {
        cx: 100,
        cy: 100,
        r: 100,
        fill: 'red',
      },
    });

    await canvas.ready;
    canvas.appendChild(circle);

    await new Promise((resovle) => {
      canvas.addEventListener(
        'pointerdown',
        (e: FederatedPointerEvent) => {
          // coordinates
          expect(e.clientX).toBe(100);
          expect(e.clientY).toBe(100);
          expect(e.screenX).toBe(200);
          expect(e.screenY).toBe(200);
          expect(e.viewportX).toBeCloseTo(100 - left);
          expect(e.viewportY).toBeCloseTo(100 - top);
          expect(e.canvasX).toBeCloseTo(200 - left); // canvasX changed
          expect(e.canvasY).toBeCloseTo(100 - top);

          const { x: viewportX, y: viewportY } = canvas.getPointByClient(
            100,
            100,
          );
          expect(viewportX).toBeCloseTo(100 - left);
          expect(viewportY).toBeCloseTo(100 - top);

          const { x: clientX, y: clientY } = canvas.getClientByPoint(
            viewportX,
            viewportY,
          );
          expect(clientX).toBeCloseTo(100);
          expect(clientY).toBeCloseTo(100);

          resovle(undefined);
        },
        { once: true },
      );
    });

    // move camera
    camera.pan(100, 0);

    await sleep(100);

    $canvas.dispatchEvent(
      new PointerEvent('pointerdown', {
        pointerType: 'mouse',
        clientX: 100,
        clientY: 100,
        screenX: 200,
        screenY: 200,
      }),
    );

    await sleep(300);
  });

  it('should query child with multiple classnames correctly', async () => {
    const group3 = new Group({
      id: 'id3',
      name: 'group3',
      className: 'c1 c2 c3',
    });

    await canvas.ready;
    canvas.appendChild(group3);

    expect(canvas.document.getElementById('id3')).toBe(group3);
    expect(canvas.document.getElementsByName('group3').length).toBe(1);
    expect(canvas.document.getElementsByClassName('c1').length).toBe(1);
    expect(canvas.document.getElementsByClassName('c2').length).toBe(1);
    expect(canvas.document.getElementsByClassName('c3').length).toBe(1);
  });
});
