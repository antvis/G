import line from '../src/line';
import { distance } from '../src/util';

describe('line test', () => {
  it('box', () => {
    expect(line.box(0, 0, 100, 100)).toBe({
      x: 0,
      y: 0,
      width: 100,
      height: 100,
    });
    expect(line.box(100, 100, 0, 0)).toBe({
      x: 0,
      y: 0,
      width: 100,
      height: 100,
    });
  });

  it('length', () => {
    expect(distance(0, 0, 100, 100)).toBe(line.length(0, 0, 100, 100));
  });

  it('line at', () => {
    expect(line.pointAt(10, 10, 20, 20, 0.9)).toBe({ x: 19, y: 19 });
    expect(line.pointAt(0, 0, 10, 10, 0.1)).toBe({ x: 1, y: 1 });
    expect(line.pointAt(0, 0, 10, 10, 0.5)).toBe({ x: 5, y: 5 });
    expect(line.pointAt(0, 0, 10, 10, 1)).toBe({ x: 10, y: 10 });
  });
  it('distance to line', () => {
    expect(line.pointToLine(0, 0, 100, 0, 0, 10)).toBe(10); // 垂直方向
    expect(line.pointToLine(0, 0, 100, 0, 10, 0)).toBe(0); // 在线上
    expect(line.pointToLine(0, 0, 100, 0, 101, 0)).toBe(0); // 在延长线上

    expect(line.pointToLine(0, 0, 100, 0, 101, 10)).toBe(10); // 在外面上
    expect(line.pointToLine(0, 0, 100, 0, -10, 10)).toBe(10); // 在外面上
  });

  it('ditance, point in line', () => {
    expect(line.pointDistance(10, 10, 20, 20, 19, 19)).toBe(0);
  });

  it('distance to line segment', () => {
    expect(line.pointDistance(0, 0, 100, 0, 0, 10)).toBe(10); // 垂直方向
    expect(line.pointDistance(0, 0, 100, 0, 10, 0)).toBe(0); // 在线上

    expect(line.pointDistance(0, 0, 100, 0, 101, 0)).toBe(1); // 在延长线上
    expect(line.pointDistance(0, 0, 100, 0, 101, 10)).toBe(
      distance(100, 0, 101, 10),
    ); // 在外面上
    expect(line.pointDistance(0, 0, 100, 0, -10, 10)).toBe(
      distance(0, 0, -10, 10),
    ); // 在外面上
  });

  it('angle', () => {
    expect(line.tangentAngle(0, 0, 10, 10)).toBe((Math.PI * 1) / 4);
    expect(line.tangentAngle(10, 10, 10, 10)).toBe(0);
    expect(line.tangentAngle(0, 10, 10, 10)).toBe(0);
    expect(line.tangentAngle(0, 0, -4, -4)).toBe((-3 / 4) * Math.PI);
  });
  // 计算点到线的距离和计算点到线段的距离，性能差距在 2 - 3 倍左右
  // xit.only('performace test', () => {
  //   const count = 1000000;
  //   const v = Math.random() * 100;
  //   const v1 = Math.random() * 100;
  //   function execute(msg, callback) {
  //     const t = performance.now();
  //     callback();
  //     console.log(msg, ':', performance.now() - t);
  //   }

  //   function distanceTest(callback) {
  //     for(let i = 0; i < count; i++) {
  //       callback();
  //     }
  //   }

  //   execute('distance', () => {
  //     distanceTest(function() {
  //       line.pointDistance(0, 0, 100, 100, 30, 40);
  //     });
  //   });

  //   execute('point to line',() => {
  //     distanceTest(function() {
  //       line.pointToLine(0, 0, 100, 100, 30, 40);
  //     })
  //   });

  //   execute('box and point to line', () => {
  //     distanceTest(function() {
  //       const box = line.box(0, 0, 100, 100);
  //       line.pointDistance(0, 0, 100, 100, 30, 40);
  //     });
  //   });
  // });
});
