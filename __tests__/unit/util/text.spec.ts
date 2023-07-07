import { toFontString } from '../../../packages/g-lite/src/utils';

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
    ).toBe('normal normal normal 12px sans-serif');

    expect(
      toFontString({
        fontSize: 12,
        fontFamily: 'sans-serif,Yahei',
        fontStyle: 'normal',
        fontWeight: 'normal',
        fontVariant: 'normal',
      }),
    ).toBe('normal normal normal 12px sans-serif,"Yahei"');

    expect(
      toFontString({
        fontSize: 12,
        fontFamily: 'sans-serif,"Yahei"',
        fontStyle: 'normal',
        fontWeight: 'normal',
        fontVariant: 'normal',
      }),
    ).toBe('normal normal normal 12px sans-serif,"Yahei"');
  });
});
