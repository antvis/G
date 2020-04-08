const expect = require('chai').expect;
import { mergeView } from '../../../src/util/draw';

describe('test merge view', () => {
  it('merge view', () => {
    const region1 = {
      minX: 0,
      minY: 0,
      maxX: 100,
      maxY: 100,
    };

    const region2 = {
      minX: 101,
      minY: 101,
      maxX: 200,
      maxY: 200,
    };

    const region3 = {
      minX: 0,
      minY: 0,
      maxX: 300,
      maxY: 300,
    };

    const region4 = {
      minX: 50,
      minY: 50,
      maxX: 150,
      maxY: 150,
    };

    expect(mergeView(null, null)).to.eql(null);
    expect(mergeView(region1, region2)).to.eql(null);
    expect(mergeView(region1, region3)).eqls(region1);
    expect(mergeView(region1, region4)).eqls({
      minX: 50,
      minY: 50,
      maxX: 100,
      maxY: 100,
    });
  });
});
