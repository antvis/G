import { Canvas, Group, Text } from '@antv/g';
import { Renderer as CanvasRenderer } from '@antv/g-canvas';
import chai, { expect } from 'chai';
import { vec3 } from 'gl-matrix';
// @ts-ignore
import chaiAlmost from 'chai-almost';
// @ts-ignore
import sinonChai from 'sinon-chai';

chai.use(chaiAlmost());
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

describe('Text', () => {
  // afterEach(() => {
  //   canvas.destroyChildren();
  // });

  // afterAll(() => {
  //   canvas.destroy();
  // });

  it('should allow number as valid content', () => {
    const text = new Text({
      style: {
        text: 1,
      },
    });
    expect(text.style.text).eqls(1);
    expect(text.parsedStyle.text).eqls('1');
  });

  it('should calc global bounds correctly', () => {
    const text = new Text({
      style: {
        text: '这是测试文本This is text',
        fontFamily: 'PingFang SC',
        fontSize: 60,
        fontWeight: 'normal',
        fontStyle: 'normal',
        fontVariant: 'normal',
        fill: '#1890FF',
        stroke: '#F04864',
        lineWidth: 5,
      },
    });

    // @ts-ignore
    text.setAttribute('font-size', 30);
    expect(text.style.fontSize).to.eqls(30);

    // parse font size with unit
    text.style.fontSize = '40px';
    expect(text.parsedStyle.fontSize).eqls(40);

    expect(text.nodeValue).eqls('这是测试文本This is text');
    expect(text.textContent).eqls('这是测试文本This is text');

    // get local position
    expect(text.getLocalPosition()).eqls([0, 0, 0]);

    text.style.text = 'changed';
    expect(text.nodeValue).eqls('changed');
    expect(text.textContent).eqls('changed');

    const group = new Group();
    expect(group.nodeValue).to.be.null;
    expect(group.textContent).eqls('');
    group.appendChild(text);
    expect(group.nodeValue).to.be.null;
    expect(group.textContent).eqls('changed');

    text.textContent = 'changed again';
    expect(text.nodeValue).eqls('changed again');
    expect(text.textContent).eqls('changed again');

    // empty text should return empty AABB
    text.style.text = '';
    const bounds = text.getBounds();
    expect(bounds.center[0]).to.almost.eqls(0);
    expect(bounds.center[1]).to.almost.eqls(0);
    expect(bounds.halfExtents[0]).to.almost.eqls(0);
    expect(bounds.halfExtents[1]).to.almost.eqls(0);

    // // get bounds
    // let bounds = text.getBounds();
    // if (bounds) {
    //   expect(bounds.center[0]).to.almost.eqls(336.61);
    //   expect(bounds.center[1]).to.almost.eqls(-19.5);
    //   expect(bounds.halfExtents[0]).to.almost.eqls(341.6);
    //   expect(bounds.halfExtents[1]).to.almost.eqls(41.5);
    // }

    // // change lineWidth
    // line.style.lineWidth = 20;
    // bounds = line.getBounds();
    // if (bounds) {
    //   expect(bounds.center).eqls(vec3.fromValues(300, 100, 0));
    //   expect(bounds.halfExtents).eqls(vec3.fromValues(120, 20, 0));
    // }
  });

  it('should overflow correctly.', async () => {
    await canvas.ready;

    const text = new Text({
      style: {
        x: 100,
        y: 100,
        text: '这是测试文本This is text',
        fontSize: 60,
        fill: '#1890FF',
        stroke: '#F04864',
        lineWidth: 5,
      },
    });

    canvas.appendChild(text);

    let bounds = text.getBounds();
    // if (bounds) {
    //   expect(bounds.center).eqls(vec3.fromValues(436.60992431640625, 80.5, 0));
    //   expect(bounds.halfExtents).eqls(vec3.fromValues(336.60992431640625, 36.5, 0));
    // }
    bounds = text.getRenderBounds();
    // if (bounds) {
    //   expect(bounds.center).eqls(vec3.fromValues(436.60992431640625, 80.5, 0));
    //   expect(bounds.halfExtents).eqls(vec3.fromValues(339.10992431640625, 39, 0));
    // }

    // word wrap
    text.style.wordWrap = true;
    text.style.wordWrapWidth = 200;
    expect(text.isOverflowing()).eqls(false);
    // bounds = text.getBounds();
    // if (bounds) {
    //   expect(bounds.center).eqls(vec3.fromValues(193.39996337890625, -29, 0));
    //   expect(bounds.halfExtents).eqls(vec3.fromValues(93.39996337890625, 146, 0));
    // }
    // bounds = text.getRenderBounds();
    // if (bounds) {
    //   expect(bounds.center).eqls(vec3.fromValues(193.39996337890625, -29, 0));
    //   expect(bounds.halfExtents).eqls(vec3.fromValues(95.89996337890625, 148.5, 0));
    // }

    // restore
    text.style.wordWrap = true;
    text.style.wordWrapWidth = 2000;
    expect(text.isOverflowing()).eqls(false);
    // bounds = text.getBounds();
    // if (bounds) {
    //   expect(bounds.center).eqls(vec3.fromValues(436.60992431640625, 80.5, 0));
    //   expect(bounds.halfExtents).eqls(vec3.fromValues(336.60992431640625, 36.5, 0));
    // }
    // bounds = text.getRenderBounds();
    // if (bounds) {
    //   expect(bounds.center).eqls(vec3.fromValues(436.60992431640625, 80.5, 0));
    //   expect(bounds.halfExtents).eqls(vec3.fromValues(339.10992431640625, 39, 0));
    // }

    // clip
    text.style.wordWrapWidth = 200;
    text.style.maxLines = 2;
    debugger;
    const r = text.isOverflowing();
    expect(r).eqls(true);
    // bounds = text.getBounds();
    // if (bounds) {
    //   expect(bounds.center).eqls(vec3.fromValues(192.5, 44, 0));
    //   expect(bounds.halfExtents).eqls(vec3.fromValues(92.5, 73, 0));
    // }
    // bounds = text.getRenderBounds();
    // if (bounds) {
    //   expect(bounds.center).eqls(vec3.fromValues(192.5, 44, 0));
    //   expect(bounds.halfExtents).eqls(vec3.fromValues(95, 75.5, 0));
    // }

    // overflow with ellipsis
    text.style.textOverflow = 'ellipsis';
    expect(text.isOverflowing()).eqls(true);
    // bounds = text.getBounds();
    // if (bounds) {
    //   expect(bounds.center).eqls(vec3.fromValues(192.5, 44, 0));
    //   expect(bounds.halfExtents).eqls(vec3.fromValues(92.5, 73, 0));
    // }
    // bounds = text.getRenderBounds();
    // if (bounds) {
    //   expect(bounds.center).eqls(vec3.fromValues(192.5, 44, 0));
    //   expect(bounds.halfExtents).eqls(vec3.fromValues(95, 75.5, 0));
    // }

    // overflow with clip
    text.style.textOverflow = 'clip';
    expect(text.isOverflowing()).eqls(true);
    // bounds = text.getBounds();
    // if (bounds) {
    //   expect(bounds.center).eqls(vec3.fromValues(192.5, 44, 0));
    //   expect(bounds.halfExtents).eqls(vec3.fromValues(92.5, 73, 0));
    // }
    // bounds = text.getRenderBounds();
    // if (bounds) {
    //   expect(bounds.center).eqls(vec3.fromValues(192.5, 44, 0));
    //   expect(bounds.halfExtents).eqls(vec3.fromValues(95, 75.5, 0));
    // }

    // overflow with custom long string
    text.style.textOverflow = 'long long long long long long long text';
    expect(text.isOverflowing()).eqls(true);
    // bounds = text.getBounds();
    // if (bounds) {
    //   expect(bounds.center).eqls(vec3.fromValues(192.5, 44, 0));
    //   expect(bounds.halfExtents).eqls(vec3.fromValues(92.5, 73, 0));
    // }
    // bounds = text.getRenderBounds();
    // if (bounds) {
    //   expect(bounds.center).eqls(vec3.fromValues(192.5, 44, 0));
    //   expect(bounds.halfExtents).eqls(vec3.fromValues(95, 75.5, 0));
    // }

    text.style.textOverflow = '..';
    expect(text.isOverflowing()).eqls(true);
    // bounds = text.getBounds();
    // if (bounds) {
    //   expect(bounds.center).eqls(vec3.fromValues(192.5, 44, 0));
    //   expect(bounds.halfExtents).eqls(vec3.fromValues(92.5, 73, 0));
    // }
    // bounds = text.getRenderBounds();
    // if (bounds) {
    //   expect(bounds.center).eqls(vec3.fromValues(192.5, 44, 0));
    //   expect(bounds.halfExtents).eqls(vec3.fromValues(95, 75.5, 0));
    // }

    // no overflowing content
    text.style.wordWrapWidth = 2000;
    expect(text.isOverflowing()).eqls(false);
    text.style.wordWrapWidth = 200;
    expect(text.isOverflowing()).eqls(true);

    text.style.maxLines = 100;
    expect(text.isOverflowing()).eqls(false);
    text.style.maxLines = 2;
    expect(text.isOverflowing()).eqls(true);

    // no wrap
    text.style.wordWrap = false;
    expect(text.isOverflowing()).eqls(false);
  });
});
