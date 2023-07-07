import { parseFilter } from '../../../../packages/g-lite/src/css';

describe('Property Filter', () => {
  it('should parse single filter like blur(5px)', () => {
    const result = parseFilter('blur(5px)');
    expect(result.length).toBe(1);
    expect(result[0].name).toBe('blur');
    expect(result[0].params.length).toBe(1);
    expect(result[0].params[0].toString()).toBe('5px');
  });

  it('should parse multiple filters correctly', () => {
    const result = parseFilter('blur(5px) blur(10px)');
    expect(result.length).toBe(2);
    expect(result[0].name).toBe('blur');
    expect(result[0].params.length).toBe(1);
    expect(result[0].params[0].toString()).toBe('5px');
    expect(result[1].name).toBe('blur');
    expect(result[1].params.length).toBe(1);
    expect(result[1].params[0].toString()).toBe('10px');
  });

  it('should skip invalid filters', () => {
    const result = parseFilter('blur(5px) xxx() yyy() blur(10px)');
    expect(result.length).toBe(2);
    expect(result[0].name).toBe('blur');
    expect(result[0].params.length).toBe(1);
    expect(result[0].params[0].toString()).toBe('5px');
    expect(result[1].name).toBe('blur');
    expect(result[1].params.length).toBe(1);
    expect(result[1].params[0].toString()).toBe('10px');
  });

  it('should parse single filter like brightness(100%)', () => {
    let result = parseFilter('brightness(100%)');
    expect(result.length).toBe(1);
    expect(result[0].name).toBe('brightness');
    expect(result[0].params.length).toBe(1);
    expect(result[0].params[0].toString()).toBe('100%');

    result = parseFilter('brightness(0.5)');
    expect(result[0].name).toBe('brightness');
    expect(result[0].params.length).toBe(1);
    expect(result[0].params[0].toString()).toBe('0.5px');
  });

  it('should parse single filter like drop-shadow', () => {
    let result = parseFilter('drop-shadow(16px 16px 10px black)');
    expect(result[0].name).toBe('drop-shadow');
    expect(result[0].params.length).toBe(4);
    expect(result[0].params[0].toString()).toBe('16px');
    expect(result[0].params[1].toString()).toBe('16px');
    expect(result[0].params[2].toString()).toBe('10px');
    expect(result[0].params[3].toString()).toBe('rgba(0,0,0,1)');

    result = parseFilter(
      'drop-shadow(0.232715008431704px 6.924114671163576px 0px #000)',
    );
    expect(result[0].name).toBe('drop-shadow');
    expect(result[0].params.length).toBe(4);
    expect(result[0].params[0].toString()).toBe('0.232715008431704px');
    expect(result[0].params[1].toString()).toBe('6.924114671163576px');
    expect(result[0].params[2].toString()).toBe('0px');
    expect(result[0].params[3].toString()).toBe('rgba(0,0,0,1)');
  });
});
