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
  width: 600,
  height: 500,
  renderer,
  useNativeClickEvent: true,
});

describe.skip('Canvas', () => {
  afterEach(() => {
    canvas.destroyChildren();
  });

  afterAll(() => {
    canvas.destroy();
  });

  it('should generate correct composed path', async () => {
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

    await new Promise((resovle) => {
      const handleClick = (e) => {
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

        resovle(undefined);
      };

      canvas.addEventListener('click', handleClick, { once: true });
    });

    await sleep(300);

    const $canvas = canvas.getContextService().getDomElement()!;

    // Create a mouse event(click).
    const event = document.createEvent('MouseEvents');
    event.initMouseEvent(
      'click',
      true,
      true,
      // @ts-ignore
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

    $canvas.dispatchEvent(event);
  });
});
