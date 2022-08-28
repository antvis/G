import {
  Circle,
  CSSGradientValue,
  CSSRGB,
  GradientType,
  mergeColors,
  parseColor,
  Rect,
} from '@antv/g';
import chai, { expect } from 'chai';
// @ts-ignore
import chaiAlmost from 'chai-almost';
// @ts-ignore
import sinonChai from 'sinon-chai';

chai.use(chaiAlmost());
chai.use(sinonChai);

const rect = new Rect({
  style: {
    x: 100,
    y: 100,
    width: 200,
    height: 200,
  },
});

const circle = new Circle({
  style: {
    cx: 100,
    cy: 100,
    r: 100,
  },
});

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
    expect(result[0].value).to.be.eqls({
      angle: 30,
      hash: 'linear-gradient(30deg, blue, green 40%, red)',
      steps: [
        [0, 'blue'],
        [0.4, 'green'],
        [1, 'red'],
      ],
    });

    // default
    result = parseColor('linear-gradient(blue, green 40%, red)') as CSSGradientValue[];
    expect(result.length).to.be.eqls(1);
    expect(result[0] instanceof CSSGradientValue).to.be.true;
    expect(result[0].value).to.be.eqls({
      angle: 0,
      hash: 'linear-gradient(blue, green 40%, red)',
      steps: [
        [0, 'blue'],
        [0.4, 'green'],
        [1, 'red'],
      ],
    });

    // side or corner
    result = parseColor('linear-gradient(to right, blue, green 40%, red)') as CSSGradientValue[];
    expect(result.length).to.be.eqls(1);
    expect(result[0] instanceof CSSGradientValue).to.be.true;
    expect(result[0].value).to.be.eqls({
      angle: 0,
      hash: 'linear-gradient(to right, blue, green 40%, red)',
      steps: [
        [0, 'blue'],
        [0.4, 'green'],
        [1, 'red'],
      ],
    });

    result = parseColor('linear-gradient(to left, blue, green 40%, red)') as CSSGradientValue[];
    expect(result.length).to.be.eqls(1);
    expect(result[0] instanceof CSSGradientValue).to.be.true;
    expect(result[0].value).to.be.eqls({
      angle: 180,
      hash: 'linear-gradient(to left, blue, green 40%, red)',
      steps: [
        [0, 'blue'],
        [0.4, 'green'],
        [1, 'red'],
      ],
    });

    result = parseColor(
      'linear-gradient(to right bottom, blue, green 40%, red)',
    ) as CSSGradientValue[];
    expect(result.length).to.be.eqls(1);
    expect(result[0] instanceof CSSGradientValue).to.be.true;
    expect(result[0].value).to.be.eqls({
      angle: 45,
      hash: 'linear-gradient(to right bottom, blue, green 40%, red)',
      steps: [
        [0, 'blue'],
        [0.4, 'green'],
        [1, 'red'],
      ],
    });

    // space color stop
    result = parseColor('linear-gradient(to right bottom, blue, green, red)') as CSSGradientValue[];
    expect(result.length).to.be.eqls(1);
    expect(result[0] instanceof CSSGradientValue).to.be.true;
    expect(result[0].value).to.be.eqls({
      angle: 45,
      hash: 'linear-gradient(to right bottom, blue, green, red)',
      steps: [
        [0, 'blue'],
        [0.5, 'green'],
        [1, 'red'],
      ],
    });

    // multiple gradients
    result = parseColor(
      'linear-gradient(to right bottom, blue, green, red),linear-gradient(to right bottom, blue, green, red)',
    ) as CSSGradientValue[];
    expect(result.length).to.be.eqls(2);
    expect(result[0] instanceof CSSGradientValue).to.be.true;
    expect(result[0].value).to.be.eqls({
      angle: 45,
      hash: 'linear-gradient(to right bottom, blue, green, red),linear-gradient(to right bottom, blue, green, red)',
      steps: [
        [0, 'blue'],
        [0.5, 'green'],
        [1, 'red'],
      ],
    });
  });

  it('should parse CSS radial-gradient() correctly', () => {
    let result = parseColor(
      'radial-gradient(circle at center, red, blue, green 100%)',
    ) as CSSGradientValue[];
    expect(result.length).to.be.eqls(1);
    expect(result[0] instanceof CSSGradientValue).to.be.true;
    expect(result[0].value).to.be.eqls({
      cx: 0.5,
      cy: 0.5,
      hash: 'radial-gradient(circle at center, red, blue, green 100%)',
      steps: [
        [0, 'red'],
        [0.5, 'blue'],
        [1, 'green'],
      ],
    });

    result = parseColor('radial-gradient(red, blue, green 100%)') as CSSGradientValue[];
    expect(result.length).to.be.eqls(1);
    expect(result[0] instanceof CSSGradientValue).to.be.true;
    expect(result[0].value).to.be.eqls({
      cx: 0.5,
      cy: 0.5,
      hash: 'radial-gradient(red, blue, green 100%)',
      steps: [
        [0, 'red'],
        [0.5, 'blue'],
        [1, 'green'],
      ],
    });

    result = parseColor(
      'radial-gradient(circle at 50% 50%, red, blue, green 100%)',
    ) as CSSGradientValue[];
    expect(result.length).to.be.eqls(1);
    expect(result[0] instanceof CSSGradientValue).to.be.true;
    expect(result[0].value).to.be.eqls({
      cx: 0.5,
      cy: 0.5,
      hash: 'radial-gradient(circle at 50% 50%, red, blue, green 100%)',
      steps: [
        [0, 'red'],
        [0.5, 'blue'],
        [1, 'green'],
      ],
    });
  });

  it('should parse legacy linear gradient color correctly', () => {
    let result = parseColor('l(0) 0:#ffffff 0.5:#7ec2f3 1:#1890ff') as CSSGradientValue[];
    expect(result.length).to.be.eqls(1);
    expect(result[0] instanceof CSSGradientValue).to.be.true;
    expect(result[0].value).to.be.eqls({
      angle: 0,
      hash: 'l(0) 0:#ffffff 0.5:#7ec2f3 1:#1890ff',
      steps: [
        [0, '#ffffff'],
        [0.5, '#7ec2f3'],
        [1, '#1890ff'],
      ],
    });
  });

  it('should parse legacy radial gradient color correctly', () => {
    let result = parseColor('r(0.5, 0.5, 0.1) 0:#ffffff 1:#1890ff') as CSSGradientValue[];
    expect(result.length).to.be.eqls(1);
    expect(result[0] instanceof CSSGradientValue).to.be.true;
    expect(result[0].value).to.be.eqls({
      cx: 0.5,
      cy: 0.5,
      hash: 'r(0.5, 0.5, 0.1) 0:#ffffff 1:#1890ff',
      steps: [
        [0, '#ffffff'],
        [1, '#1890ff'],
      ],
    });
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
        hash: 'l(0) 0:#ffffff 0.5:#7ec2f3 1:#1890ff',
        steps: [
          [0, '#ffffff'],
          [0.5, '#7ec2f3'],
          [1, '#1890ff'],
        ],
        angle: 0,
      }),
    );

    expect(result).to.be.undefined;
  });
});
