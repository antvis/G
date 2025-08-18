import { Canvas, Image } from '../../../packages/g-lite/src';
import { Renderer as CanvasRenderer } from '../../../packages/g-canvas/src';
import { LoadImagePlugin } from '../../../packages/g-plugin-image-loader/src';

const $container = document.createElement('div');
$container.id = 'container';
document.body.prepend($container);

// create a renderer
const renderer = new CanvasRenderer();
// register renderer plugins
renderer.registerPlugin(new LoadImagePlugin());

// create a canvas
const canvas = new Canvas({
  container: 'container',
  width: 100,
  height: 100,
  renderer,
});

// a base64 encoded 1x1 transparent pixel
const TRANSPARENT_PNG =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

describe('Image', () => {
  afterEach(() => {
    canvas.destroyChildren();
  });

  afterAll(() => {
    canvas.destroy();
  });

  it('should render correctly on re-render with same src URL', (done) => {
    const image = new Image({
      style: {
        width: 10,
        height: 10,
      },
    });
    canvas.appendChild(image);

    // First load
    image.setAttribute('src', TRANSPARENT_PNG);

    canvas.ownerDocument.defaultView.requestAnimationFrame(() => {
      // Check if loaded correctly
      expect(image.getBBox().width).toBe(10);
      expect(image.getBBox().height).toBe(10);

      // Re-set the same src again, which should trigger the async cache path
      image.setAttribute('src', TRANSPARENT_PNG);

      canvas.ownerDocument.defaultView.requestAnimationFrame(() => {
        // Check if it's still rendered correctly after re-setting src
        expect(image.getBBox().width).toBe(10);
        expect(image.getBBox().height).toBe(10);
        done();
      });
    });
  });

  it('should render correctly after being removed and re-added to canvas', (done) => {
    const image = new Image({
      style: {
        width: 10,
        height: 10,
        src: TRANSPARENT_PNG,
      },
    });

    canvas.appendChild(image);

    canvas.ownerDocument.defaultView.requestAnimationFrame(() => {
      expect(image.getBBox().width).toBe(10);

      canvas.removeChild(image);
      canvas.appendChild(image); // Re-add

      // After re-adding, the MOUNTED event will fire, calling getImageSync.
      // Thanks to our new fix, the callback will be async.
      expect(image.parentNode).toBe(canvas.document.documentElement);

      canvas.ownerDocument.defaultView.requestAnimationFrame(() => {
        // Should still be rendered correctly.
        expect(image.getBBox().width).toBe(10);
        done();
      });
    });
  });

  it('should handle shared src correctly between multiple image objects', (done) => {
    const image1 = new Image({
      style: { src: TRANSPARENT_PNG, width: 10, height: 10 },
    });
    const image2 = new Image({
      style: { src: TRANSPARENT_PNG, width: 20, height: 20 },
    });

    canvas.appendChild(image1);
    canvas.appendChild(image2);

    // Wait for both to be processed
    canvas.ownerDocument.defaultView.requestAnimationFrame(() => {
      expect(image1.getBBox().width).toBe(10);
      expect(image2.getBBox().width).toBe(20);

      // Now remove image1, which should decrement the ref count but not evict the image
      canvas.removeChild(image1);

      // Wait another frame
      canvas.ownerDocument.defaultView.requestAnimationFrame(() => {
        // image2 should still be rendered correctly
        expect(image2.getBBox().width).toBe(20);
        done();
      });
    });
  });
});
