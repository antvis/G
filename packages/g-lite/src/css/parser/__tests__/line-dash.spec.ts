import { expect } from 'chai';
import { parseDimensionArray } from '..';

describe('Property LineDash', () => {
  it('parse lineDash with unit', () => {
    let result = parseDimensionArray('10px 10px');
    expect(result[0].toString()).to.be.eqls('10px');
    expect(result[1].toString()).to.be.eqls('10px');

    result = parseDimensionArray('10 10');
    expect(result[0].toString()).to.be.eqls('10px');
    expect(result[1].toString()).to.be.eqls('10px');

    result = parseDimensionArray('10px 10%');
    expect(result[0].toString()).to.be.eqls('10px');
    expect(result[1].toString()).to.be.eqls('10%');

    // expect(parseDimensionArray('10 10')).to.be.eqls([10, 10]);
    // expect(parseDimensionArray('10')).to.be.eqls([10, 10]);
    // expect(parseDimensionArray([10, 10])).to.be.eqls([10, 10]);
    // expect(parseDimensionArray([10])).to.be.eqls([10, 10]);

    // omit some segments
    // expect(parseLineDash('10px 20px 30px')).to.be.eqls([10, 20]);
    // expect(parseLineDash([10, 20, 30])).to.be.eqls([10, 20]);
  });
});
