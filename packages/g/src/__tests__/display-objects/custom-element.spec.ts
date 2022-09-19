import type { DisplayObjectConfig } from '@antv/g';
import { Canvas, Circle, CustomElement } from '@antv/g';
import { Renderer as CanvasRenderer } from '@antv/g-canvas';
import chai, { expect } from 'chai';
// @ts-ignore
import chaiAlmost from 'chai-almost';
import { vec3 } from 'gl-matrix';
// @ts-ignore
import sinon from 'sinon';
// @ts-ignore
import sinonChai from 'sinon-chai';

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
    canvas.removeChildren();
  });

  afterAll(() => {
    canvas.destroy();
  });

  it('should create custom element correctly.', async () => {
    const connectedCallback = sinon.spy();
    const disconnectedCallback = sinon.spy();
    const attributeChangedCallback = sinon.spy();

    class ElementA extends CustomElement<AProps> {
      constructor(options: DisplayObjectConfig<AProps>) {
        super(options);
        // this.addEventListener('onclick', () => {});
        const circle = new Circle({
          id: 'circle',
          style: { r: options.style?.size || 0, fill: 'red' },
        });
        this.appendChild(circle);
      }
      connectedCallback() {
        connectedCallback();
      }
      disconnectedCallback() {
        disconnectedCallback();
      }
      attributeChangedCallback<Key extends never>(name: Key, oldValue: {}[Key], newValue: {}[Key]) {
        attributeChangedCallback();
      }
    }
    const a = new ElementA({ style: { size: 10 } });
    a.setPosition(100, 100);

    a.style.x = 50;
    a.style.y = 50;
    expect(a.getLocalPosition()).to.be.eqls(vec3.fromValues(50, 50, 0));

    expect(a.style.size).to.be.eqls(10);
    a.setAttribute('size', 20);
    expect(a.style.size).to.be.eqls(20);

    // callback won't get called before mounted
    // @ts-ignore
    expect(connectedCallback).to.have.been.not.called;
    // @ts-ignore
    expect(disconnectedCallback).to.have.been.not.called;
    // @ts-ignore
    expect(attributeChangedCallback).to.have.been.not.called;

    await canvas.ready;
    // append to canvas
    canvas.appendChild(a);
    // @ts-ignore
    expect(connectedCallback).to.have.been.called;

    // do query
    expect(a.querySelector('#circle')).eqls(a.childNodes[0]);

    a.style.size = 100;
    // @ts-ignore
    expect(attributeChangedCallback).to.have.been.called;

    // unmounted
    canvas.removeChild(a);
    // @ts-ignore
    expect(disconnectedCallback).to.have.been.called;
  });

  it('should use built-in attributes correctly.', async () => {
    class ElementB extends CustomElement<BProps> {
      constructor(options: DisplayObjectConfig<BProps>) {
        super(options);
        const circle = new Circle({ style: { r: options.style?.size || 0, fill: 'red' } });
        this.appendChild(circle);
      }
      connectedCallback() {}
      disconnectedCallback() {}
      attributeChangedCallback<Key extends never>(
        name: Key,
        oldValue: {}[Key],
        newValue: {}[Key],
      ) {}
    }
    const a = new ElementB({ style: { size: 10, path: 'M100,100 L200,200' } });
    // conflict with built-in props
    expect(a.getLocalPosition()).to.be.eqls(vec3.fromValues(0, 0, 0));
  });
});
