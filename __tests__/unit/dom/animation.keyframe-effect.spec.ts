import { KeyframeEffect } from '../../../packages/g/src';
import { gEasingParsingTests } from './utils/easing';
import {
  gBadKeyframeCompositeValueTests,
  gEmptyKeyframeListTests,
  gGoodKeyframeCompositeValueTests,
  gGoodOptionsCompositeValueTests,
  gKeyframesTests,
} from './utils/keyframe';

function assert_equals(a: any, b: any) {
  expect(a).toBe(b);
}

function assert_frame_lists_equal(a: any, b: any) {
  expect(a.length).toBe(b.length);
  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    assert_frames_equal(a[i], b[i]);
  }
}

/** Helper for assert_frame_lists_equal */
function assert_frames_equal(a: any, b: any) {
  expect(Object.keys(a).sort().toString()).toBe(
    Object.keys(b).sort().toString(),
  );
  // Iterates sorted keys to ensure stable failures.
  for (const p of Object.keys(a).sort()) {
    expect(a[p]).toBe(b[p]);
  }
}

/**
 * ported from @see https://github.com/web-platform-tests/wpt/blob/master/web-animations/interfaces/KeyframeEffect/constructor.html
 */
describe('Animation KeyframeEffect', () => {
  it('Can be constructed with no frames', () => {
    for (const frames of gEmptyKeyframeListTests) {
      expect(new KeyframeEffect(null, frames).getKeyframes().length).toBe(0);
    }
  });

  it('Easing values are parsed correctly when passed to the KeyframeEffect constructor in KeyframeEffectOptions', () => {
    for (const subtest of gEasingParsingTests) {
      const easing = subtest[0];
      const expected = subtest[1];
      const effect = new KeyframeEffect(null, null, { easing: easing });
      expect(effect.getTiming().easing).toBe(expected);
    }
  });

  // it('Invalid easing values are correctly rejected when passed to the KeyframeEffect constructor in KeyframeEffectOptions', () => {
  //   for (const invalidEasing of gInvalidEasings) {
  //     expect(() => {
  //       new KeyframeEffect(null, null, { easing: invalidEasing });
  //     }).toThrow();
  //   }
  // });

  it('composite values are parsed correctly when passed to the KeyframeEffect constructor in property-indexed keyframes', () => {
    const getKeyframe = (composite: CompositeOperationOrAuto) => ({
      left: ['10px', '20px'],
      composite: composite,
    });

    for (const composite of gGoodKeyframeCompositeValueTests) {
      const effect = new KeyframeEffect(null, getKeyframe(composite));
      expect(effect.getKeyframes()[0].composite).toBe(composite);
    }

    for (const composite of gBadKeyframeCompositeValueTests) {
      expect(() => {
        // @ts-ignore
        new KeyframeEffect(null, getKeyframe(composite));
      }).toThrow();
    }
  });

  it('composite values are parsed correctly when passed to the KeyframeEffect constructor in regular keyframes', () => {
    const getKeyframe = (composite: CompositeOperationOrAuto) => [
      { offset: 0, left: '10px', composite: composite },
      { offset: 1, left: '20px' },
    ];

    for (const composite of gGoodKeyframeCompositeValueTests) {
      const effect = new KeyframeEffect(null, getKeyframe(composite));
      expect(effect.getKeyframes()[0].composite).toBe(composite);
    }

    for (const composite of gBadKeyframeCompositeValueTests) {
      expect(() => {
        // @ts-ignore
        new KeyframeEffect(null, getKeyframe(composite));
      }).toThrow();
    }
  });

  it('composite value is auto if the composite operation specified on the keyframe effect is being used', () => {
    for (const composite of gGoodOptionsCompositeValueTests) {
      const effect = new KeyframeEffect(
        null,
        {
          left: ['10px', '20px'],
        },
        // @ts-ignore
        { composite },
      );
      expect(effect.getKeyframes()[0].composite).toBe('auto');
    }

    // for (const composite of gBadOptionsCompositeValueTests) {
    //   expect(() => {
    //     new KeyframeEffect(null, {
    //       left: ['10px', '20px']
    //       // @ts-ignore
    //     }, { composite });
    //   }).toThrow();
    // }
  });

  for (const subtest of gKeyframesTests) {
    it(`A KeyframeEffect can be constructed with ${subtest.desc}`, () => {
      const effect = new KeyframeEffect(null, subtest.input);

      assert_frame_lists_equal(effect.getKeyframes(), subtest.output);
    });

    // effect = new KeyframeEffect(null, subtest.input);
    // const secondEffect = new KeyframeEffect(null, effect.getKeyframes());
    // assert_frame_lists_equal(secondEffect.getKeyframes(),
    //   effect.getKeyframes());
  }

  it('A KeyframeEffect constructed without any KeyframeEffectOptions object', () => {
    const effect = new KeyframeEffect(null, { left: ['10px', '20px'] });
    const timing = effect.getTiming();
    assert_equals(timing.delay, 0);
    assert_equals(timing.endDelay, 0);
    assert_equals(timing.fill, 'auto');
    assert_equals(timing.iterations, 1.0);
    assert_equals(timing.iterationStart, 0.0);
    assert_equals(timing.duration, 'auto');
    assert_equals(timing.direction, 'normal');
    assert_equals(timing.easing, 'linear');
    assert_equals(effect.composite, 'replace');
    assert_equals(effect.iterationComposite, 'replace');
  });
});
