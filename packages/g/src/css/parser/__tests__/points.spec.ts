import chai, { expect } from 'chai';
import { parsePoints } from '@antv/g';

describe('Property Points', () => {
  it('should parse points correctly', () => {
    let result = parsePoints('10,10 10,20 10,30');
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

    result = parsePoints([
      [10, 10],
      [10, 20],
      [10, 30],
    ]);
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
});
