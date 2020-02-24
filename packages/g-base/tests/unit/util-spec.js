import { expect } from 'chai';
import { getTextHeight, getLineSpaceing, getTextWidth, assembleFont } from '../../src/util/text';
import { getOffScreenContext } from '../../src/util/offscreen';

describe('get offscreen', () => {
  it('offscreen', () => {
    const context = getOffScreenContext();
    expect(context).not.eql(null);
    expect(getOffScreenContext()).eql(context); // 单例
  });
});
describe('test text util', () => {
  it('getLineSpaceing', () => {
    expect(getLineSpaceing(12)).eql(12 * 0.14);
    expect(getLineSpaceing(12, 14)).eql(2);
  });
  it('get text height', () => {
    expect(getTextHeight('123', 12)).eql(12);
    expect(getTextHeight('123\n345', 12)).eql(12 * 2 + 12 * 0.14);
    expect(getTextHeight('123', 12, 14)).eql(12);
    expect(getTextHeight('123\n345', 12, 14)).eql(12 * 2 + 2);
  });
  it('get text width', () => {
    const font = 'sans-serif 12px';
    const context = getOffScreenContext();
    context.save();
    context.font = font;
    expect(getTextWidth('', font)).eql(0);
    expect(getTextWidth('123', font)).eql(context.measureText('123').width);
    expect(getTextWidth('123\n22222', font)).eql(context.measureText('22222').width);
    context.restore();
  });
  it('assembleFont', () => {
    expect(assembleFont({ fontSize: 12, fontFamily: 'sans-serif' })).eql('12px sans-serif');

    expect(assembleFont({ fontSize: 12, fontWeight: 400, fontFamily: 'sans-serif' })).eql('400 12px sans-serif');
  });
});
