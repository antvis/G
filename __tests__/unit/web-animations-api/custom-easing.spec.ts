import {
  convertToDash,
  EasingFunctions,
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
});
