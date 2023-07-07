import {
  CSSKeywordValue,
  CSSStyleValueType,
} from '../../../../packages/g-lite/src/css';

describe('CSSKeywordValueTest', () => {
  it('should create with keyword.', () => {
    const value = new CSSKeywordValue('initial');
    expect(value.value).toBe('initial');
    expect(value.getType()).toBe(CSSStyleValueType.kKeywordType);
    expect(value.toString()).toBe('initial');
  });
});
