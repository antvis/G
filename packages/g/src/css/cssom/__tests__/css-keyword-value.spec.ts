import { expect } from 'chai';
import { CSSKeywordValue, CSSStyleValueType } from '@antv/g';

describe('CSSKeywordValueTest', () => {
  it('should create with keyword.', () => {
    const value = new CSSKeywordValue('initial');
    expect(value.value).to.eqls('initial');
    expect(value.getType()).to.eqls(CSSStyleValueType.kKeywordType);
    expect(value.toString()).to.eqls('initial');
  });
});
