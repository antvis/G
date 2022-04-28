import chai, { expect } from 'chai';
import { toFontString } from '../text';
import { CSS, CSSKeywordValue } from '../..';

describe('Text utils', () => {
  it('should convert font string correctly', () => {
    expect(
      toFontString({
        fontSize: CSS.px(12),
        fontFamily: 'sans-serif',
        fontStyle: new CSSKeywordValue('normal'),
        fontWeight: new CSSKeywordValue('normal'),
        fontVariant: new CSSKeywordValue('normal'),
      }),
    ).eqls('normal normal normal 12px sans-serif');

    expect(
      toFontString({
        fontSize: CSS.px(12),
        fontFamily: 'sans-serif',
        fontStyle: new CSSKeywordValue('normal'),
        fontWeight: new CSSKeywordValue('normal'),
        fontVariant: new CSSKeywordValue('normal'),
      }),
    ).eqls('normal normal normal 12px sans-serif');

    expect(
      toFontString({
        fontSize: CSS.px(12),
        fontFamily: 'sans-serif,Yahei',
        fontStyle: new CSSKeywordValue('normal'),
        fontWeight: new CSSKeywordValue('normal'),
        fontVariant: new CSSKeywordValue('normal'),
      }),
    ).eqls('normal normal normal 12px sans-serif,"Yahei"');

    expect(
      toFontString({
        fontSize: CSS.px(12),
        fontFamily: 'sans-serif,"Yahei"',
        fontStyle: new CSSKeywordValue('normal'),
        fontWeight: new CSSKeywordValue('normal'),
        fontVariant: new CSSKeywordValue('normal'),
      }),
    ).eqls('normal normal normal 12px sans-serif,"Yahei"');
  });
});
