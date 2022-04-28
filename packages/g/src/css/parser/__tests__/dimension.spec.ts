import chai, { expect } from 'chai';
import {
  Circle,
  Group,
  parseLength,
  parseAngle,
  parseLengthOrPercentage,
  mergeDimensions,
} from '../../..';

const circle = new Circle({
  style: {
    x: 100,
    y: 100,
    r: 100,
  },
});

describe('Property Dimension', () => {
  it('parse length with unit', () => {
    let result = parseLength('10px');
    expect(result.toString()).to.be.eqls('10px');

    result = parseLength('10.5px');
    expect(result.toString()).to.be.eqls('10.5px');

    result = parseLength('0.5px');
    expect(result.toString()).to.be.eqls('0.5px');

    result = parseLength('0');
    expect(result.toString()).to.be.eqls('0px');
  });

  // it('parse length with percent', () => {
  //   expect(parseLengthOrPercentage('10px')).to.be.eqls({ unit: 'px', value: 10 });
  //   expect(parseLengthOrPercentage('10.5px')).to.be.eqls({ unit: 'px', value: 10.5 });
  //   expect(parseLengthOrPercentage('0.5px')).to.be.eqls({ unit: 'px', value: 0.5 });
  //   expect(parseLengthOrPercentage('30%')).to.be.eqls({ unit: '%', value: 30 });
  //   expect(parseLengthOrPercentage('30.5%')).to.be.eqls({ unit: '%', value: 30.5 });
  // });

  // it('parse length with em', () => {
  //   const group = new Group({
  //     style: {
  //       fontSize: 10,
  //     },
  //   });
  //   expect(parseLengthOrPercent('1.5em', circle)).to.be.eqls({ unit: 'px', value: 0 });

  //   group.appendChild(circle);
  //   expect(parseLengthOrPercent('1.5em', circle)).to.be.eqls({ unit: 'px', value: 15 });
  // });

  // it('parse angle with unit', () => {
  //   expect(parseAngle('10deg')).to.be.eqls({ unit: 'deg', value: 10 });
  //   expect(parseAngle('10rad')).to.be.eqls({ unit: 'rad', value: 10 });
  //   expect(parseAngle('1turn')).to.be.eqls({ unit: 'turn', value: 1 });
  //   expect(parseAngle('1grad')).to.be.eqls({ unit: 'grad', value: 1 });
  // });

  // it('should merge length correctly', () => {
  //   const [left, right, format] = mergeDimensions(
  //     {
  //       unit: 'px',
  //       value: 10,
  //     },
  //     {
  //       unit: 'px',
  //       value: 20,
  //     },
  //   );
  //   expect(left).to.be.eqls(10);
  //   expect(right).to.be.eqls(20);
  //   expect(format(30)).to.be.eqls('30px');
  // });

  // it('should merge length with percentage and pixel correctly', () => {
  //   const [left, right, format] = mergeDimensions(
  //     {
  //       unit: 'px',
  //       value: 10,
  //     },
  //     {
  //       unit: '%',
  //       value: 20, // r = 100
  //     },
  //     true,
  //     circle,
  //     0,
  //   );
  //   expect(left).to.be.eqls(10);
  //   expect(right).to.be.eqls(40);
  //   expect(format(30)).to.be.eqls('30px');
  // });

  // it('should merge length with percentage correctly', () => {
  //   const [left, right, format] = mergeDimensions(
  //     {
  //       unit: '%',
  //       value: 20,
  //     },
  //     {
  //       unit: '%',
  //       value: 20, // r = 100
  //     },
  //     true,
  //     circle,
  //     0,
  //   );
  //   expect(left).to.be.eqls(40);
  //   expect(right).to.be.eqls(40);
  //   expect(format(30)).to.be.eqls('30px');
  // });
});
