import {
  Circle,
  isDisplayObject,
} from '../../../packages/g-lite/src/display-objects';
import {
  DCHECK,
  definedProps,
  formatAttributeName,
  isSymbol,
} from '../../../packages/g-lite/src/utils';

describe('Assert utils', () => {
  it('should check isSymbol correctly', () => {
    expect(isSymbol(undefined)).toBeFalsy();
    expect(isSymbol(null)).toBeFalsy();
    expect(isSymbol('')).toBeFalsy();
    expect(isSymbol(() => {})).toBeFalsy();
    expect(isSymbol(20)).toBeFalsy();
    expect(isSymbol(Symbol('test'))).toBeTruthy();
  });

  it('should check isDisplayObject correctly', () => {
    expect(isDisplayObject(undefined)).toBeFalsy();
    expect(isDisplayObject(null)).toBeFalsy();
    expect(isDisplayObject('')).toBeFalsy();
    expect(isDisplayObject(() => {})).toBeFalsy();
    expect(isDisplayObject(20)).toBeFalsy();
    expect(isDisplayObject(new Circle())).toBeTruthy();
  });

  it('should assert correctly', () => {
    expect(() => DCHECK(true)).not.toThrow();
    expect(() => DCHECK(false)).toThrow();
  });

  it('should definedProps correctly', () => {
    expect(definedProps({ a: 1, b: undefined })).toStrictEqual({ a: 1 });
  });

  it('should formatAttributeName correctly', () => {
    expect(formatAttributeName('fill')).toBe('fill');
    expect(formatAttributeName('d')).toBe('path');
    expect(formatAttributeName('path')).toBe('path');
    expect(formatAttributeName('strokeDasharray')).toBe('lineDash');
    expect(formatAttributeName('strokeWidth')).toBe('lineWidth');
    expect(formatAttributeName('textAnchor')).toBe('textAlign');
    expect(formatAttributeName('src')).toBe('img');
  });
});
