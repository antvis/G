import chai, { expect } from 'chai';
import { parseLength, parseAngle, parseLengthOrPercent, mergeDimensions } from '../dimension';
import { Circle } from '../..';

const circle = new Circle({
  style: {
    x: 100,
    y: 100,
    r: 100,
  },
});

describe('Property Dimension', () => {
  it('parse length with unit', () => {
    expect(parseLength('10px')).to.be.eqls({ unit: 'px', value: 10 });
    expect(parseLength('10.5px')).to.be.eqls({ unit: 'px', value: 10.5 });
    expect(parseLength('0.5px')).to.be.eqls({ unit: 'px', value: 0.5 });
  });

  it('parse length with percent', () => {
    expect(parseLengthOrPercent('10px')).to.be.eqls({ unit: 'px', value: 10 });
    expect(parseLengthOrPercent('10.5px')).to.be.eqls({ unit: 'px', value: 10.5 });
    expect(parseLengthOrPercent('0.5px')).to.be.eqls({ unit: 'px', value: 0.5 });
    expect(parseLengthOrPercent('30%')).to.be.eqls({ unit: '%', value: 30 });
    expect(parseLengthOrPercent('30.5%')).to.be.eqls({ unit: '%', value: 30.5 });
  });

  it('parse angle with unit', () => {
    expect(parseAngle('10deg')).to.be.eqls({ unit: 'deg', value: 10 });
    expect(parseAngle('10rad')).to.be.eqls({ unit: 'rad', value: 10 });
    expect(parseAngle('1turn')).to.be.eqls({ unit: 'turn', value: 1 });
    expect(parseAngle('1grad')).to.be.eqls({ unit: 'grad', value: 1 });
  });

  it('should merge length correctly', () => {
    const [left, right, format] = mergeDimensions(
      {
        unit: 'px',
        value: 10,
      },
      {
        unit: 'px',
        value: 20,
      },
    );
    expect(left).to.be.eqls(10);
    expect(right).to.be.eqls(20);
    expect(format(30)).to.be.eqls('30px');
  });

  it('should merge length with percentage and pixel correctly', () => {
    const [left, right, format] = mergeDimensions(
      {
        unit: 'px',
        value: 10,
      },
      {
        unit: '%',
        value: 20, // r = 100
      },
      true,
      circle,
      0,
    );
    expect(left).to.be.eqls(10);
    expect(right).to.be.eqls(40);
    expect(format(30)).to.be.eqls('30px');
  });

  it('should merge length with percentage correctly', () => {
    const [left, right, format] = mergeDimensions(
      {
        unit: '%',
        value: 20,
      },
      {
        unit: '%',
        value: 20, // r = 100
      },
      true,
      circle,
      0,
    );
    expect(left).to.be.eqls(40);
    expect(right).to.be.eqls(40);
    expect(format(30)).to.be.eqls('30px');
  });
});
