import { Canvas, Circle } from '../../packages/g/src';
import { Renderer as CanvasRenderer } from '../../packages/g-svg/src';
import { sleep } from './utils';

const $container = document.createElement('div');
$container.id = 'container';
document.body.prepend($container);

const renderer = new CanvasRenderer();

// create a canvas
const canvas = new Canvas({
  container: 'container',
  width: 500,
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

  it("should acount for camera's zoom when converting", async () => {
    const camera = canvas.getCamera();

    const circle = new Circle({
      style: {
        cx: 250,
        cy: 250,
        r: 100,
        fill: 'red',
      },
    });

    await canvas.ready;
    canvas.appendChild(circle);

    await sleep(100);
    expect(canvas.document.elementFromPointSync(250, 250)).toBe(circle);
    let canvasCoord = canvas.viewport2Canvas({ x: 250, y: 250 });
    expect(canvasCoord.x).toBe(250);
    expect(canvasCoord.y).toBe(250);
    canvasCoord = canvas.viewport2Canvas({ x: 0, y: 0 });
    expect(canvasCoord.x).toBeCloseTo(0);
    expect(canvasCoord.y).toBeCloseTo(0);

    camera.rotate(0, 0, 90);
    canvasCoord = canvas.viewport2Canvas({ x: 250, y: 250 });
    expect(canvasCoord.x).toBe(250);
    expect(canvasCoord.y).toBe(250);
    canvasCoord = canvas.viewport2Canvas({ x: 0, y: 0 });
    expect(canvasCoord.x).toBeCloseTo(500);
    expect(canvasCoord.y).toBeCloseTo(0);
    camera.rotate(0, 0, -90);

    camera.setZoom(2);
    await sleep(100);
    expect(canvas.document.elementFromPointSync(250, 250)).toBe(circle);
    expect(camera.getZoom()).toBe(2);
    canvasCoord = canvas.viewport2Canvas({ x: 250, y: 250 });
    expect(canvasCoord.x).toBe(250);
    expect(canvasCoord.y).toBe(250);
    canvasCoord = canvas.viewport2Canvas({ x: 0, y: 0 });
    expect(canvasCoord.x).toBeCloseTo(125);
    expect(canvasCoord.y).toBeCloseTo(125);

    camera.setZoomByViewportPoint(2, [250, 250]);
    expect(canvas.document.elementFromPointSync(250, 250)).toBe(circle);
    expect(camera.getZoom()).toBe(2);
    canvasCoord = canvas.viewport2Canvas({ x: 250, y: 250 });
    expect(canvasCoord.x).toBe(250);
    expect(canvasCoord.y).toBe(250);
    canvasCoord = canvas.viewport2Canvas({ x: 0, y: 0 });
    expect(canvasCoord.x).toBeCloseTo(125);
    expect(canvasCoord.y).toBeCloseTo(125);
  });
});
