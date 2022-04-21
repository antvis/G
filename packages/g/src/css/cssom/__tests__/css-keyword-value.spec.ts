import { expect } from 'chai';
import { CSSKeywordValue } from '../../..';

describe('CSSKeywordValueTest', () => {
  it('should create with keyword.', () => {
    const value = new CSSKeywordValue('initial');
    expect(value.value).to.eqls('initial');
    expect(value.toString()).to.eqls('initial');
  });
});
