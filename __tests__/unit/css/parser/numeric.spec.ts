import { expect } from 'chai';
import {
  numberToString,
  parseNumber,
  parseNumberList,
  mergeNumbers,
  mergeNumberLists,
  clampedMergeNumbers,
} from '../../../../packages/g-lite/src/css';

describe('Property Numeric', () => {
  it('should parse single numeric value correctly.', () => {
    expect(numberToString(10).toString()).to.be.eqls('10');

    expect(parseNumber(2).toString()).to.be.eqls('2');
    expect(parseNumber('2').toString()).to.be.eqls('2');
    expect(parseNumber('2.5').toString()).to.be.eqls('2.5');
    expect(parseNumber('xxxx').toString()).to.be.eqls('0');
  });

  it('should parse numeric list correctly.', () => {
    expect(parseNumberList('1 2 3').length).to.be.eqls(3);
    expect(parseNumberList([1, 2, 3]).length).to.be.eqls(3);
  });

  it('should merge numeric values correctly.', () => {
    const [left, right, toString] = mergeNumbers(1, 2);
    expect(left).to.be.eqls(1);
    expect(right).to.be.eqls(2);
    expect(toString(1)).to.be.eqls('1');
  });

  it('should clamp and merge numeric values correctly.', () => {
    const mergeFunc = clampedMergeNumbers(0, 10);
    const [left, right, toString] = mergeFunc(-1, 20);
    expect(left).to.be.eqls(-1);
    expect(right).to.be.eqls(20);
    expect(toString(-1)).to.be.eqls('0');
    expect(toString(5)).to.be.eqls('5');
    expect(toString(20)).to.be.eqls('10');
  });

  it('should merge numeric list values correctly.', () => {
    const [left, right, toString] = mergeNumberLists([1], [2]);
    expect(left).to.be.eqls([1]);
    expect(right).to.be.eqls([2]);
    expect(toString([5])).to.be.eqls([5]);

    const returnValue = mergeNumberLists([1, 2], [2]);
    expect(returnValue).to.undefined;
  });
});
