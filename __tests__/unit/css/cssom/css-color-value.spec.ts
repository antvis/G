import { CSSRGB, CSSStyleValueType } from '../../../../packages/g-lite/src/css';

describe('CSSColorValueTest', () => {
  it('should create with rgb.', () => {
    const value = new CSSRGB(0, 0, 0);
    expect(value.toString()).toBe('rgba(0,0,0,1)');
    expect(value.getType()).toBe(CSSStyleValueType.kColorType);
    expect(value.to('rgb')).toBe(value);
  });
});
