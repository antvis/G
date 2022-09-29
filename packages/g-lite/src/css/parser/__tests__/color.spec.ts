import chai, { expect } from 'chai';
import {
  CSSGradientValue,
  CSSRGB,
  GradientType,
  mergeColors,
  parseColor,
  LinearGradient,
  RadialGradient,
  CSSUnitValue,
} from '../../';

// @ts-ignore
import chaiAlmost from 'chai-almost';
// @ts-ignore
import sinonChai from 'sinon-chai';

chai.use(chaiAlmost());
chai.use(sinonChai);

describe('Property Color', () => {
  it('should parse constant color correctly', () => {
    let result = parseColor('transparent');
    expect(result.toString()).to.be.eqls('rgba(0,0,0,0)');

    result = parseColor('red');
    expect(result.toString()).to.be.eqls('rgba(255,0,0,1)');

    result = parseColor('#fff');
    expect(result.toString()).to.be.eqls('rgba(255,255,255,1)');

    result = parseColor('rgba(255, 255, 255, 1)');
    expect(result.toString()).to.be.eqls('rgba(255,255,255,1)');

    // @see https://github.com/d3/d3-color/issues/52
    result = parseColor('rgba(0,0,0,0)');
    expect(result.toString()).to.be.eqls('rgba(0,0,0,0)');

    // invalid color
    result = parseColor('xxx');
    expect(result.toString()).to.be.eqls('rgba(0,0,0,0)');

    result = parseColor(null);
    expect(result.toString()).to.be.eqls('rgba(0,0,0,0)');

    result = parseColor(undefined);
    expect(result.toString()).to.be.eqls('rgba(0,0,0,0)');
  });

  it('should parse CSS linear-gradient() correctly', () => {
    let result = parseColor('linear-gradient(30deg, blue, green 40%, red)') as CSSGradientValue[];
    expect(result.length).to.be.eqls(1);
    expect(result[0] instanceof CSSGradientValue).to.be.true;
    expect((result[0].value as LinearGradient).angle.toString()).to.be.eqls('30deg');
    expect((result[0].value as LinearGradient).steps[0].color.toString()).to.be.eqls('blue');
    expect((result[0].value as LinearGradient).steps[0].offset.toString()).to.be.eqls('0%');
    expect((result[0].value as LinearGradient).steps[1].color.toString()).to.be.eqls('green');
    expect((result[0].value as LinearGradient).steps[1].offset.toString()).to.be.eqls('40%');
    expect((result[0].value as LinearGradient).steps[2].color.toString()).to.be.eqls('red');
    expect((result[0].value as LinearGradient).steps[2].offset.toString()).to.be.eqls('100%');

    // default
    result = parseColor('linear-gradient(blue, green 40%, red)') as CSSGradientValue[];
    expect(result.length).to.be.eqls(1);
    expect(result[0] instanceof CSSGradientValue).to.be.true;
    expect((result[0].value as LinearGradient).angle.toString()).to.be.eqls('0deg');
    expect((result[0].value as LinearGradient).steps[0].color.toString()).to.be.eqls('blue');
    expect((result[0].value as LinearGradient).steps[0].offset.toString()).to.be.eqls('0%');
    expect((result[0].value as LinearGradient).steps[1].color.toString()).to.be.eqls('green');
    expect((result[0].value as LinearGradient).steps[1].offset.toString()).to.be.eqls('40%');
    expect((result[0].value as LinearGradient).steps[2].color.toString()).to.be.eqls('red');
    expect((result[0].value as LinearGradient).steps[2].offset.toString()).to.be.eqls('100%');

    // side or corner
    result = parseColor('linear-gradient(to right, blue, green 40%, red)') as CSSGradientValue[];
    expect(result.length).to.be.eqls(1);
    expect(result[0] instanceof CSSGradientValue).to.be.true;
    expect((result[0].value as LinearGradient).angle.toString()).to.be.eqls('0deg');
    expect((result[0].value as LinearGradient).steps[0].color.toString()).to.be.eqls('blue');
    expect((result[0].value as LinearGradient).steps[0].offset.toString()).to.be.eqls('0%');
    expect((result[0].value as LinearGradient).steps[1].color.toString()).to.be.eqls('green');
    expect((result[0].value as LinearGradient).steps[1].offset.toString()).to.be.eqls('40%');
    expect((result[0].value as LinearGradient).steps[2].color.toString()).to.be.eqls('red');
    expect((result[0].value as LinearGradient).steps[2].offset.toString()).to.be.eqls('100%');

    result = parseColor('linear-gradient(to left, blue, green 40%, red)') as CSSGradientValue[];
    expect(result.length).to.be.eqls(1);
    expect(result[0] instanceof CSSGradientValue).to.be.true;
    expect((result[0].value as LinearGradient).angle.toString()).to.be.eqls('180deg');
    expect((result[0].value as LinearGradient).steps[0].color.toString()).to.be.eqls('blue');
    expect((result[0].value as LinearGradient).steps[0].offset.toString()).to.be.eqls('0%');
    expect((result[0].value as LinearGradient).steps[1].color.toString()).to.be.eqls('green');
    expect((result[0].value as LinearGradient).steps[1].offset.toString()).to.be.eqls('40%');
    expect((result[0].value as LinearGradient).steps[2].color.toString()).to.be.eqls('red');
    expect((result[0].value as LinearGradient).steps[2].offset.toString()).to.be.eqls('100%');

    result = parseColor(
      'linear-gradient(to right bottom, blue, green 40%, red)',
    ) as CSSGradientValue[];
    expect(result.length).to.be.eqls(1);
    expect(result[0] instanceof CSSGradientValue).to.be.true;
    expect((result[0].value as LinearGradient).angle.toString()).to.be.eqls('45deg');
    expect((result[0].value as LinearGradient).steps[0].color.toString()).to.be.eqls('blue');
    expect((result[0].value as LinearGradient).steps[0].offset.toString()).to.be.eqls('0%');
    expect((result[0].value as LinearGradient).steps[1].color.toString()).to.be.eqls('green');
    expect((result[0].value as LinearGradient).steps[1].offset.toString()).to.be.eqls('40%');
    expect((result[0].value as LinearGradient).steps[2].color.toString()).to.be.eqls('red');
    expect((result[0].value as LinearGradient).steps[2].offset.toString()).to.be.eqls('100%');

    // space color stop
    result = parseColor('linear-gradient(to right bottom, blue, green, red)') as CSSGradientValue[];
    expect(result.length).to.be.eqls(1);
    expect(result[0] instanceof CSSGradientValue).to.be.true;
    expect((result[0].value as LinearGradient).angle.toString()).to.be.eqls('45deg');
    expect((result[0].value as LinearGradient).steps[0].color.toString()).to.be.eqls('blue');
    expect((result[0].value as LinearGradient).steps[0].offset.toString()).to.be.eqls('0%');
    expect((result[0].value as LinearGradient).steps[1].color.toString()).to.be.eqls('green');
    expect((result[0].value as LinearGradient).steps[1].offset.toString()).to.be.eqls('50%');
    expect((result[0].value as LinearGradient).steps[2].color.toString()).to.be.eqls('red');
    expect((result[0].value as LinearGradient).steps[2].offset.toString()).to.be.eqls('100%');

    // multiple gradients
    result = parseColor(
      'linear-gradient(to right bottom, blue, green, red),linear-gradient(to right bottom, blue, green, red)',
    ) as CSSGradientValue[];
    expect(result.length).to.be.eqls(2);
    expect(result[0] instanceof CSSGradientValue).to.be.true;
    expect((result[0].value as LinearGradient).angle.toString()).to.be.eqls('45deg');
    expect((result[0].value as LinearGradient).steps[0].color.toString()).to.be.eqls('blue');
    expect((result[0].value as LinearGradient).steps[0].offset.toString()).to.be.eqls('0%');
    expect((result[0].value as LinearGradient).steps[1].color.toString()).to.be.eqls('green');
    expect((result[0].value as LinearGradient).steps[1].offset.toString()).to.be.eqls('50%');
    expect((result[0].value as LinearGradient).steps[2].color.toString()).to.be.eqls('red');
    expect((result[0].value as LinearGradient).steps[2].offset.toString()).to.be.eqls('100%');

    expect((result[1].value as LinearGradient).angle.toString()).to.be.eqls('45deg');
    expect((result[1].value as LinearGradient).steps[0].color.toString()).to.be.eqls('blue');
    expect((result[1].value as LinearGradient).steps[0].offset.toString()).to.be.eqls('0%');
    expect((result[1].value as LinearGradient).steps[1].color.toString()).to.be.eqls('green');
    expect((result[1].value as LinearGradient).steps[1].offset.toString()).to.be.eqls('50%');
    expect((result[1].value as LinearGradient).steps[2].color.toString()).to.be.eqls('red');
    expect((result[1].value as LinearGradient).steps[2].offset.toString()).to.be.eqls('100%');
  });

  it('should parse CSS radial-gradient() correctly', () => {
    let result = parseColor(
      'radial-gradient(circle at center, red, blue, green 100%)',
    ) as CSSGradientValue[];
    expect(result.length).to.be.eqls(1);
    expect(result[0] instanceof CSSGradientValue).to.be.true;
    expect((result[0].value as RadialGradient).cx.toString()).to.be.eqls('50%');
    expect((result[0].value as RadialGradient).cy.toString()).to.be.eqls('50%');
    expect((result[0].value as RadialGradient).steps[0].color.toString()).to.be.eqls('red');
    expect((result[0].value as RadialGradient).steps[0].offset.toString()).to.be.eqls('0%');
    expect((result[0].value as RadialGradient).steps[1].color.toString()).to.be.eqls('blue');
    expect((result[0].value as RadialGradient).steps[1].offset.toString()).to.be.eqls('50%');
    expect((result[0].value as RadialGradient).steps[2].color.toString()).to.be.eqls('green');
    expect((result[0].value as RadialGradient).steps[2].offset.toString()).to.be.eqls('100%');

    result = parseColor('radial-gradient(red, blue, green 100%)') as CSSGradientValue[];
    expect(result.length).to.be.eqls(1);
    expect(result[0] instanceof CSSGradientValue).to.be.true;
    expect((result[0].value as RadialGradient).cx.toString()).to.be.eqls('50%');
    expect((result[0].value as RadialGradient).cy.toString()).to.be.eqls('50%');
    expect((result[0].value as RadialGradient).steps[0].color.toString()).to.be.eqls('red');
    expect((result[0].value as RadialGradient).steps[0].offset.toString()).to.be.eqls('0%');
    expect((result[0].value as RadialGradient).steps[1].color.toString()).to.be.eqls('blue');
    expect((result[0].value as RadialGradient).steps[1].offset.toString()).to.be.eqls('50%');
    expect((result[0].value as RadialGradient).steps[2].color.toString()).to.be.eqls('green');
    expect((result[0].value as RadialGradient).steps[2].offset.toString()).to.be.eqls('100%');

    result = parseColor(
      'radial-gradient(circle at 50% 50%, red, blue, green 100%)',
    ) as CSSGradientValue[];
    expect(result.length).to.be.eqls(1);
    expect(result[0] instanceof CSSGradientValue).to.be.true;
    expect((result[0].value as RadialGradient).cx.toString()).to.be.eqls('50%');
    expect((result[0].value as RadialGradient).cy.toString()).to.be.eqls('50%');
    expect((result[0].value as RadialGradient).steps[0].color.toString()).to.be.eqls('red');
    expect((result[0].value as RadialGradient).steps[0].offset.toString()).to.be.eqls('0%');
    expect((result[0].value as RadialGradient).steps[1].color.toString()).to.be.eqls('blue');
    expect((result[0].value as RadialGradient).steps[1].offset.toString()).to.be.eqls('50%');
    expect((result[0].value as RadialGradient).steps[2].color.toString()).to.be.eqls('green');
    expect((result[0].value as RadialGradient).steps[2].offset.toString()).to.be.eqls('100%');

    // use `px`
    result = parseColor(
      'radial-gradient(circle at 50px 50px, red, blue, green 100%)',
    ) as CSSGradientValue[];
    expect(result.length).to.be.eqls(1);
    expect(result[0] instanceof CSSGradientValue).to.be.true;
    expect((result[0].value as RadialGradient).cx.toString()).to.be.eqls('50px');
    expect((result[0].value as RadialGradient).cy.toString()).to.be.eqls('50px');
    expect((result[0].value as RadialGradient).steps[0].color.toString()).to.be.eqls('red');
    expect((result[0].value as RadialGradient).steps[0].offset.toString()).to.be.eqls('0%');
    expect((result[0].value as RadialGradient).steps[1].color.toString()).to.be.eqls('blue');
    expect((result[0].value as RadialGradient).steps[1].offset.toString()).to.be.eqls('50%');
    expect((result[0].value as RadialGradient).steps[2].color.toString()).to.be.eqls('green');
    expect((result[0].value as RadialGradient).steps[2].offset.toString()).to.be.eqls('100%');

    // use size in pixel
    result = parseColor(
      'radial-gradient(circle 100px at 50px 50px, red, blue, green 100%)',
    ) as CSSGradientValue[];
    expect(result.length).to.be.eqls(1);
    expect(result[0] instanceof CSSGradientValue).to.be.true;
    expect((result[0].value as RadialGradient).size!.toString()).to.be.eqls('100px');

    // use size keyword
    result = parseColor(
      'radial-gradient(circle farthest-corner at 50px 50px, red, blue, green 100%)',
    ) as CSSGradientValue[];
    expect(result.length).to.be.eqls(1);
    expect(result[0] instanceof CSSGradientValue).to.be.true;
    expect((result[0].value as RadialGradient).size!.toString()).to.be.eqls('farthest-corner');

    // multiple gradients
    result = parseColor(
      'radial-gradient(circle at 50% 50%, red, blue, green 100%), radial-gradient(circle at 50% 50%, red, blue, green 100%)',
    ) as CSSGradientValue[];
    expect(result.length).to.be.eqls(2);
    expect(result[0] instanceof CSSGradientValue).to.be.true;
    expect((result[0].value as RadialGradient).cx.toString()).to.be.eqls('50%');
    expect((result[0].value as RadialGradient).cy.toString()).to.be.eqls('50%');
    expect((result[0].value as RadialGradient).steps[0].color.toString()).to.be.eqls('red');
    expect((result[0].value as RadialGradient).steps[0].offset.toString()).to.be.eqls('0%');
    expect((result[0].value as RadialGradient).steps[1].color.toString()).to.be.eqls('blue');
    expect((result[0].value as RadialGradient).steps[1].offset.toString()).to.be.eqls('50%');
    expect((result[0].value as RadialGradient).steps[2].color.toString()).to.be.eqls('green');
    expect((result[0].value as RadialGradient).steps[2].offset.toString()).to.be.eqls('100%');

    expect((result[1].value as RadialGradient).cx.toString()).to.be.eqls('50%');
    expect((result[1].value as RadialGradient).cy.toString()).to.be.eqls('50%');
    expect((result[1].value as RadialGradient).steps[0].color.toString()).to.be.eqls('red');
    expect((result[1].value as RadialGradient).steps[0].offset.toString()).to.be.eqls('0%');
    expect((result[1].value as RadialGradient).steps[1].color.toString()).to.be.eqls('blue');
    expect((result[1].value as RadialGradient).steps[1].offset.toString()).to.be.eqls('50%');
    expect((result[1].value as RadialGradient).steps[2].color.toString()).to.be.eqls('green');
    expect((result[1].value as RadialGradient).steps[2].offset.toString()).to.be.eqls('100%');

    // TODO: multiple gradients, use 0 as 0%
    // result = parseColor(`radial-gradient(circle at 50% 0%,
    //   rgba(255,0,0,.5),
    //   rgba(255,0,0,0) 70.71%),
    // radial-gradient(circle at 6.7% 75%,
    //   rgba(0,0,255,.5),
    //   rgba(0,0,255,0) 70.71%),
    // radial-gradient(circle at 93.3% 75%,
    //   rgba(0,255,0,.5),
    //   rgba(0,255,0,0) 70.71%)`) as CSSGradientValue[];

    // result = parseColor(
    //   `radial-gradient(circle 480px at 256px 496px, rgb(196, 217, 245) 0%, rgb(50, 80, 176) 50%, rgb(41, 47, 117) 100%)`,
    // );
    // console.log(result);
  });

  it('should parse legacy linear gradient color correctly', () => {
    let result = parseColor('l(0) 0:#ffffff 0.5:#7ec2f3 1:#1890ff') as CSSGradientValue[];
    expect(result.length).to.be.eqls(1);
    expect(result[0] instanceof CSSGradientValue).to.be.true;
    expect((result[0].value as LinearGradient).angle.toString()).to.be.eqls('0deg');
    expect((result[0].value as LinearGradient).steps[0].color.toString()).to.be.eqls('#ffffff');
    expect((result[0].value as LinearGradient).steps[0].offset.toString()).to.be.eqls('0%');

    expect((result[0].value as LinearGradient).steps[1].color.toString()).to.be.eqls('#7ec2f3');
    expect((result[0].value as LinearGradient).steps[1].offset.toString()).to.be.eqls('50%');

    expect((result[0].value as LinearGradient).steps[2].color.toString()).to.be.eqls('#1890ff');
    expect((result[0].value as LinearGradient).steps[2].offset.toString()).to.be.eqls('100%');
  });

  it('should parse legacy radial gradient color correctly', () => {
    let result = parseColor('r(0.5, 0.5, 0.1) 0:#ffffff 1:#1890ff') as CSSGradientValue[];
    expect(result.length).to.be.eqls(1);
    expect(result[0] instanceof CSSGradientValue).to.be.true;
    expect((result[0].value as RadialGradient).cx.toString()).to.be.eqls('50%');
    expect((result[0].value as RadialGradient).cy.toString()).to.be.eqls('50%');
    expect((result[0].value as RadialGradient).steps[0].color.toString()).to.be.eqls('#ffffff');
    expect((result[0].value as RadialGradient).steps[0].offset.toString()).to.be.eqls('0%');
    expect((result[0].value as RadialGradient).steps[1].color.toString()).to.be.eqls('#1890ff');
    expect((result[0].value as RadialGradient).steps[1].offset.toString()).to.be.eqls('100%');
  });

  it('should merge constant colors correctly', () => {
    const [left, right, format] = mergeColors(new CSSRGB(255, 0, 0, 1), new CSSRGB(255, 0, 0, 1));

    expect(left).to.be.eqls([255, 0, 0, 1]);
    expect(right).to.be.eqls([255, 0, 0, 1]);
    expect(format([0, 0, 0, 1])).to.be.eqls('rgba(0,0,0,1)');
  });

  it('should not merge constant color with gradient', () => {
    const result = mergeColors(
      new CSSRGB(255, 0, 0, 1),
      new CSSGradientValue(GradientType.LinearGradient, {
        steps: [
          [0, '#ffffff'],
          [0.5, '#7ec2f3'],
          [1, '#1890ff'],
        ],
        angle: new CSSUnitValue(0, 'deg'),
      }),
    );

    expect(result).to.be.undefined;
  });
});
