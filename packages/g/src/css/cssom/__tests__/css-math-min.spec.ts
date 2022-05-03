import { expect } from 'chai';
import { CSS, CSSMathMin, CSSStyleValueType } from '@antv/g';

describe('CSSMathMin', () => {
  it('should get min numeric correctly.', () => {
    const number = CSS.number(2);
    let min = number.min(CSS.number(0), CSS.number(3));
    expect(min.toString()).to.eqls('0');

    min = number.min(CSS.px(2));
    expect(min.toString()).to.eqls('min(2, 2px)');
    expect(min.getType()).to.be.eqls(CSSStyleValueType.kMinType);
    expect((min as CSSMathMin).clone().toString()).to.eqls('min(2, 2px)');
  });
});
