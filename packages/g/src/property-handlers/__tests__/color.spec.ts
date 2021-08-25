import chai, { expect } from 'chai';
// @ts-ignore
import chaiAlmost from 'chai-almost';
// @ts-ignore
import sinon from 'sinon';
// @ts-ignore
import sinonChai from 'sinon-chai';
import { Rect, Circle } from '../..';
import { parseColor, mergeColors, PARSED_COLOR_TYPE } from '../color';

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
    expect(parseColor('transparent', null)).to.be.eqls({
      type: PARSED_COLOR_TYPE.Constant,
      value: [0, 0, 0, 0],
      formatted: 'rgba(0,0,0,0)',
    });
    expect(parseColor('red', null)).to.be.eqls({
      type: PARSED_COLOR_TYPE.Constant,
      value: [1, 0, 0, 1],
      formatted: 'rgba(255,0,0,1)',
    });
    expect(parseColor('#fff', null)).to.be.eqls({
      type: PARSED_COLOR_TYPE.Constant,
      value: [1, 1, 1, 1],
      formatted: 'rgba(255,255,255,1)',
    });
    expect(parseColor('rgba(255, 255, 255, 1)', null)).to.be.eqls({
      type: PARSED_COLOR_TYPE.Constant,
      value: [1, 1, 1, 1],
      formatted: 'rgba(255,255,255,1)',
    });
    // invalid color
    expect(parseColor('xxx', null)).to.be.eqls({
      type: PARSED_COLOR_TYPE.Constant,
      value: [0, 0, 0, 0],
      formatted: 'rgba(0,0,0,0)',
    });
  });

  it('should parse linear gradient color correctly', () => {
    expect(parseColor('l(0) 0:#ffffff 0.5:#7ec2f3 1:#1890ff', rect)).to.be.eqls({
      type: PARSED_COLOR_TYPE.LinearGradient,
      value: {
        steps: [
          ['0', '#ffffff'],
          ['0.5', '#7ec2f3'],
          ['1', '#1890ff'],
        ],
        x0: 0,
        x1: 1,
        y0: 0,
        y1: 0,
      },
      formatted: '',
    });

    expect(parseColor('l(0) 0:#ffffff 0.5:#7ec2f3 1:#1890ff', circle)).to.be.eqls({
      type: PARSED_COLOR_TYPE.LinearGradient,
      value: {
        steps: [
          ['0', '#ffffff'],
          ['0.5', '#7ec2f3'],
          ['1', '#1890ff'],
        ],
        x0: 0,
        x1: 1,
        y0: 0,
        y1: 0,
      },
      formatted: '',
    });
  });

  it('should merge constant color correctly', () => {
    const [left, right, format] = mergeColors(
      {
        type: PARSED_COLOR_TYPE.Constant,
        value: [1, 0, 0, 1],
        formatted: 'rgba(255,0,0,1)',
      },
      {
        type: PARSED_COLOR_TYPE.Constant,
        value: [1, 0, 0, 1],
        formatted: 'rgba(255,0,0,1)',
      },
      null,
    )!;

    expect(format([0, 0, 0, 1])).to.be.eqls('rgba(0,0,0,1)');
  });

  it('should not merge constant color with gradient', () => {
    const result = mergeColors(
      {
        type: PARSED_COLOR_TYPE.Constant,
        value: [1, 0, 0, 1],
        formatted: 'rgba(255,0,0,1)',
      },
      {
        type: PARSED_COLOR_TYPE.LinearGradient,
        value: {
          steps: [
            ['0', '#ffffff'],
            ['0.5', '#7ec2f3'],
            ['1', '#1890ff'],
          ],
          x0: 0,
          x1: 1,
          y0: 0,
          y1: 0,
        },
        formatted: '',
      },
      null,
    );

    expect(result).to.be.undefined;
  });
});
