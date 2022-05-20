import chai, { expect } from 'chai';
import { Circle, CSS, Canvas, ParsedTransform } from '@antv/g';
import { Renderer as CanvasRenderer } from '@antv/g-canvas';
import { vec3 } from 'gl-matrix';
import { sleep } from '../../../__tests__/utils';

const $container = document.createElement('div');
$container.id = 'container';
document.body.prepend($container);

const renderer = new CanvasRenderer();
const canvas = new Canvas({
  container: 'container',
  width: 100,
  height: 100,
  renderer,
});

/**
 * <transform>
 */
describe('CSSPropertyTransform', () => {
  afterEach(() => {
    canvas.removeChildren();
  });

  afterAll(() => {
    canvas.destroy();
  });

  it('should parse transform correctly.', async () => {
    const circle = new Circle({
      style: {
        cx: 10,
        cy: 10,
        r: 50,
        transform: 'translate(10, 10)',
      },
    });

    canvas.appendChild(circle);

    await sleep(100);

    // attribute
    expect(circle.getAttribute('transform')).to.be.eqls('translate(10, 10)');

    // used value
    let used = circle.computedStyleMap().get('transform') as ParsedTransform[];
    expect(used.length).to.be.eqls(1);
    expect(used[0].t).to.be.eqls('translate');
    expect(used[0].d.length).to.be.eqls(2);
    expect(used[0].d[0].equals(CSS.px(10))).to.be.true;
    expect(used[0].d[1].equals(CSS.px(10))).to.be.true;
    expect(circle.getLocalPosition()).to.be.eqls(vec3.fromValues(20, 20, 0));

    // translateX
    circle.style.transform = 'translateX(20)';
    expect(circle.getLocalPosition()).to.be.eqls(vec3.fromValues(30, 10, 0));
    used = circle.computedStyleMap().get('transform') as ParsedTransform[];
    expect(used.length).to.be.eqls(1);
    expect(used[0].t).to.be.eqls('translatex');
    expect(used[0].d.length).to.be.eqls(1);
    expect(used[0].d[0].equals(CSS.px(20))).to.be.true;

    // translateY
    circle.style.transform = 'translateY(20)';
    expect(circle.getLocalPosition()).to.be.eqls(vec3.fromValues(10, 30, 0));
    used = circle.computedStyleMap().get('transform') as ParsedTransform[];
    expect(used.length).to.be.eqls(1);
    expect(used[0].t).to.be.eqls('translatey');
    expect(used[0].d.length).to.be.eqls(1);
    expect(used[0].d[0].equals(CSS.px(20))).to.be.true;

    // translateZ
    circle.style.transform = 'translateZ(20)';
    expect(circle.getLocalPosition()).to.be.eqls(vec3.fromValues(10, 10, 20));
    used = circle.computedStyleMap().get('transform') as ParsedTransform[];
    expect(used.length).to.be.eqls(1);
    expect(used[0].t).to.be.eqls('translatez');
    expect(used[0].d.length).to.be.eqls(1);
    expect(used[0].d[0].equals(CSS.px(20))).to.be.true;

    // translate3d
    circle.style.transform = 'translate3d(10, 10px, 10px)';
    expect(circle.getLocalPosition()).to.be.eqls(vec3.fromValues(20, 20, 10));
    used = circle.computedStyleMap().get('transform') as ParsedTransform[];
    expect(used.length).to.be.eqls(1);
    expect(used[0].t).to.be.eqls('translate3d');
    expect(used[0].d.length).to.be.eqls(3);
    expect(used[0].d[0].equals(CSS.px(10))).to.be.true;
    expect(used[0].d[1].equals(CSS.px(10))).to.be.true;
    expect(used[0].d[2].equals(CSS.px(10))).to.be.true;

    // scaleX
    circle.style.transform = 'scaleX(2)';
    expect(circle.getLocalPosition()).to.be.eqls(vec3.fromValues(10, 10, 0));
    used = circle.computedStyleMap().get('transform') as ParsedTransform[];
    expect(used.length).to.be.eqls(1);
    expect(used[0].t).to.be.eqls('scalex');
    expect(used[0].d.length).to.be.eqls(1);
    expect(used[0].d[0].equals(CSS.number(2))).to.be.true;

    // scaleY
    circle.style.transform = 'scaleY(2)';
    expect(circle.getLocalPosition()).to.be.eqls(vec3.fromValues(10, 10, 0));
    used = circle.computedStyleMap().get('transform') as ParsedTransform[];
    expect(used.length).to.be.eqls(1);
    expect(used[0].t).to.be.eqls('scaley');
    expect(used[0].d.length).to.be.eqls(1);
    expect(used[0].d[0].equals(CSS.number(2))).to.be.true;

    // scaleZ
    circle.style.transform = 'scaleZ(2)';
    expect(circle.getLocalPosition()).to.be.eqls(vec3.fromValues(10, 10, 0));
    used = circle.computedStyleMap().get('transform') as ParsedTransform[];
    expect(used.length).to.be.eqls(1);
    expect(used[0].t).to.be.eqls('scalez');
    expect(used[0].d.length).to.be.eqls(1);
    expect(used[0].d[0].equals(CSS.number(2))).to.be.true;

    // scale3d
    circle.style.transform = 'scale3d(2,2,2)';
    expect(circle.getLocalPosition()).to.be.eqls(vec3.fromValues(10, 10, 0));
    used = circle.computedStyleMap().get('transform') as ParsedTransform[];
    expect(used.length).to.be.eqls(1);
    expect(used[0].t).to.be.eqls('scale3d');
    expect(used[0].d.length).to.be.eqls(3);
    expect(used[0].d[0].equals(CSS.number(2))).to.be.true;
    expect(used[0].d[1].equals(CSS.number(2))).to.be.true;
    expect(used[0].d[2].equals(CSS.number(2))).to.be.true;

    // scale
    circle.style.transform = 'scale(2)';
    expect(circle.getLocalPosition()).to.be.eqls(vec3.fromValues(10, 10, 0));
    used = circle.computedStyleMap().get('transform') as ParsedTransform[];
    expect(used.length).to.be.eqls(1);
    expect(used[0].t).to.be.eqls('scale');
    expect(used[0].d.length).to.be.eqls(2);
    expect(used[0].d[0].equals(CSS.number(2))).to.be.true;
    expect(used[0].d[1].equals(CSS.number(2))).to.be.true;

    // scale
    circle.style.transform = 'scale(2,3)';
    expect(circle.getLocalPosition()).to.be.eqls(vec3.fromValues(10, 10, 0));
    used = circle.computedStyleMap().get('transform') as ParsedTransform[];
    expect(used.length).to.be.eqls(1);
    expect(used[0].t).to.be.eqls('scale');
    expect(used[0].d.length).to.be.eqls(2);
    expect(used[0].d[0].equals(CSS.number(2))).to.be.true;
    expect(used[0].d[1].equals(CSS.number(3))).to.be.true;

    // rotate
    circle.style.transform = 'rotate(30deg)';
    expect(circle.getLocalPosition()).to.be.eqls(vec3.fromValues(10, 10, 0));
    used = circle.computedStyleMap().get('transform') as ParsedTransform[];
    expect(used.length).to.be.eqls(1);
    expect(used[0].t).to.be.eqls('rotate');
    expect(used[0].d.length).to.be.eqls(1);
    expect(used[0].d[0].equals(CSS.deg(30))).to.be.true;

    // rotate
    circle.style.transform = 'rotate(1rad)';
    expect(circle.getLocalPosition()).to.be.eqls(vec3.fromValues(10, 10, 0));
    used = circle.computedStyleMap().get('transform') as ParsedTransform[];
    expect(used.length).to.be.eqls(1);
    expect(used[0].t).to.be.eqls('rotate');
    expect(used[0].d.length).to.be.eqls(1);
    expect(used[0].d[0].equals(CSS.rad(1))).to.be.true;

    // rotate
    circle.style.transform = 'rotate(1turn)';
    expect(circle.getLocalPosition()).to.be.eqls(vec3.fromValues(10, 10, 0));
    used = circle.computedStyleMap().get('transform') as ParsedTransform[];
    expect(used.length).to.be.eqls(1);
    expect(used[0].t).to.be.eqls('rotate');
    expect(used[0].d.length).to.be.eqls(1);
    expect(used[0].d[0].equals(CSS.turn(1))).to.be.true;

    // rotate
    circle.style.transform = 'rotate(1grad)';
    expect(circle.getLocalPosition()).to.be.eqls(vec3.fromValues(10, 10, 0));
    used = circle.computedStyleMap().get('transform') as ParsedTransform[];
    expect(used.length).to.be.eqls(1);
    expect(used[0].t).to.be.eqls('rotate');
    expect(used[0].d.length).to.be.eqls(1);
    expect(used[0].d[0].equals(CSS.grad(1))).to.be.true;

    // rotateX
    circle.style.transform = 'rotateX(30deg)';
    expect(circle.getLocalPosition()).to.be.eqls(vec3.fromValues(10, 10, 0));
    used = circle.computedStyleMap().get('transform') as ParsedTransform[];
    expect(used.length).to.be.eqls(1);
    expect(used[0].t).to.be.eqls('rotatex');
    expect(used[0].d.length).to.be.eqls(1);
    expect(used[0].d[0].equals(CSS.deg(30))).to.be.true;

    // rotateY
    circle.style.transform = 'rotateY(30deg)';
    expect(circle.getLocalPosition()).to.be.eqls(vec3.fromValues(10, 10, 0));
    used = circle.computedStyleMap().get('transform') as ParsedTransform[];
    expect(used.length).to.be.eqls(1);
    expect(used[0].t).to.be.eqls('rotatey');
    expect(used[0].d.length).to.be.eqls(1);
    expect(used[0].d[0].equals(CSS.deg(30))).to.be.true;

    // rotateZ
    circle.style.transform = 'rotateZ(30deg)';
    expect(circle.getLocalPosition()).to.be.eqls(vec3.fromValues(10, 10, 0));
    used = circle.computedStyleMap().get('transform') as ParsedTransform[];
    expect(used.length).to.be.eqls(1);
    expect(used[0].t).to.be.eqls('rotatez');
    expect(used[0].d.length).to.be.eqls(1);
    expect(used[0].d[0].equals(CSS.deg(30))).to.be.true;
  });

  it('should apply a series of transforms correctly.', async () => {
    const circle = new Circle({
      style: {
        cx: 10,
        cy: 10,
        r: 50,
        transform: 'translate(-10, -10) scale(0.5) translate(10, 10)',
      },
    });

    canvas.appendChild(circle);

    await sleep(100);
    expect(circle.getLocalPosition()).to.be.eqls(vec3.fromValues(10, 10, 0));
    expect(circle.getLocalBounds().center).to.be.eqls(vec3.fromValues(10, 10, 0));
    expect(circle.getLocalBounds().halfExtents).to.be.eqls(vec3.fromValues(25, 25, 0));
  });
});
