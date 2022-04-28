import { expect } from 'chai';
import { CSSRGB } from '../../..';

describe('CSSColorValueTest', () => {
  it('should create with rgb.', () => {
    const value = new CSSRGB(0, 0, 0);
    expect(value.toString()).to.eqls('rgba(0,0,0,1)');
  });
});
