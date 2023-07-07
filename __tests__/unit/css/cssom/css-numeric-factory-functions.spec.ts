import { CSS } from '../../../../packages/g-lite/src/css';

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/API/CSS/factory_functions
 */
describe('CSS numeric factory functions', () => {
  it('should create CSSUnitValue with shortcuts correctly.', () => {
    let result = CSS.number(10);
    expect(result.toString()).toBe('10');

    result = CSS.percent(10);
    expect(result.toString()).toBe('10%');

    result = CSS.px(10);
    expect(result.toString()).toBe('10px');

    result = CSS.em(10);
    expect(result.toString()).toBe('10em');

    result = CSS.deg(10);
    expect(result.toString()).toBe('10deg');

    result = CSS.grad(10);
    expect(result.toString()).toBe('10grad');

    result = CSS.rad(10);
    expect(result.toString()).toBe('10rad');

    result = CSS.turn(10);
    expect(result.toString()).toBe('10turn');

    result = CSS.s(10);
    expect(result.toString()).toBe('10s');

    result = CSS.ms(10);
    expect(result.toString()).toBe('10ms');
  });
});
