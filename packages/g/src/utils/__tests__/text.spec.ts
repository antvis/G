import chai, { expect } from 'chai';
import { toFontString } from '../text';

describe('Text utils', () => {
  it('should convert font string correctly', () => {
    expect(
      toFontString({
        fontSize: 12,
        fontFamily: 'sans-serif',
        fontStyle: 'normal',
        fontWeight: 'normal',
        fontVariant: 'normal',
      }),
    ).eqls('normal normal normal 12px sans-serif');

    expect(
      toFontString({
        // @ts-ignore
        fontSize: '12px',
        fontFamily: 'sans-serif',
        fontStyle: 'normal',
        fontWeight: 'normal',
        fontVariant: 'normal',
      }),
    ).eqls('normal normal normal 12px sans-serif');

    expect(
      toFontString({
        fontSize: 12,
        fontFamily: 'sans-serif,Yahei',
        fontStyle: 'normal',
        fontWeight: 'normal',
        fontVariant: 'normal',
      }),
    ).eqls('normal normal normal 12px sans-serif,"Yahei"');

    expect(
      toFontString({
        fontSize: 12,
        fontFamily: 'sans-serif,"Yahei"',
        fontStyle: 'normal',
        fontWeight: 'normal',
        fontVariant: 'normal',
      }),
    ).eqls('normal normal normal 12px sans-serif,"Yahei"');
  });
});
