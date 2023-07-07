import {
  CSSGradientValue,
  CSSRGB,
  CSSUnitValue,
  GradientType,
  LinearGradient,
  RadialGradient,
  isCSSRGB,
  mergeColors,
  parseColor,
} from '../../../../packages/g-lite/src/css';

describe('Property Color', () => {
  it('should parse constant color correctly', () => {
    let result = parseColor('transparent');
    expect(result.toString()).toBe('rgba(0,0,0,0)');
    expect(isCSSRGB(result)).toBeTruthy();

    result = parseColor('red');
    expect(result.toString()).toBe('rgba(255,0,0,1)');
    expect(isCSSRGB(result)).toBeTruthy();

    result = parseColor('#fff');
    expect(result.toString()).toBe('rgba(255,255,255,1)');
    expect(isCSSRGB(result)).toBeTruthy();

    result = parseColor('rgba(255, 255, 255, 1)');
    expect(result.toString()).toBe('rgba(255,255,255,1)');
    expect(isCSSRGB(result)).toBeTruthy();

    // @see https://github.com/d3/d3-color/issues/52
    result = parseColor('rgba(0,0,0,0)');
    expect(result.toString()).toBe('rgba(0,0,0,0)');
    expect(isCSSRGB(result)).toBeTruthy();

    // invalid color
    result = parseColor('xxx');
    expect(result.toString()).toBe('rgba(0,0,0,0)');
    expect(isCSSRGB(result)).toBeTruthy();

    result = parseColor(null);
    expect(result.toString()).toBe('rgba(0,0,0,0)');
    expect(isCSSRGB(result)).toBeTruthy();

    result = parseColor(undefined);
    expect(result.toString()).toBe('rgba(0,0,0,0)');
    expect(isCSSRGB(result)).toBeTruthy();
  });

  it('should parse CSS linear-gradient() correctly', () => {
    let result = parseColor(
      'linear-gradient(30deg, blue, green 40%, red)',
    ) as CSSGradientValue[];
    expect(result.length).toBe(1);
    expect(result[0] instanceof CSSGradientValue).toBeTruthy();
    expect((result[0].value as LinearGradient).angle.toString()).toBe('30deg');
    expect((result[0].value as LinearGradient).steps[0].color.toString()).toBe(
      'blue',
    );
    expect((result[0].value as LinearGradient).steps[0].offset.toString()).toBe(
      '0%',
    );
    expect((result[0].value as LinearGradient).steps[1].color.toString()).toBe(
      'green',
    );
    expect((result[0].value as LinearGradient).steps[1].offset.toString()).toBe(
      '40%',
    );
    expect((result[0].value as LinearGradient).steps[2].color.toString()).toBe(
      'red',
    );
    expect((result[0].value as LinearGradient).steps[2].offset.toString()).toBe(
      '100%',
    );

    // default
    result = parseColor(
      'linear-gradient(blue, green 40%, red)',
    ) as CSSGradientValue[];
    expect(result.length).toBe(1);
    expect(result[0] instanceof CSSGradientValue).toBeTruthy();
    expect((result[0].value as LinearGradient).angle.toString()).toBe('0deg');
    expect((result[0].value as LinearGradient).steps[0].color.toString()).toBe(
      'blue',
    );
    expect((result[0].value as LinearGradient).steps[0].offset.toString()).toBe(
      '0%',
    );
    expect((result[0].value as LinearGradient).steps[1].color.toString()).toBe(
      'green',
    );
    expect((result[0].value as LinearGradient).steps[1].offset.toString()).toBe(
      '40%',
    );
    expect((result[0].value as LinearGradient).steps[2].color.toString()).toBe(
      'red',
    );
    expect((result[0].value as LinearGradient).steps[2].offset.toString()).toBe(
      '100%',
    );

    // side or corner
    result = parseColor(
      'linear-gradient(to right, blue, green 40%, red)',
    ) as CSSGradientValue[];
    expect(result.length).toBe(1);
    expect(result[0] instanceof CSSGradientValue).toBeTruthy();
    expect((result[0].value as LinearGradient).angle.toString()).toBe('0deg');
    expect((result[0].value as LinearGradient).steps[0].color.toString()).toBe(
      'blue',
    );
    expect((result[0].value as LinearGradient).steps[0].offset.toString()).toBe(
      '0%',
    );
    expect((result[0].value as LinearGradient).steps[1].color.toString()).toBe(
      'green',
    );
    expect((result[0].value as LinearGradient).steps[1].offset.toString()).toBe(
      '40%',
    );
    expect((result[0].value as LinearGradient).steps[2].color.toString()).toBe(
      'red',
    );
    expect((result[0].value as LinearGradient).steps[2].offset.toString()).toBe(
      '100%',
    );

    result = parseColor(
      'linear-gradient(to left, blue, green 40%, red)',
    ) as CSSGradientValue[];
    expect(result.length).toBe(1);
    expect(result[0] instanceof CSSGradientValue).toBeTruthy();
    expect((result[0].value as LinearGradient).angle.toString()).toBe('180deg');
    expect((result[0].value as LinearGradient).steps[0].color.toString()).toBe(
      'blue',
    );
    expect((result[0].value as LinearGradient).steps[0].offset.toString()).toBe(
      '0%',
    );
    expect((result[0].value as LinearGradient).steps[1].color.toString()).toBe(
      'green',
    );
    expect((result[0].value as LinearGradient).steps[1].offset.toString()).toBe(
      '40%',
    );
    expect((result[0].value as LinearGradient).steps[2].color.toString()).toBe(
      'red',
    );
    expect((result[0].value as LinearGradient).steps[2].offset.toString()).toBe(
      '100%',
    );

    result = parseColor(
      'linear-gradient(to right bottom, blue, green 40%, red)',
    ) as CSSGradientValue[];
    expect(result.length).toBe(1);
    expect(result[0] instanceof CSSGradientValue).toBeTruthy();
    expect((result[0].value as LinearGradient).angle.toString()).toBe('45deg');
    expect((result[0].value as LinearGradient).steps[0].color.toString()).toBe(
      'blue',
    );
    expect((result[0].value as LinearGradient).steps[0].offset.toString()).toBe(
      '0%',
    );
    expect((result[0].value as LinearGradient).steps[1].color.toString()).toBe(
      'green',
    );
    expect((result[0].value as LinearGradient).steps[1].offset.toString()).toBe(
      '40%',
    );
    expect((result[0].value as LinearGradient).steps[2].color.toString()).toBe(
      'red',
    );
    expect((result[0].value as LinearGradient).steps[2].offset.toString()).toBe(
      '100%',
    );

    // space color stop
    result = parseColor(
      'linear-gradient(to right bottom, blue, green, red)',
    ) as CSSGradientValue[];
    expect(result.length).toBe(1);
    expect(result[0] instanceof CSSGradientValue).toBeTruthy();
    expect((result[0].value as LinearGradient).angle.toString()).toBe('45deg');
    expect((result[0].value as LinearGradient).steps[0].color.toString()).toBe(
      'blue',
    );
    expect((result[0].value as LinearGradient).steps[0].offset.toString()).toBe(
      '0%',
    );
    expect((result[0].value as LinearGradient).steps[1].color.toString()).toBe(
      'green',
    );
    expect((result[0].value as LinearGradient).steps[1].offset.toString()).toBe(
      '50%',
    );
    expect((result[0].value as LinearGradient).steps[2].color.toString()).toBe(
      'red',
    );
    expect((result[0].value as LinearGradient).steps[2].offset.toString()).toBe(
      '100%',
    );

    // multiple gradients
    result = parseColor(
      'linear-gradient(to right bottom, blue, green, red),linear-gradient(to right bottom, blue, green, red)',
    ) as CSSGradientValue[];
    expect(result.length).toBe(2);
    expect(result[0] instanceof CSSGradientValue).toBeTruthy();
    expect((result[0].value as LinearGradient).angle.toString()).toBe('45deg');
    expect((result[0].value as LinearGradient).steps[0].color.toString()).toBe(
      'blue',
    );
    expect((result[0].value as LinearGradient).steps[0].offset.toString()).toBe(
      '0%',
    );
    expect((result[0].value as LinearGradient).steps[1].color.toString()).toBe(
      'green',
    );
    expect((result[0].value as LinearGradient).steps[1].offset.toString()).toBe(
      '50%',
    );
    expect((result[0].value as LinearGradient).steps[2].color.toString()).toBe(
      'red',
    );
    expect((result[0].value as LinearGradient).steps[2].offset.toString()).toBe(
      '100%',
    );

    expect((result[1].value as LinearGradient).angle.toString()).toBe('45deg');
    expect((result[1].value as LinearGradient).steps[0].color.toString()).toBe(
      'blue',
    );
    expect((result[1].value as LinearGradient).steps[0].offset.toString()).toBe(
      '0%',
    );
    expect((result[1].value as LinearGradient).steps[1].color.toString()).toBe(
      'green',
    );
    expect((result[1].value as LinearGradient).steps[1].offset.toString()).toBe(
      '50%',
    );
    expect((result[1].value as LinearGradient).steps[2].color.toString()).toBe(
      'red',
    );
    expect((result[1].value as LinearGradient).steps[2].offset.toString()).toBe(
      '100%',
    );
  });

  it('should parse CSS radial-gradient() correctly', () => {
    let result = parseColor(
      'radial-gradient(circle at center, red, blue, green 100%)',
    ) as CSSGradientValue[];
    expect(result.length).toBe(1);
    expect(result[0] instanceof CSSGradientValue).toBeTruthy();
    expect((result[0].value as RadialGradient).cx.toString()).toBe('50%');
    expect((result[0].value as RadialGradient).cy.toString()).toBe('50%');
    expect((result[0].value as RadialGradient).steps[0].color.toString()).toBe(
      'red',
    );
    expect((result[0].value as RadialGradient).steps[0].offset.toString()).toBe(
      '0%',
    );
    expect((result[0].value as RadialGradient).steps[1].color.toString()).toBe(
      'blue',
    );
    expect((result[0].value as RadialGradient).steps[1].offset.toString()).toBe(
      '50%',
    );
    expect((result[0].value as RadialGradient).steps[2].color.toString()).toBe(
      'green',
    );
    expect((result[0].value as RadialGradient).steps[2].offset.toString()).toBe(
      '100%',
    );

    result = parseColor(
      'radial-gradient(red, blue, green 100%)',
    ) as CSSGradientValue[];
    expect(result.length).toBe(1);
    expect(result[0] instanceof CSSGradientValue).toBeTruthy();
    expect((result[0].value as RadialGradient).cx.toString()).toBe('50%');
    expect((result[0].value as RadialGradient).cy.toString()).toBe('50%');
    expect((result[0].value as RadialGradient).steps[0].color.toString()).toBe(
      'red',
    );
    expect((result[0].value as RadialGradient).steps[0].offset.toString()).toBe(
      '0%',
    );
    expect((result[0].value as RadialGradient).steps[1].color.toString()).toBe(
      'blue',
    );
    expect((result[0].value as RadialGradient).steps[1].offset.toString()).toBe(
      '50%',
    );
    expect((result[0].value as RadialGradient).steps[2].color.toString()).toBe(
      'green',
    );
    expect((result[0].value as RadialGradient).steps[2].offset.toString()).toBe(
      '100%',
    );

    result = parseColor(
      'radial-gradient(circle at 50% 50%, red, blue, green 100%)',
    ) as CSSGradientValue[];
    expect(result.length).toBe(1);
    expect(result[0] instanceof CSSGradientValue).toBeTruthy();
    expect((result[0].value as RadialGradient).cx.toString()).toBe('50%');
    expect((result[0].value as RadialGradient).cy.toString()).toBe('50%');
    expect((result[0].value as RadialGradient).steps[0].color.toString()).toBe(
      'red',
    );
    expect((result[0].value as RadialGradient).steps[0].offset.toString()).toBe(
      '0%',
    );
    expect((result[0].value as RadialGradient).steps[1].color.toString()).toBe(
      'blue',
    );
    expect((result[0].value as RadialGradient).steps[1].offset.toString()).toBe(
      '50%',
    );
    expect((result[0].value as RadialGradient).steps[2].color.toString()).toBe(
      'green',
    );
    expect((result[0].value as RadialGradient).steps[2].offset.toString()).toBe(
      '100%',
    );

    // use `px`
    result = parseColor(
      'radial-gradient(circle at 50px 50px, red, blue, green 100%)',
    ) as CSSGradientValue[];
    expect(result.length).toBe(1);
    expect(result[0] instanceof CSSGradientValue).toBeTruthy();
    expect((result[0].value as RadialGradient).cx.toString()).toBe('50px');
    expect((result[0].value as RadialGradient).cy.toString()).toBe('50px');
    expect((result[0].value as RadialGradient).steps[0].color.toString()).toBe(
      'red',
    );
    expect((result[0].value as RadialGradient).steps[0].offset.toString()).toBe(
      '0%',
    );
    expect((result[0].value as RadialGradient).steps[1].color.toString()).toBe(
      'blue',
    );
    expect((result[0].value as RadialGradient).steps[1].offset.toString()).toBe(
      '50%',
    );
    expect((result[0].value as RadialGradient).steps[2].color.toString()).toBe(
      'green',
    );
    expect((result[0].value as RadialGradient).steps[2].offset.toString()).toBe(
      '100%',
    );

    // use size in pixel
    result = parseColor(
      'radial-gradient(circle 100px at 50px 50px, red, blue, green 100%)',
    ) as CSSGradientValue[];
    expect(result.length).toBe(1);
    expect(result[0] instanceof CSSGradientValue).toBeTruthy();
    expect((result[0].value as RadialGradient).size!.toString()).toBe('100px');

    // use size keyword
    result = parseColor(
      'radial-gradient(circle farthest-corner at 50px 50px, red, blue, green 100%)',
    ) as CSSGradientValue[];
    expect(result.length).toBe(1);
    expect(result[0] instanceof CSSGradientValue).toBeTruthy();
    expect((result[0].value as RadialGradient).size!.toString()).toBe(
      'farthest-corner',
    );

    // multiple gradients
    result = parseColor(
      'radial-gradient(circle at 50% 50%, red, blue, green 100%), radial-gradient(circle at 50% 50%, red, blue, green 100%)',
    ) as CSSGradientValue[];
    expect(result.length).toBe(2);
    expect(result[0] instanceof CSSGradientValue).toBeTruthy();
    expect((result[0].value as RadialGradient).cx.toString()).toBe('50%');
    expect((result[0].value as RadialGradient).cy.toString()).toBe('50%');
    expect((result[0].value as RadialGradient).steps[0].color.toString()).toBe(
      'red',
    );
    expect((result[0].value as RadialGradient).steps[0].offset.toString()).toBe(
      '0%',
    );
    expect((result[0].value as RadialGradient).steps[1].color.toString()).toBe(
      'blue',
    );
    expect((result[0].value as RadialGradient).steps[1].offset.toString()).toBe(
      '50%',
    );
    expect((result[0].value as RadialGradient).steps[2].color.toString()).toBe(
      'green',
    );
    expect((result[0].value as RadialGradient).steps[2].offset.toString()).toBe(
      '100%',
    );

    expect((result[1].value as RadialGradient).cx.toString()).toBe('50%');
    expect((result[1].value as RadialGradient).cy.toString()).toBe('50%');
    expect((result[1].value as RadialGradient).steps[0].color.toString()).toBe(
      'red',
    );
    expect((result[1].value as RadialGradient).steps[0].offset.toString()).toBe(
      '0%',
    );
    expect((result[1].value as RadialGradient).steps[1].color.toString()).toBe(
      'blue',
    );
    expect((result[1].value as RadialGradient).steps[1].offset.toString()).toBe(
      '50%',
    );
    expect((result[1].value as RadialGradient).steps[2].color.toString()).toBe(
      'green',
    );
    expect((result[1].value as RadialGradient).steps[2].offset.toString()).toBe(
      '100%',
    );

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
    const result = parseColor(
      'l(0) 0:#ffffff 0.5:#7ec2f3 1:#1890ff',
    ) as CSSGradientValue[];
    expect(result.length).toBe(1);
    expect(result[0] instanceof CSSGradientValue).toBeTruthy();
    expect((result[0].value as LinearGradient).angle.toString()).toBe('0deg');
    expect((result[0].value as LinearGradient).steps[0].color.toString()).toBe(
      '#ffffff',
    );
    expect((result[0].value as LinearGradient).steps[0].offset.toString()).toBe(
      '0%',
    );

    expect((result[0].value as LinearGradient).steps[1].color.toString()).toBe(
      '#7ec2f3',
    );
    expect((result[0].value as LinearGradient).steps[1].offset.toString()).toBe(
      '50%',
    );

    expect((result[0].value as LinearGradient).steps[2].color.toString()).toBe(
      '#1890ff',
    );
    expect((result[0].value as LinearGradient).steps[2].offset.toString()).toBe(
      '100%',
    );
  });

  it('should parse legacy radial gradient color correctly', () => {
    const result = parseColor(
      'r(0.5, 0.5, 0.1) 0:#ffffff 1:#1890ff',
    ) as CSSGradientValue[];
    expect(result.length).toBe(1);
    expect(result[0] instanceof CSSGradientValue).toBeTruthy();
    expect((result[0].value as RadialGradient).cx.toString()).toBe('50%');
    expect((result[0].value as RadialGradient).cy.toString()).toBe('50%');
    expect((result[0].value as RadialGradient).steps[0].color.toString()).toBe(
      '#ffffff',
    );
    expect((result[0].value as RadialGradient).steps[0].offset.toString()).toBe(
      '0%',
    );
    expect((result[0].value as RadialGradient).steps[1].color.toString()).toBe(
      '#1890ff',
    );
    expect((result[0].value as RadialGradient).steps[1].offset.toString()).toBe(
      '100%',
    );
  });

  it('should merge constant colors correctly', () => {
    // @ts-ignore
    const [left, right, format] = mergeColors(
      new CSSRGB(255, 0, 0, 1),
      new CSSRGB(255, 0, 0, 1),
    );

    expect(left).toStrictEqual([255, 0, 0, 1]);
    expect(right).toStrictEqual([255, 0, 0, 1]);
    expect(format([0, 0, 0, 1])).toBe('rgba(0,0,0,1)');
  });

  it('should not merge constant color with gradient', () => {
    const result = mergeColors(
      new CSSRGB(255, 0, 0, 1),
      // @ts-ignore
      new CSSGradientValue(GradientType.LinearGradient, {
        steps: [
          // @ts-ignore
          [0, '#ffffff'],
          // @ts-ignore
          [0.5, '#7ec2f3'],
          // @ts-ignore
          [1, '#1890ff'],
        ],
        angle: new CSSUnitValue(0, 'deg'),
      }),
    );

    expect(result).toBeUndefined();
  });
});
