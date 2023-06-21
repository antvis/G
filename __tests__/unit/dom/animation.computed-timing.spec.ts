import { KeyframeEffect } from '../../../packages/g/src';

interface Test {
  desc: string;
  input: KeyframeEffectOptions | number;
  expected: KeyframeEffectOptions | number;
}

/**
 * ported from @see https://github.com/web-platform-tests/wpt/blob/master/web-animations/interfaces/AnimationEffect/getComputedTiming.html
 */
describe('Animation ComputedTiming', () => {
  const gGetComputedTimingTests: Test[] = [
    {
      desc: 'an empty KeyframeEffectOptions object',
      input: {},
      expected: {},
    },
    {
      desc: 'a normal KeyframeEffectOptions object',
      input: {
        delay: 1000,
        endDelay: 2000,
        fill: 'auto',
        iterationStart: 0.5,
        iterations: 5.5,
        duration: 'auto',
        direction: 'alternate',
        easing: 'steps(2)',
      },
      expected: {
        delay: 1000,
        endDelay: 2000,
        fill: 'none',
        iterationStart: 0.5,
        iterations: 5.5,
        duration: 0,
        direction: 'alternate',
        easing: 'steps(2)',
      },
    },
    {
      desc: 'a double value',
      input: 3000,
      // timing:   { duration: 3000 },
      expected: {
        delay: 0,
        fill: 'none',
        iterations: 1,
        duration: 3000,
        direction: 'normal',
      },
    },
    {
      desc: '+Infinity',
      input: Infinity,
      expected: { duration: Infinity },
    },
    {
      desc: 'an Infinity duration',
      input: { duration: Infinity },
      expected: { duration: Infinity },
    },
    {
      desc: 'an auto duration',
      input: { duration: 'auto' },
      expected: { duration: 0 },
    },
    {
      desc: 'an Infinity iterations',
      input: { iterations: Infinity },
      expected: { iterations: Infinity },
    },
    {
      desc: 'an auto fill',
      input: { fill: 'auto' },
      expected: { fill: 'none' },
    },
    {
      desc: 'a forwards fill',
      input: { fill: 'forwards' },
      expected: { fill: 'forwards' },
    },
  ];

  for (const stest of gGetComputedTimingTests) {
    it(`values of getComputedTiming() when a KeyframeEffect is constructed by ${stest.desc}`, () => {
      const effect = new KeyframeEffect(null, null, stest.input);

      const expected = (
        field: string,
        defaultValue: number | string,
      ): number | string => {
        // @ts-ignore
        return field in stest.expected ? stest.expected[field] : defaultValue;
      };

      const ct = effect.getComputedTiming();
      expect(ct.delay).toBe(expected('delay', 0));
      expect(ct.endDelay).toBe(expected('endDelay', 0));
      expect(ct.fill).toBe(expected('fill', 'none'));
      expect(ct.iterationStart).toBe(expected('iterationStart', 0));
      expect(ct.iterations).toBe(expected('iterations', 1));
      expect(ct.duration).toBe(expected('duration', 0));
      expect(ct.direction).toBe(expected('direction', 'normal'));
      expect(ct.easing).toBe(expected('easing', 'linear'));
    });
  }

  const gActiveDurationTests: Test[] = [
    {
      desc: 'an empty KeyframeEffectOptions object',
      input: {},
      expected: 0,
    },
    {
      desc: 'a non-zero duration and default iteration count',
      input: { duration: 1000 },
      expected: 1000,
    },
    {
      desc: 'a non-zero duration and integral iteration count',
      input: { duration: 1000, iterations: 7 },
      expected: 7000,
    },
    {
      desc: 'a non-zero duration and fractional iteration count',
      input: { duration: 1000, iterations: 2.5 },
      expected: 2500,
    },
    {
      desc: 'an non-zero duration and infinite iteration count',
      input: { duration: 1000, iterations: Infinity },
      expected: Infinity,
    },
    {
      desc: 'an non-zero duration and zero iteration count',
      input: { duration: 1000, iterations: 0 },
      expected: 0,
    },
    {
      desc: 'a zero duration and default iteration count',
      input: { duration: 0 },
      expected: 0,
    },
    {
      desc: 'a zero duration and fractional iteration count',
      input: { duration: 0, iterations: 2.5 },
      expected: 0,
    },
    {
      desc: 'a zero duration and infinite iteration count',
      input: { duration: 0, iterations: Infinity },
      expected: 0,
    },
    {
      desc: 'a zero duration and zero iteration count',
      input: { duration: 0, iterations: 0 },
      expected: 0,
    },
    {
      desc: 'an infinite duration and default iteration count',
      input: { duration: Infinity },
      expected: Infinity,
    },
    {
      desc: 'an infinite duration and zero iteration count',
      input: { duration: Infinity, iterations: 0 },
      expected: 0,
    },
    {
      desc: 'an infinite duration and fractional iteration count',
      input: { duration: Infinity, iterations: 2.5 },
      expected: Infinity,
    },
    {
      desc: 'an infinite duration and infinite iteration count',
      input: { duration: Infinity, iterations: Infinity },
      expected: Infinity,
    },
  ];

  for (const stest of gActiveDurationTests) {
    it(`getComputedTiming().activeDuration for ${stest.desc}`, () => {
      const effect = new KeyframeEffect(null, null, stest.input);

      expect(effect.getComputedTiming().activeDuration).toBe(stest.expected);
    });
  }

  const gEndTimeTests: Test[] = [
    {
      desc: 'an empty KeyframeEffectOptions object',
      input: {},
      expected: 0,
    },
    {
      desc: 'a non-zero duration and default iteration count',
      input: { duration: 1000 },
      expected: 1000,
    },
    {
      desc: 'a non-zero duration and non-default iteration count',
      input: { duration: 1000, iterations: 2.5 },
      expected: 2500,
    },
    {
      desc: 'a non-zero duration and non-zero delay',
      input: { duration: 1000, delay: 1500 },
      expected: 2500,
    },
    {
      desc: 'a non-zero duration, non-zero delay and non-default iteration',
      input: { duration: 1000, delay: 1500, iterations: 2 },
      expected: 3500,
    },
    {
      desc: 'an infinite iteration count',
      input: { duration: 1000, iterations: Infinity },
      expected: Infinity,
    },
    {
      desc: 'an infinite duration',
      input: { duration: Infinity, iterations: 10 },
      expected: Infinity,
    },
    {
      desc: 'an infinite duration and delay',
      input: { duration: Infinity, iterations: 10, delay: 1000 },
      expected: Infinity,
    },
    {
      desc: 'an infinite duration and negative delay',
      input: { duration: Infinity, iterations: 10, delay: -1000 },
      expected: Infinity,
    },
    {
      desc: 'an non-zero duration and negative delay',
      input: { duration: 1000, iterations: 2, delay: -1000 },
      expected: 1000,
    },
    {
      desc:
        'an non-zero duration and negative delay greater than active ' +
        'duration',
      input: { duration: 1000, iterations: 2, delay: -3000 },
      expected: 0,
    },
    {
      desc: 'a zero duration and negative delay',
      input: { duration: 0, iterations: 2, delay: -1000 },
      expected: 0,
    },
  ];

  for (const stest of gEndTimeTests) {
    it(`getComputedTiming().endTime for ${stest.desc}`, () => {
      const effect = new KeyframeEffect(null, null, stest.input);

      expect(effect.getComputedTiming().endTime).toBe(stest.expected);
    });
  }
});
