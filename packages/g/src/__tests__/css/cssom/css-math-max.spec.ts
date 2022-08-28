import { CSS, CSSMathMax, CSSStyleValueType } from '@antv/g';
import { expect } from 'chai';

describe('CSSMathMax', () => {
  it('should get max numeric correctly.', () => {
    const number = CSS.number(2);
    let max = number.max(CSS.number(0), CSS.number(3));
    expect(max.toString()).to.eqls('3');

    max = number.max(CSS.px(2));
    expect(max.toString()).to.eqls('max(2, 2px)');
    expect(max.getType()).to.be.eqls(CSSStyleValueType.kMaxType);
    expect((max as CSSMathMax).clone().toString()).to.eqls('max(2, 2px)');
  });
});
