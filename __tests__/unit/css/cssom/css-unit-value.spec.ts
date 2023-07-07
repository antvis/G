import { CSSUnitValue, UnitType } from '../../../../packages/g-lite/src/css';

/**
 * @see https://chromium.googlesource.com/chromium/src/+/refs/heads/main/third_party/blink/renderer/core/css/cssom/css_unit_value_test.cc
 */
describe('CSSUnitValue', () => {
  it('should create from string, eg. 10px, 50%', () => {
    // 96px
    const pxValue = new CSSUnitValue(96, 'px');
    expect(pxValue.value).toBe(96);
    expect(pxValue.unit).toBe(UnitType.kPixels);
    // expect(pxValue.to(UnitType.kPixels).value).toBe(96);

    // 50%
    const percentValue = new CSSUnitValue(50, '%');
    expect(percentValue.value).toBe(50);
    expect(percentValue.unit).toBe(UnitType.kPercentage);
    // expect(percentValue.to(UnitType.kPercentage).value).toBe(50);

    const degValue = new CSSUnitValue(50, 'deg');
    expect(degValue.value).toBe(50);
    expect(degValue.unit).toBe(UnitType.kDegrees);
    // expect(degValue.to(UnitType.kDegrees).value).toBe(50);

    // 96(number)
    const defaultUnitValue = new CSSUnitValue(96);
    expect(defaultUnitValue.value).toBe(96);
    expect(defaultUnitValue.unit).toBe(UnitType.kNumber);
  });

  // it('should convert pixel to other unit correctly.', () => {
  //   const pxValue = new CSSUnitValue(96, UnitType.kPixels);
  //   expect(pxValue.to(UnitType.kPixels).value).toBe(96);
  // });

  // it('should convert degree to other unit correctly.', () => {
  //   const degValue = new CSSUnitValue(360, UnitType.kDegrees);
  //   // expect(degValue.to(UnitType.kDegrees).value).toBe(360);
  //   // expect(degValue.to(UnitType.kRadians).value).toBe(deg2rad(360));
  //   // expect(degValue.to(UnitType.kTurns).value).toBe(deg2turn(360));
  //   // expect(degValue.to(UnitType.kGradians).value).toBe(360);
  // });

  it('should compare other unit correctly.', () => {
    const degValue1 = new CSSUnitValue(360, UnitType.kDegrees);
    const degValue2 = new CSSUnitValue(360, UnitType.kDegrees);
    const degValue3 = new CSSUnitValue(361, UnitType.kDegrees);

    expect(degValue1.equals(degValue2)).toBeTruthy();
    expect(degValue1.equals(degValue3)).toBeFalsy();
  });

  // it('should negate correctly.', () => {
  //   const degValue = new CSSUnitValue(360, UnitType.kDegrees);
  //   const negateDegValue = degValue.negate();
  //   expect(negateDegValue.value).toBe(-360);

  //   const pxValue = new CSSUnitValue(96, 'px');
  //   const negatePxValue = pxValue.negate();
  //   expect(negatePxValue.value).toBe(-96);

  //   const numberUnitValue = new CSSUnitValue(96);
  //   const negateNumberValue = numberUnitValue.negate();
  //   expect(negateNumberValue.value).toBe(-96);
  // });

  // it('should invert correctly.', () => {
  //   const wrongUnitValue = new CSSUnitValue(0);
  //   const wrongNumberValue = wrongUnitValue.invert() as CSSUnitValue;
  //   expect(wrongNumberValue).toBeNull();

  //   const numberUnitValue = new CSSUnitValue(96);
  //   const invertNumberValue = numberUnitValue.invert() as CSSUnitValue;
  //   expect(invertNumberValue.value).toBe(1 / 96);
  //   expect(invertNumberValue.toString()).toBe('0.010416666666666666');

  //   const pxValue = new CSSUnitValue(96, 'px');
  //   const invertPxValue = pxValue.invert() as CSSMathInvert;
  //   expect(invertPxValue.toString()).toBe('calc(1 / 96px)');

  //   const degValue = new CSSUnitValue(360, UnitType.kDegrees);
  //   const invertDegValue = degValue.invert() as CSSMathInvert;
  //   expect(invertDegValue.toString()).toBe('calc(1 / 360deg)');
  // });

  it('should generate correct CSS text.', () => {
    const numberUnitValue = new CSSUnitValue(96);
    expect(numberUnitValue.toString()).toBe('96');

    const pxValue = new CSSUnitValue(96, 'px');
    expect(pxValue.toString()).toBe('96px');

    const percentValue = new CSSUnitValue(50, '%');
    expect(percentValue.toString()).toBe('50%');

    const degValue = new CSSUnitValue(50, 'deg');
    expect(degValue.toString()).toBe('50deg');
  });

  // it('should calc add correctly', () => {
  //   const numberUnitValue1 = new CSSUnitValue(100);
  //   const numberUnitValue2 = new CSSUnitValue(100);

  //   let sum = numberUnitValue1.add(numberUnitValue2);
  //   expect(sum.toString()).toBe('200');

  //   const pxValue1 = new CSSUnitValue(100, 'px');
  //   const pxValue2 = new CSSUnitValue(100, 'px');
  //   const pxValue3 = new CSSUnitValue(100, 'px');
  //   sum = pxValue1.add(pxValue2, pxValue3);
  //   expect(sum.toString()).toBe('300px');
  // });

  // it('should calc sub correctly', () => {
  //   const numberUnitValue1 = new CSSUnitValue(100);
  //   const numberUnitValue2 = new CSSUnitValue(100);

  //   let sum = numberUnitValue1.sub(numberUnitValue2);
  //   expect(sum.toString()).toBe('0');

  //   const pxValue1 = new CSSUnitValue(300, 'px');
  //   const pxValue2 = new CSSUnitValue(100, 'px');
  //   const pxValue3 = new CSSUnitValue(100, 'px');
  //   sum = pxValue1.sub(pxValue2, pxValue3);
  //   expect(sum.toString()).toBe('100px');
  // });

  // it('should calc min correctly', () => {
  //   const numberUnitValue1 = new CSSUnitValue(100);
  //   const numberUnitValue2 = new CSSUnitValue(200);

  //   let result = numberUnitValue1.min(numberUnitValue2);
  //   expect(result.toString()).toBe('100');

  //   const pxValue1 = new CSSUnitValue(300, 'px');
  //   const pxValue2 = new CSSUnitValue(100, 'px');
  //   const pxValue3 = new CSSUnitValue(100, 'px');
  //   result = pxValue1.min(pxValue2, pxValue3);
  //   expect(result.toString()).toBe('100px');
  // });

  // it('should calc max correctly', () => {
  //   const numberUnitValue1 = new CSSUnitValue(100);
  //   const numberUnitValue2 = new CSSUnitValue(200);

  //   let result = numberUnitValue1.max(numberUnitValue2);
  //   expect(result.toString()).toBe('200');

  //   const pxValue1 = new CSSUnitValue(300, 'px');
  //   const pxValue2 = new CSSUnitValue(100, 'px');
  //   const pxValue3 = new CSSUnitValue(100, 'px');
  //   result = pxValue1.max(pxValue2, pxValue3);
  //   expect(result.toString()).toBe('300px');
  // });

  // it('should calc mul correctly', () => {
  //   const numberUnitValue1 = new CSSUnitValue(100);
  //   const numberUnitValue2 = new CSSUnitValue(200);

  //   let result = numberUnitValue1.mul(numberUnitValue2);
  //   expect(result.toString()).toBe('20000');

  //   const pxValue1 = new CSSUnitValue(300, 'px');
  //   const pxValue2 = new CSSUnitValue(100, 'px');
  //   const pxValue3 = new CSSUnitValue(100, 'px');
  //   result = pxValue1.mul(pxValue2, pxValue3);
  //   expect(result.toString()).toBe('calc(300px * 100px * 100px)');
  // });

  // it('should calc div correctly', () => {
  //   const numberUnitValue1 = new CSSUnitValue(100);
  //   const numberUnitValue2 = new CSSUnitValue(200);

  //   let result = numberUnitValue1.div(numberUnitValue2);
  //   expect(result.toString()).toBe('0.5');

  //   const pxValue1 = new CSSUnitValue(300, 'px');
  //   const pxValue2 = new CSSUnitValue(100, 'px');
  //   const pxValue3 = new CSSUnitValue(100, 'px');
  //   result = pxValue1.div(pxValue2, pxValue3);
  //   expect(result.toString()).toBe('calc(300px / 100px / 100px)');
  // });

  // it('should sumValue correctly', () => {
  //   const numberUnitValue = new CSSUnitValue(96);
  //   expect(numberUnitValue.toSum()).toBe('96');
  // })
});
