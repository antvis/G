import { Renderer as CanvasRenderer } from '../../../packages/g-svg/src';
import { Canvas, Group, Rect, Text } from '../../../packages/g/src';

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

describe.skip('Text', () => {
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
    expect(text.parsedStyle.text).toBe('1');
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
    expect(text.style.fontSize).toBe(30);

    // parse font size with unit
    text.style.fontSize = '40px';
    expect(text.parsedStyle.fontSize).toBe(40);

    expect(text.nodeValue).toBe('这是测试文本This is text');
    expect(text.textContent).toBe('这是测试文本This is text');

    // get local position
    expect(text.getLocalPosition()).toStrictEqual([0, 0, 0]);

    text.style.text = 'changed';
    expect(text.nodeValue).toBe('changed');
    expect(text.textContent).toBe('changed');

    const group = new Group();
    expect(group.nodeValue).toBeNull();
    expect(group.textContent).toBe('');
    group.appendChild(text);
    expect(group.nodeValue).toBeNull();
    expect(group.textContent).toBe('changed');

    text.textContent = 'changed again';
    expect(text.nodeValue).toBe('changed again');
    expect(text.textContent).toBe('changed again');

    // empty text should return empty AABB
    text.style.text = '';
    const bounds = text.getBounds();
    expect(bounds.center[0]).toBeCloseTo(0);
    expect(bounds.center[1]).toBeCloseTo(0);
    expect(bounds.halfExtents[0]).toBeCloseTo(0);
    expect(bounds.halfExtents[1]).toBeCloseTo(0);

    // // get bounds
    // let bounds = text.getBounds();
    // if (bounds) {
    //   expect(bounds.center[0]).toBeCloseTo(336.61);
    //   expect(bounds.center[1]).toBeCloseTo(-19.5);
    //   expect(bounds.halfExtents[0]).toBeCloseTo(341.6);
    //   expect(bounds.halfExtents[1]).toBeCloseTo(41.5);
    // }

    // // change lineWidth
    // line.style.lineWidth = 20;
    // bounds = line.getBounds();
    // if (bounds) {
    //   expect(bounds.center).toBe(vec3.fromValues(300, 100, 0));
    //   expect(bounds.halfExtents).toBe(vec3.fromValues(120, 20, 0));
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

    // let bounds = text.getBounds();
    // if (bounds) {
    //   expect(bounds.center).toBe(vec3.fromValues(436.60992431640625, 80.5, 0));
    //   expect(bounds.halfExtents).toBe(vec3.fromValues(336.60992431640625, 36.5, 0));
    // }
    // let bounds = text.getRenderBounds();
    // if (bounds) {
    //   expect(bounds.center).toBe(vec3.fromValues(436.60992431640625, 80.5, 0));
    //   expect(bounds.halfExtents).toBe(vec3.fromValues(339.10992431640625, 39, 0));
    // }

    // word wrap
    text.style.wordWrap = true;
    text.style.wordWrapWidth = 200;
    expect(text.isOverflowing()).toBe(false);
    // bounds = text.getBounds();
    // if (bounds) {
    //   expect(bounds.center).toBe(vec3.fromValues(193.39996337890625, -29, 0));
    //   expect(bounds.halfExtents).toBe(vec3.fromValues(93.39996337890625, 146, 0));
    // }
    // bounds = text.getRenderBounds();
    // if (bounds) {
    //   expect(bounds.center).toBe(vec3.fromValues(193.39996337890625, -29, 0));
    //   expect(bounds.halfExtents).toBe(vec3.fromValues(95.89996337890625, 148.5, 0));
    // }

    // restore
    text.style.wordWrap = true;
    text.style.wordWrapWidth = 2000;
    expect(text.isOverflowing()).toBe(false);
    // bounds = text.getBounds();
    // if (bounds) {
    //   expect(bounds.center).toBe(vec3.fromValues(436.60992431640625, 80.5, 0));
    //   expect(bounds.halfExtents).toBe(vec3.fromValues(336.60992431640625, 36.5, 0));
    // }
    // bounds = text.getRenderBounds();
    // if (bounds) {
    //   expect(bounds.center).toBe(vec3.fromValues(436.60992431640625, 80.5, 0));
    //   expect(bounds.halfExtents).toBe(vec3.fromValues(339.10992431640625, 39, 0));
    // }

    // clip
    text.style.wordWrapWidth = 200;
    text.style.maxLines = 2;

    const r = text.isOverflowing();
    expect(r).toBe(true);
    // bounds = text.getBounds();
    // if (bounds) {
    //   expect(bounds.center).toBe(vec3.fromValues(192.5, 44, 0));
    //   expect(bounds.halfExtents).toBe(vec3.fromValues(92.5, 73, 0));
    // }
    // bounds = text.getRenderBounds();
    // if (bounds) {
    //   expect(bounds.center).toBe(vec3.fromValues(192.5, 44, 0));
    //   expect(bounds.halfExtents).toBe(vec3.fromValues(95, 75.5, 0));
    // }

    // overflow with ellipsis
    text.style.textOverflow = 'ellipsis';
    expect(text.isOverflowing()).toBe(true);
    // bounds = text.getBounds();
    // if (bounds) {
    //   expect(bounds.center).toBe(vec3.fromValues(192.5, 44, 0));
    //   expect(bounds.halfExtents).toBe(vec3.fromValues(92.5, 73, 0));
    // }
    // bounds = text.getRenderBounds();
    // if (bounds) {
    //   expect(bounds.center).toBe(vec3.fromValues(192.5, 44, 0));
    //   expect(bounds.halfExtents).toBe(vec3.fromValues(95, 75.5, 0));
    // }

    // overflow with clip
    text.style.textOverflow = 'clip';
    expect(text.isOverflowing()).toBe(true);
    // bounds = text.getBounds();
    // if (bounds) {
    //   expect(bounds.center).toBe(vec3.fromValues(192.5, 44, 0));
    //   expect(bounds.halfExtents).toBe(vec3.fromValues(92.5, 73, 0));
    // }
    // bounds = text.getRenderBounds();
    // if (bounds) {
    //   expect(bounds.center).toBe(vec3.fromValues(192.5, 44, 0));
    //   expect(bounds.halfExtents).toBe(vec3.fromValues(95, 75.5, 0));
    // }

    // overflow with custom long string
    text.style.textOverflow = 'long long long long long long long text';
    expect(text.isOverflowing()).toBe(true);
    // bounds = text.getBounds();
    // if (bounds) {
    //   expect(bounds.center).toBe(vec3.fromValues(192.5, 44, 0));
    //   expect(bounds.halfExtents).toBe(vec3.fromValues(92.5, 73, 0));
    // }
    // bounds = text.getRenderBounds();
    // if (bounds) {
    //   expect(bounds.center).toBe(vec3.fromValues(192.5, 44, 0));
    //   expect(bounds.halfExtents).toBe(vec3.fromValues(95, 75.5, 0));
    // }

    text.style.textOverflow = '..';
    expect(text.isOverflowing()).toBe(true);
    // bounds = text.getBounds();
    // if (bounds) {
    //   expect(bounds.center).toBe(vec3.fromValues(192.5, 44, 0));
    //   expect(bounds.halfExtents).toBe(vec3.fromValues(92.5, 73, 0));
    // }
    // bounds = text.getRenderBounds();
    // if (bounds) {
    //   expect(bounds.center).toBe(vec3.fromValues(192.5, 44, 0));
    //   expect(bounds.halfExtents).toBe(vec3.fromValues(95, 75.5, 0));
    // }

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

  // it.only('should calc global bounds correctly', async () => {
  //   await canvas.ready;

  //   const group = new Group();
  //   const rect = new Rect({
  //     style: {
  //       width: 50,
  //       height: 50,
  //       stroke: 'black',
  //       lineWidth: 2,
  //       fill: 'red',
  //     },
  //   });
  //   const text = new Text({
  //     style: {
  //       text: '这是测试文本This is text',
  //       fontSize: 60,
  //       fill: '#1890FF',
  //     },
  //   });

  //   rect.appendChild(text);

  //   group.appendChild(rect);
  //   canvas.appendChild(group);

  //   console.log(text);
  // });
});
