import {
  convertToDash,
  EasingFunctions,
  parseEasingFunction,
} from '../../../packages/g-web-animations-api/src/utils';

describe('Custom easing utils', () => {
  it('should convertToDash correctly', () => {
    expect(convertToDash('easeIn')).toBe('ease-in');
    expect(convertToDash('ease-in')).toBe('ease-in');
  });

  it('should calc easing correctly.', () => {
    Object.keys(EasingFunctions).forEach((key) => {
      if (key !== 'bezier' && key !== 'cubic-bezier') {
        const easing = EasingFunctions[key];
        expect(easing(0)).toBeCloseTo(0);
        expect(easing(1)).toBeCloseTo(1);
      }
    });
  });

  it('should calc cubic-bezier correctly.', () => {
    let f = parseEasingFunction('cubic-bezier(0, 0, 1, 0.5)');
    expect(f(0)).toBe(0);
    expect(f(0.5)).toBe(0.3125);
    expect(f(1)).toBe(1);

    f = parseEasingFunction('cubic-bezier(0.05, 0.21, 0.26, 1.31)');
    expect(f(0)).toBe(0);
    expect(f(0.5)).toBeCloseTo(0.9824289047791895);
    expect(f(0.75)).toBeCloseTo(1.0546732024179284);
    expect(f(1)).toBe(1);
  });
});
