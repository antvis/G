import { expect } from 'chai';
import { parsePoints, mergePoints } from '../../../../packages/g-lite/src/css';

describe('Property Points', () => {
  it('should parse points correctly', () => {
    let result = parsePoints('10,10 10,20 10,30', null);
    expect(result.points).to.be.eqls([
      [10, 10],
      [10, 20],
      [10, 30],
    ]);
    expect(result.totalLength).to.be.eqls(20);
    expect(result.segments).to.be.eqls([
      [0, 0.5],
      [0.5, 1],
    ]);

    result = parsePoints(
      [
        [10, 10],
        [10, 20],
        [10, 30],
      ],
      null,
    );
    expect(result.points).to.be.eqls([
      [10, 10],
      [10, 20],
      [10, 30],
    ]);
    expect(result.totalLength).to.be.eqls(20);
    expect(result.segments).to.be.eqls([
      [0, 0.5],
      [0.5, 1],
    ]);
  });

  it('should merge points correctly.', () => {
    let points1 = parsePoints('10,10 10,20 10,30', null);
    let points2 = parsePoints('10,40 10,50 10,60', null);

    const [left, right] = mergePoints(points1, points2);

    expect(left).to.be.eqls([
      [10, 10],
      [10, 20],
      [10, 30],
    ]);
    expect(right).to.be.eqls([
      [10, 40],
      [10, 50],
      [10, 60],
    ]);
  });
});
