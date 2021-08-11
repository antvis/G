import chai, { expect } from 'chai';
// @ts-ignore
import chaiAlmost from 'chai-almost';
// @ts-ignore
import sinon from 'sinon';
// @ts-ignore
import sinonChai from 'sinon-chai';
import { DisplayObject, Rect, Circle, Line, Polyline, SHAPE } from '../..';
import { vec3 } from 'gl-matrix';
import { Color } from '../Color';

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
    const colorParser = new Color();
    expect(colorParser.parse('red', rect)).to.be.eqls({
      type: 'constant',
      value: [1, 0, 0, 1],
    });
    expect(colorParser.parse('#fff', rect)).to.be.eqls({
      type: 'constant',
      value: [1, 1, 1, 1],
    });
    expect(colorParser.parse('rgba(255, 255, 255, 1)', rect)).to.be.eqls({
      type: 'constant',
      value: [1, 1, 1, 1],
    });
    // invalid color
    expect(colorParser.parse('xxx', rect)).to.be.eqls({
      type: 'constant',
      value: [0, 0, 0, 0],
    });
  });

  it('should parse linear gradient color correctly', () => {
    const colorParser = new Color();
    expect(colorParser.parse('l(0) 0:#ffffff 0.5:#7ec2f3 1:#1890ff', rect)).to.be.eqls({
      "type": "lineGradient",
      "value": {
        "steps": [
          ["0", "#ffffff"],
          ["0.5", "#7ec2f3"],
          ["1", "#1890ff"]
        ], "x0": 100, "x1": 300, "y0": 100, "y1": 100
      }
    });

    expect(colorParser.parse('l(0) 0:#ffffff 0.5:#7ec2f3 1:#1890ff', circle)).to.be.eqls({
      "type": "lineGradient",
      "value": {
        "steps": [
          ["0", "#ffffff"],
          ["0.5", "#7ec2f3"],
          ["1", "#1890ff"]
        ], "x0": 0, "x1": 200, "y0": 0, "y1": 0
      }
    });
  });
});
