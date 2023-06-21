import { parseLength } from '../../../../packages/g-lite/src/css';

describe('Property Dimension', () => {
  it('parse length with unit', () => {
    let result = parseLength('10px');
    expect(result.toString()).toBe('10px');

    result = parseLength('10.5px');
    expect(result.toString()).toBe('10.5px');

    result = parseLength('0.5px');
    expect(result.toString()).toBe('0.5px');

    result = parseLength('0');
    expect(result.toString()).toBe('0px');

    result = parseLength(null);
    expect(result.toString()).toBe('0px');

    result = parseLength(undefined);
    expect(result.toString()).toBe('0px');
  });

  // it('parse length with percent', () => {
  //   expect(parseLengthOrPercentage('10px')).toBe({ unit: 'px', value: 10 });
  //   expect(parseLengthOrPercentage('10.5px')).toBe({ unit: 'px', value: 10.5 });
  //   expect(parseLengthOrPercentage('0.5px')).toBe({ unit: 'px', value: 0.5 });
  //   expect(parseLengthOrPercentage('30%')).toBe({ unit: '%', value: 30 });
  //   expect(parseLengthOrPercentage('30.5%')).toBe({ unit: '%', value: 30.5 });
  // });

  // it('parse length with em', () => {
  //   const group = new Group({
  //     style: {
  //       fontSize: 10,
  //     },
  //   });
  //   expect(parseLengthOrPercent('1.5em', circle)).toBe({ unit: 'px', value: 0 });

  //   group.appendChild(circle);
  //   expect(parseLengthOrPercent('1.5em', circle)).toBe({ unit: 'px', value: 15 });
  // });

  // it('parse angle with unit', () => {
  //   expect(parseAngle('10deg')).toBe({ unit: 'deg', value: 10 });
  //   expect(parseAngle('10rad')).toBe({ unit: 'rad', value: 10 });
  //   expect(parseAngle('1turn')).toBe({ unit: 'turn', value: 1 });
  //   expect(parseAngle('1grad')).toBe({ unit: 'grad', value: 1 });
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
  //   expect(left).toBe(10);
  //   expect(right).toBe(20);
  //   expect(format(30)).toBe('30px');
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
  //   expect(left).toBe(10);
  //   expect(right).toBe(40);
  //   expect(format(30)).toBe('30px');
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
  //   expect(left).toBe(40);
  //   expect(right).toBe(40);
  //   expect(format(30)).toBe('30px');
  // });
});
