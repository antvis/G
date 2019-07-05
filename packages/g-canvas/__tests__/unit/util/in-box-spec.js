const expect = require('chai').expect;
import BoxUtil from '../../../src/util/box';

describe('test in bbox', () => {
  it('in line', () => {
    const box = BoxUtil.line(
      {
        x1: 0,
        y1: 0,
        x2: 100,
        y2: 100,
      },
      0
    );
    expect(box).eqls({
      minX: 0,
      minY: 0,
      maxX: 100,
      maxY: 100,
    });
    const box1 = BoxUtil.line(
      {
        x1: 0,
        y1: 0,
        x2: 100,
        y2: 100,
      },
      2
    );
    expect(box1).eqls({
      minX: -1,
      minY: -1,
      maxX: 101,
      maxY: 101,
    });
  });

  it('in rect', () => {
    const box = BoxUtil.rect({ x: 0, y: 0, width: 100, height: 100 }, 0);
    expect(box).eqls({
      minX: 0,
      minY: 0,
      maxX: 100,
      maxY: 100,
    });

    const box1 = BoxUtil.rect({ x: 0, y: 0, width: 100, height: 100 }, 2);
    expect(box1).eqls({
      minX: -1,
      minY: -1,
      maxX: 101,
      maxY: 101,
    });
  });

  it('in circle', () => {
    const box = BoxUtil.circle({ x: 50, y: 50, r: 50 }, 0);
    expect(box).eqls({
      minX: 0,
      minY: 0,
      maxX: 100,
      maxY: 100,
    });

    const box1 = BoxUtil.circle({ x: 50, y: 50, r: 50 }, 2);
    expect(box1).eqls({
      minX: -1,
      minY: -1,
      maxX: 101,
      maxY: 101,
    });
  });

  it('in polygon', () => {
    const points = [[0, 0], [100, 1], [100, 100], [0, 90]];
    const box = BoxUtil.polygon({ points }, 0);
    expect(box).eqls({
      minX: 0,
      minY: 0,
      maxX: 100,
      maxY: 100,
    });

    const box1 = BoxUtil.polygon({ points }, 2);
    expect(box1).eqls({
      minX: -1,
      minY: -1,
      maxX: 101,
      maxY: 101,
    });
  });

  it('in image', () => {
    const box = BoxUtil.image({ x: 0, y: 0, width: 100, height: 100 }, 0);
    expect(box).eqls({
      minX: 0,
      minY: 0,
      maxX: 100,
      maxY: 100,
    });
    const box1 = BoxUtil.image({ x: 0, y: 0, width: 100, height: 100 }, 2);
    expect(box1).eqls({
      minX: 0,
      minY: 0,
      maxX: 100,
      maxY: 100,
    });
  });
});
