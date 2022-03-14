import chai, { expect } from 'chai';
import { parseLength, parseAngle, parseLengthOrPercent, mergeDimensions } from '../dimension';
import { Circle } from '../..';
import { parseFilter } from '../filter';

const circle = new Circle({
  style: {
    x: 100,
    y: 100,
    r: 100,
  },
});

describe('Property Filter', () => {
  it('should parse single filter like blur(5px)', () => {
    expect(parseFilter('blur(5px)')).to.be.eqls([
      { name: 'blur', params: [{ unit: 'px', value: 5 }] },
    ]);
  });

  it('should parse multiple filters correctly', () => {
    expect(parseFilter('blur(5px) blur(10px)')).to.be.eqls([
      { name: 'blur', params: [{ unit: 'px', value: 5 }] },
      { name: 'blur', params: [{ unit: 'px', value: 10 }] },
    ]);
  });

  it('should skip invalid filters', () => {
    expect(parseFilter('blur(5px) xxx() yyy() blur(10px)')).to.be.eqls([
      { name: 'blur', params: [{ unit: 'px', value: 5 }] },
      { name: 'blur', params: [{ unit: 'px', value: 10 }] },
    ]);
  });

  it('should parse single filter like brightness(100%)', () => {
    expect(parseFilter('brightness(100%)')).to.be.eqls([
      { name: 'brightness', params: [{ unit: '%', value: 100 }] },
    ]);

    expect(parseFilter('brightness(0.5)')).to.be.eqls([
      { name: 'brightness', params: [{ unit: 'px', value: 0.5 }] },
    ]);
  });

  it('should parse single filter like drop-shadow', () => {
    expect(parseFilter('drop-shadow(16px 16px 10px black)')).to.be.eqls([
      {
        name: 'drop-shadow',
        params: [
          { unit: 'px', value: 16 },
          { unit: 'px', value: 16 },
          { unit: 'px', value: 10 },
          { formatted: 'rgba(0,0,0,1)', type: 0, value: [0, 0, 0, 1] },
        ],
      },
    ]);

    expect(parseFilter('drop-shadow(0.232715008431704px 6.924114671163576px 0px #000)')).to.be.eqls(
      [
        {
          name: 'drop-shadow',
          params: [
            { unit: 'px', value: 0.232715008431704 },
            { unit: 'px', value: 6.924114671163576 },
            { unit: 'px', value: 0 },
            { formatted: 'rgba(0,0,0,1)', type: 0, value: [0, 0, 0, 1] },
          ],
        },
      ],
    );
  });
});
