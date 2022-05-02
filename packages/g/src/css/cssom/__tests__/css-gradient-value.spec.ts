import { expect } from 'chai';
import { CSSGradientValue, GradientPatternType, CSSStyleValueType } from '@antv/g';

describe('CSSGradientValueTest', () => {
  it('should create linear gradient correctly.', () => {
    const value = new CSSGradientValue(GradientPatternType.LinearGradient, {
      x0: 0,
      y0: 0,
      x1: 0,
      y1: 0,
      steps: [['0', '1']],
      hash: '',
    });
    expect(value.toString()).to.eqls('linear-gradient(0,1)');
    expect(value.getType()).to.eqls(CSSStyleValueType.kColorType);

    const cloned = value.clone();
    expect(cloned.toString()).to.eqls('linear-gradient(0,1)');
  });

  it('should create radial gradient correctly.', () => {
    const value = new CSSGradientValue(GradientPatternType.RadialGradient, {
      x0: 0,
      y0: 0,
      x1: 0,
      y1: 0,
      steps: [['0', '1']],
      hash: '',
    });
    expect(value.toString()).to.eqls('radial-gradient(0,1)');
    expect(value.getType()).to.eqls(CSSStyleValueType.kColorType);

    const cloned = value.clone();
    expect(cloned.toString()).to.eqls('radial-gradient(0,1)');
  });

  it('should create pattern correctly.', () => {
    const value = new CSSGradientValue(GradientPatternType.Pattern, {
      src: 'xxx',
      hash: '',
      repetition: '',
    });
    expect(value.toString()).to.eqls('url(xxx)');
    expect(value.getType()).to.eqls(CSSStyleValueType.kColorType);

    const cloned = value.clone();
    expect(cloned.toString()).to.eqls('url(xxx)');
  });

  it('should create constant correctly.', () => {
    const value = new CSSGradientValue(GradientPatternType.Constant, {
      src: 'xxx',
      hash: '',
      repetition: '',
    });
    expect(value.toString()).to.eqls('');
  });
});
