const expect = require('chai').expect;
import Canvas from '../../../src/canvas';
import { getShape } from '../../../src/util/hit';
const dom = document.createElement('div');
document.body.appendChild(dom);
const count = 10000;
const maxX = 500;
const maxY = 500;

function getTime(callback) {
  const t = window.performance.now();
  callback();
  return window.performance.now() - t;
}

const points = [];
for (let j = 0; j < 10; j++) {
  points.push({
    x: maxX * Math.random(),
    y: maxY * Math.random(),
  });
}

describe('quick hit test', () => {
  const canvas = new Canvas({
    container: dom,
    width: maxX,
    height: maxY,
  });

  const root = canvas.addGroup();

  xit('no group and all in view', () => {
    for (let i = 0; i < count; i++) {
      root.addShape('circle', {
        attrs: {
          x: Math.random() * maxX,
          y: Math.random() * maxY,
          r: Math.random() * 5,
          fill: 'red',
        },
      });
    }

    const t1 = getTime(() => {
      points.forEach((p) => {
        canvas.getShape(p.x, p.y);
      });
    });
    const t2 = getTime(() => {
      points.forEach((p) => {
        getShape(canvas, p.x, p.y);
      });
    });
    // console.log('all in view', t1, t2);
    expect(t2 < t1).eql(true);
  });

  xit('no group some out view', (done) => {
    root.clear();
    for (let i = 0; i < count; i++) {
      root.addShape('circle', {
        attrs: {
          x: Math.random() * maxX * 2,
          y: Math.random() * maxY * 2,
          r: Math.random() * 5,
          fill: 'red',
        },
      });
    }
    setTimeout(() => {
      const t1 = getTime(() => {
        points.forEach((p) => {
          canvas.getShape(p.x, p.y);
        });
      });
      const t2 = getTime(() => {
        points.forEach((p) => {
          getShape(canvas, p.x, p.y);
        });
      });
      // console.log('not all in view', t1, t2);
      expect(t2 < t1).eql(true);
      done();
    }, 50);
  });

  xit('with group and matrix', (done) => {
    root.clear();
    for (let i = 0; i < 10; i++) {
      const group = root.addGroup();
      group.translate(100 * Math.random(), 100 * Math.random());
    }
    for (let i = 0; i < count; i++) {
      const index = i % 10;
      const group = root.getChildByIndex(index);
      group.addShape('circle', {
        attrs: {
          x: Math.random() * maxX * 2,
          y: Math.random() * maxY * 2,
          r: Math.random() * 5,
          fill: 'red',
        },
      });
    }

    setTimeout(() => {
      const t1 = getTime(() => {
        points.forEach((p) => {
          canvas.getShape(p.x, p.y);
        });
      });
      const t2 = getTime(() => {
        points.forEach((p) => {
          getShape(canvas, p.x, p.y);
        });
      });
      // console.log('with group', t1, t2);
      expect(t2 < t1).eql(true);
      done();
    }, 50);
  });

  function getPath(x, y, r) {
    return [
      ['M', x, y - r],
      ['A', r, r, 0, 0, 0, x, y + r],
      ['A', r, r, 0, 0, 0, x, y - r],
    ];
  }
  xit('more groups', (done) => {
    root.clear();
    for (let i = 0; i < count * 2; i++) {
      const group = root.addGroup();
      group.translate(100 * Math.random(), 100 * Math.random());
      const x = Math.random() * maxX * 4 - 100;
      const y = Math.random() * maxY * 4 - 100;
      const r = Math.random() * 5;
      group.addShape('path', {
        name: 'node',
        attrs: {
          path: getPath(x, y, r),
          fill: 'red',
        },
      });

      group.addShape('path', {
        name: 'node',
        attrs: {
          path: getPath(x, y, r),
          fill: 'red',
        },
      });

      group.addShape('path', {
        name: 'node',
        attrs: {
          path: getPath(x, y, r),
          fill: 'red',
        },
      });

      group.addShape('circle', {
        name: 'node',
        attrs: {
          x,
          y,
          r,
          fill: 'red',
        },
      });
    }

    setTimeout(() => {
      // const shape = canvas.getChildByIndex(count / 2).getChildByIndex(0);
      // const {x, y} = shape;
      const t1 = getTime(() => {
        points.forEach((p) => {
          canvas.getShape(p.x, p.y);
        });
      });
      const t2 = getTime(() => {
        points.forEach((p) => {
          getShape(canvas, p.x, p.y);
        });
      });
      // console.log('more groups', t1, t2);
      expect(t2 < t1).eql(true);
      canvas.set('quickHit', true);
      done();
    }, 50);
  });

  canvas.on('node:mouseenter', (ev) => {
    ev.shape && ev.shape.attr('fill', 'blue');
  });
});
