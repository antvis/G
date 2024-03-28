import { vec3 } from 'gl-matrix';
import { Renderer as CanvasRenderer } from '../../../packages/g-svg/src';
import { Canvas, Text } from '../../../packages/g/src';
import { OffscreenCanvasContext } from '../offscreenCanvasContext';

const $container = document.createElement('div');
$container.id = 'container';
document.body.prepend($container);

const renderer = new CanvasRenderer();

const offscreenNodeCanvas = {
  getContext: () => context,
} as unknown as HTMLCanvasElement;
const context = new OffscreenCanvasContext(offscreenNodeCanvas);

// create a canvas
const canvas = new Canvas({
  container: 'container',
  width: 600,
  height: 500,
  renderer,
  offscreenCanvas: offscreenNodeCanvas as any,
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
    expect(text.style.text).toBe(1);
    expect(text.parsedStyle.text).toBe(1);
  });

  it('should calc global bounds correctly', () => {
    const text = new Text({
      style: {
        text: '这',
        fontFamily: 'PingFang SC',
        fontSize: 100,
        fontWeight: 'normal',
        fontStyle: 'normal',
        fontVariant: 'normal',
        fill: '#1890FF',
        stroke: '#F04864',
        lineWidth: 0,
        textAlign: 'center',
        textBaseline: 'middle',
      },
    });

    text.setAttribute('fontSize', 30);
    expect(text.style.fontSize).toBe(30);

    // parse font size with unit
    // text.style.fontSize = '40px';
    // expect(text.parsedStyle.fontSize).toBe(40);

    // expect(text.nodeValue).toBe('这是测试文本This is text');
    // expect(text.textContent).toBe('这是测试文本This is text');

    // get local position
    expect(text.getLocalPosition()).toStrictEqual([0, 0, 0]);

    // text.style.text = 'changed';
    // expect(text.nodeValue).toBe('changed');
    // expect(text.textContent).toBe('changed');

    // const group = new Group();
    // expect(group.nodeValue).toBeNull();
    // expect(group.textContent).toBe('');
    // group.appendChild(text);
    // expect(group.nodeValue).toBeNull();
    // expect(group.textContent).toBe('changed');

    // text.textContent = 'changed again';
    // expect(text.nodeValue).toBe('changed again');
    // expect(text.textContent).toBe('changed again');

    // empty text should return empty AABB
    text.style.text = '';
    let bounds = text.getBounds();
    expect(bounds.center).toEqual([0, 0, 0]);
    expect(bounds.halfExtents).toEqual([0, 0, 0]);

    text.style.text = '这';
    text.style.fontSize = 100;
    bounds = text.getBounds();
    expect(bounds.center).toEqual([0, 0, 0]);
    expect(bounds.halfExtents).toEqual([50, 89, 0]);

    // change lineWidth
    text.style.lineWidth = 20;
    bounds = text.getBounds();
    if (bounds) {
      expect(bounds.center).toEqual([10, 0, 0]);
      expect(bounds.halfExtents).toEqual([60, 99, 0]);
    }
  });

  it('should overflow correctly.', async () => {
    await canvas.ready;

    const text = new Text({
      style: {
        x: 100,
        y: 100,
        text: '这是一段测试文本',
        fontSize: 100,
        fill: '#1890FF',
        stroke: '#F04864',
        lineWidth: 5,
      },
    });

    canvas.appendChild(text);

    let bounds = text.getBounds();
    if (bounds) {
      expect(bounds.center).toEqual([502.5, 8.5, 0]);
      expect(bounds.halfExtents).toEqual([402.5, 91.5, 0]);
    }
    bounds = text.getRenderBounds();
    if (bounds) {
      expect(bounds.center).toEqual([502.5, 8.5, 0]);
      expect(bounds.halfExtents).toEqual([405, 94, 0]);
    }

    // word wrap
    text.style.wordWrap = true;
    text.style.wordWrapWidth = 1000;
    expect(text.isOverflowing()).toBe(false);
    bounds = text.getBounds();
    if (bounds) {
      expect(bounds.center).toEqual([502.5, 8.5, 0]);
      expect(bounds.halfExtents).toEqual([402.5, 91.5, 0]);
    }
    bounds = text.getRenderBounds();
    if (bounds) {
      expect(bounds.center).toEqual([502.5, 8.5, 0]);
      expect(bounds.halfExtents).toEqual([405, 94, 0]);
    }

    // restore
    text.style.wordWrap = true;
    text.style.wordWrapWidth = 20000;
    expect(text.isOverflowing()).toBe(false);
    bounds = text.getBounds();
    if (bounds) {
      expect(bounds.center).toEqual([502.5, 8.5, 0]);
      expect(bounds.halfExtents).toEqual([402.5, 91.5, 0]);
    }
    bounds = text.getRenderBounds();
    if (bounds) {
      expect(bounds.center).toEqual([502.5, 8.5, 0]);
      expect(bounds.halfExtents).toEqual([405, 94, 0]);
    }

    // clip
    text.style.wordWrapWidth = 200;
    text.style.maxLines = 2;
    expect(text.isOverflowing()).toBe(true);
    bounds = text.getBounds();
    if (bounds) {
      expect(bounds.center).toEqual([202.5, -83, 0]);
      expect(bounds.halfExtents).toEqual([102.5, 183, 0]);
    }
    bounds = text.getRenderBounds();
    if (bounds) {
      expect(bounds.center).toEqual([202.5, -83, 0]);
      expect(bounds.halfExtents).toEqual([105, 185.5, 0]);
    }

    // overflow with ellipsis
    text.style.textOverflow = 'ellipsis';
    expect(text.isOverflowing()).toBe(true);
    bounds = text.getBounds();
    if (bounds) {
      expect(bounds.center).toEqual([202.5, -83, 0]);
      expect(bounds.halfExtents).toEqual([102.5, 183, 0]);
    }
    bounds = text.getRenderBounds();
    if (bounds) {
      expect(bounds.center).toEqual([202.5, -83, 0]);
      expect(bounds.halfExtents).toEqual([105, 185.5, 0]);
    }

    // overflow with clip
    text.style.textOverflow = 'clip';
    expect(text.isOverflowing()).toBe(true);
    bounds = text.getBounds();
    if (bounds) {
      expect(bounds.center).toEqual([202.5, -83, 0]);
      expect(bounds.halfExtents).toEqual([102.5, 183, 0]);
    }
    bounds = text.getRenderBounds();
    if (bounds) {
      expect(bounds.center).toEqual([202.5, -83, 0]);
      expect(bounds.halfExtents).toEqual([105, 185.5, 0]);
    }

    // overflow with custom long string
    text.style.textOverflow = 'long long long long long long long text';
    expect(text.isOverflowing()).toBe(true);
    bounds = text.getBounds();
    if (bounds) {
      expect(bounds.center).toEqual([202.5, -83, 0]);
      expect(bounds.halfExtents).toEqual([102.5, 183, 0]);
    }
    bounds = text.getRenderBounds();
    if (bounds) {
      expect(bounds.center).toEqual([202.5, -83, 0]);
      expect(bounds.halfExtents).toEqual([105, 185.5, 0]);
    }

    text.style.textOverflow = '..';
    expect(text.isOverflowing()).toBe(true);
    bounds = text.getBounds();
    if (bounds) {
      expect(bounds.center).toEqual([202.5, -83, 0]);
      expect(bounds.halfExtents).toEqual([102.5, 183, 0]);
    }
    bounds = text.getRenderBounds();
    if (bounds) {
      expect(bounds.center).toEqual([202.5, -83, 0]);
      expect(bounds.halfExtents).toEqual([105, 185.5, 0]);
    }

    // no overflowing content
    text.style.wordWrapWidth = 2000;
    expect(text.isOverflowing()).toBe(false);
    text.style.wordWrapWidth = 200;
    expect(text.isOverflowing()).toBe(true);

    text.style.maxLines = 100;
    expect(text.isOverflowing()).toBe(false);
    text.style.maxLines = 2;
    expect(text.isOverflowing()).toBe(true);

    // no wrap
    text.style.wordWrap = false;
    expect(text.isOverflowing()).toBe(false);
  });
});
