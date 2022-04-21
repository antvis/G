import { expect } from 'chai';
import { CSSTranslate, CSSUnitValue } from '../../..';

describe('CSSTransformValueTest', () => {
  it('should create with translate()', () => {
    const translate2D = new CSSTranslate(
      new CSSUnitValue(10, 'px'),
      new CSSUnitValue(20, 'px'),
      new CSSUnitValue(0, 'px'),
      true,
    );
    // const translate2DMatrix = translate2D.toMatrix();

    const translate3D = new CSSTranslate(
      new CSSUnitValue(10, 'px'),
      new CSSUnitValue(20, 'px'),
      new CSSUnitValue(30, 'px'),
      false,
    );
    // const translate3DMatrix = translate3D.toMatrix();

    expect(translate2D.is2D).to.eqls(true);
    expect(translate3D.is2D).to.eqls(false);
    // expect(translate2DMatrix.is2D).to.eqls(true);
    // expect(translate3DMatrix.is2D).to.eqls(false);
  });
});
