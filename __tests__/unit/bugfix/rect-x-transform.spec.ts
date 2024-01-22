import { Rect } from '../../../packages/g-lite/src';

// @see https://github.com/antvis/G/issues/1280
describe('ISSUE 1280', () => {
  test('should recalc RTS matrix when x or transform changed.', () => {
    const rect = new Rect();
    rect.style.transform = 'translate(100, 0)';
    rect.style.x = 100;
    expect(rect.getLocalPosition()[0]).toBe(100);

    rect.style.x = 200;
    expect(rect.getLocalPosition()[0]).toBe(100);
  });
});
