import { Canvas } from '../../packages/g/src';
import { Renderer as CanvasRenderer } from '../../packages/g-svg/src';

const $container = document.createElement('div');
$container.id = 'container';
document.body.prepend($container);

const renderer = new CanvasRenderer();

// create a canvas
const canvas1 = new Canvas({
  container: 'container',
  width: 600,
  height: 500,
  renderer,
  supportsMutipleCanvasesInOneContainer: true,
});
const canvas2 = new Canvas({
  container: 'container',
  width: 600,
  height: 500,
  renderer,
  supportsMutipleCanvasesInOneContainer: true,
});

describe('Canvas', () => {
  afterEach(() => {
    canvas1.destroyChildren();
    canvas2.destroyChildren();
  });

  afterAll(() => {
    canvas1.destroy();
    canvas2.destroy();
  });

  it('should contain multiple canvases in the same container', async () => {
    await canvas1.ready;
    await canvas2.ready;

    expect($container.childNodes.length).toBe(2);
  });
});
