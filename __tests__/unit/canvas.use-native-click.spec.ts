import { Canvas, Circle, runtime } from '@antv/g';
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
  width: 600,
  height: 500,
  renderer,
  useNativeClickEvent: true,
});

describe('Canvas', () => {
  afterEach(() => {
    canvas.destroyChildren();
  });

  afterAll(() => {
    canvas.destroy();
  });

  it('should generate correct composed path', async (done) => {
    let point = canvas.getClientByPoint(0, 0);
    expect(point.x).eqls(8);
    expect(point.y).eqls(8);

    point = canvas.getPointByClient(8, 8);
    expect(point.x).eqls(0);
    expect(point.y).eqls(0);

    const circle = new Circle({
      style: {
        cx: 100,
        cy: 100,
        r: 100,
        fill: 'red',
      },
    });

    canvas.appendChild(circle);

    const handleClick = (e) => {
      // target
      expect(e.target).to.be.eqls(circle);
      // currentTarget
      expect(e.currentTarget).to.be.eqls(canvas);

      // composed path
      const path = e.composedPath();
      expect(path.length).to.be.eqls(4);
      expect(path[0]).to.be.eqls(circle);
      expect(path[1]).to.be.eqls(canvas.document.documentElement);
      expect(path[2]).to.be.eqls(canvas.document);
      expect(path[3]).to.be.eqls(canvas);

      // pointer type
      expect(e.pointerType).to.be.eqls('mouse');

      // coordinates
      expect(e.clientX).to.be.eqls(100);
      expect(e.clientY).to.be.eqls(100);
      expect(e.screenX).to.be.eqls(200);
      expect(e.screenY).to.be.eqls(200);

      done();
    };

    canvas.addEventListener('click', handleClick, { once: true });

    await sleep(300);

    const $canvas = canvas.getContextService().getDomElement();

    // Create a mouse event(click).
    const event = document.createEvent('MouseEvents');
    event.initMouseEvent(
      'click',
      true,
      true,
      document.defaultView,
      0,
      200,
      200,
      100,
      100,
      false /* ctrlKey */,
      false /* altKey */,
      false /* shiftKey */,
      false /* metaKey */,
      null /* button */,
      null /* relatedTarget */,
    );

    $canvas.dispatchEvent(
      // @ts-ignore
      event,
    );
  });
});
