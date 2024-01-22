import { Renderer as CanvasRenderer } from '../../../packages/g-svg/src';
import type { DisplayObjectConfig } from '../../../packages/g/src';
import { Canvas, Circle, CustomElement } from '../../../packages/g/src';

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
});

interface AProps {
  size: number;
}

interface BProps {
  size: number;
  path: string;
}

describe('CustomElement', () => {
  afterEach(() => {
    canvas.destroyChildren();
  });

  afterAll(() => {
    canvas.destroy();
  });

  it('should create custom element correctly.', async () => {
    const connectedCallback = jest.fn();
    const disconnectedCallback = jest.fn();
    const attributeChangedCallback = jest.fn();

    class ElementA extends CustomElement<AProps> {
      constructor(options: DisplayObjectConfig<AProps>) {
        super(options);
        // this.addEventListener('onclick', () => {});
        const circle = new Circle({
          id: 'circle',
          style: { r: options.style?.size || 0, fill: 'red' },
        });
        // const text = new Text({
        //   style: {
        //     text: 'A',
        //     fill: 'red',
        //   },
        // });

        // circle.appendChild(text);
        this.appendChild(circle);
      }
      connectedCallback() {
        connectedCallback();
      }
      disconnectedCallback() {
        disconnectedCallback();
      }
      attributeChangedCallback<Key extends never>(
        name: Key,
        oldValue: any,
        newValue: any,
      ) {
        attributeChangedCallback();
      }
    }
    const a = new ElementA({ style: { size: 10 } });
    a.setPosition(100, 100);

    a.style.transform = 'translate(50, 50)';
    expect(a.getLocalPosition()).toStrictEqual([50, 50, 0]);

    expect(a.style.size).toBe(10);
    a.setAttribute('size', 20);
    expect(a.style.size).toBe(20);

    // callback won't get called before mounted
    expect(connectedCallback).not.toHaveBeenCalled();
    expect(disconnectedCallback).not.toHaveBeenCalled();
    expect(attributeChangedCallback).not.toHaveBeenCalled();

    await canvas.ready;
    // append to canvas
    canvas.appendChild(a);
    expect(connectedCallback).toHaveBeenCalled();

    // do query
    expect(a.querySelector('#circle')).toBe(a.childNodes[0]);

    a.style.size = 100;
    expect(attributeChangedCallback).toHaveBeenCalled();

    // unmounted
    canvas.removeChild(a);
    expect(disconnectedCallback).toHaveBeenCalled();
  });

  it('should use built-in attributes correctly.', async () => {
    class ElementB extends CustomElement<BProps> {
      constructor(options: DisplayObjectConfig<BProps>) {
        super(options);
        const circle = new Circle({
          style: { r: options.style?.size || 0, fill: 'red' },
        });
        this.appendChild(circle);
      }
      connectedCallback() {}
      disconnectedCallback() {}
      attributeChangedCallback<Key extends never>(
        name: Key,
        oldValue: any,
        newValue: any,
      ) {}
    }
    const a = new ElementB({ style: { size: 10, path: 'M100,100 L200,200' } });
    // conflict with built-in props
    expect(a.getLocalPosition()).toStrictEqual([0, 0, 0]);
  });
});
