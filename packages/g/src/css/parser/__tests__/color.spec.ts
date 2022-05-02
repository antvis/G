import chai, { expect } from 'chai';
// @ts-ignore
import chaiAlmost from 'chai-almost';
// @ts-ignore
import sinon from 'sinon';
// @ts-ignore
import sinonChai from 'sinon-chai';
import {
  CSSGradientValue,
  CSSRGB,
  Rect,
  Circle,
  parseColor,
  mergeColors,
  GradientPatternType,
} from '@antv/g';

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
    x: 100,
    y: 100,
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
  });

  it('should parse linear gradient color correctly', () => {
    let result = parseColor('l(0) 0:#ffffff 0.5:#7ec2f3 1:#1890ff') as CSSGradientValue;
    expect(result instanceof CSSGradientValue).to.be.true;
    expect(result.value).to.be.eqls({
      hash: 'l(0) 0:#ffffff 0.5:#7ec2f3 1:#1890ff',
      steps: [
        ['0', '#ffffff'],
        ['0.5', '#7ec2f3'],
        ['1', '#1890ff'],
      ],
      x0: 0,
      x1: 1,
      y0: 0,
      y1: 0,
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
      new CSSGradientValue(GradientPatternType.LinearGradient, {
        hash: 'l(0) 0:#ffffff 0.5:#7ec2f3 1:#1890ff',
        steps: [
          ['0', '#ffffff'],
          ['0.5', '#7ec2f3'],
          ['1', '#1890ff'],
        ],
        x0: 0,
        x1: 1,
        y0: 0,
        y1: 0,
      }),
    );

    expect(result).to.be.undefined;
  });
});
