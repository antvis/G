import { Canvas, Circle } from '@antv/g';
import { Renderer as CanvasRenderer } from '@antv/g-canvas';
import chai, { expect } from 'chai';
// @ts-ignore
import chaiAlmost from 'chai-almost';
// @ts-ignore
import sinon from 'sinon';
// @ts-ignore
import sinonChai from 'sinon-chai';
import { sleep } from './utils';

chai.use(chaiAlmost(0.0001));
chai.use(sinonChai);

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

describe('Canvas', () => {
  afterEach(() => {
    canvas.removeChildren();
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
    expect(canvas.document.elementFromPointSync(250, 250)).to.be.eqls(circle);
    let canvasCoord = canvas.viewport2Canvas({ x: 250, y: 250 });
    expect(canvasCoord.x).to.be.eqls(250);
    expect(canvasCoord.y).to.be.eqls(250);
    canvasCoord = canvas.viewport2Canvas({ x: 0, y: 0 });
    expect(canvasCoord.x).to.be.almost.eqls(0);
    expect(canvasCoord.y).to.be.almost.eqls(0);

    camera.rotate(0, 0, 90);
    canvasCoord = canvas.viewport2Canvas({ x: 250, y: 250 });
    expect(canvasCoord.x).to.be.eqls(250);
    expect(canvasCoord.y).to.be.eqls(250);
    canvasCoord = canvas.viewport2Canvas({ x: 0, y: 0 });
    expect(canvasCoord.x).to.be.almost.eqls(500);
    expect(canvasCoord.y).to.be.almost.eqls(0);
    camera.rotate(0, 0, -90);

    camera.setZoom(2);
    await sleep(100);
    expect(canvas.document.elementFromPointSync(250, 250)).to.be.eqls(circle);
    expect(camera.getZoom()).to.be.eqls(2);
    canvasCoord = canvas.viewport2Canvas({ x: 250, y: 250 });
    expect(canvasCoord.x).to.be.eqls(250);
    expect(canvasCoord.y).to.be.eqls(250);
    canvasCoord = canvas.viewport2Canvas({ x: 0, y: 0 });
    expect(canvasCoord.x).to.be.almost.eqls(125);
    expect(canvasCoord.y).to.be.almost.eqls(125);

    camera.setZoomByViewportPoint(2, [250, 250]);
    expect(canvas.document.elementFromPointSync(250, 250)).to.be.eqls(circle);
    expect(camera.getZoom()).to.be.eqls(2);
    canvasCoord = canvas.viewport2Canvas({ x: 250, y: 250 });
    expect(canvasCoord.x).to.be.eqls(250);
    expect(canvasCoord.y).to.be.eqls(250);
    canvasCoord = canvas.viewport2Canvas({ x: 0, y: 0 });
    expect(canvasCoord.x).to.be.almost.eqls(125);
    expect(canvasCoord.y).to.be.almost.eqls(125);
  });
});
