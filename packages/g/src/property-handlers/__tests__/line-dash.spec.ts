import chai, { expect } from 'chai';
import { parseLineDash } from '../lineDash';

describe('Property LineDash', () => {
  it('parse lineDash with unit', () => {
    expect(parseLineDash('10px 10px')).to.be.eqls([10, 10]);
    expect(parseLineDash('10 10')).to.be.eqls([10, 10]);
    expect(parseLineDash('10')).to.be.eqls([10, 10]);
    expect(parseLineDash([10, 10])).to.be.eqls([10, 10]);
    expect(parseLineDash([10])).to.be.eqls([10, 10]);

    // omit some segments
    expect(parseLineDash('10px 20px 30px')).to.be.eqls([10, 20]);
    expect(parseLineDash([10, 20, 30])).to.be.eqls([10, 20]);
  });
});
