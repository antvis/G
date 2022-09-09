import { expect } from 'chai';
import { CSSRGB, CSSStyleValueType } from '../';

describe('CSSColorValueTest', () => {
  it('should create with rgb.', () => {
    const value = new CSSRGB(0, 0, 0);
    expect(value.toString()).to.eqls('rgba(0,0,0,1)');
    expect(value.getType()).to.eqls(CSSStyleValueType.kColorType);
    expect(value.to('rgb')).to.eqls(value);
  });
});
