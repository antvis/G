import { Element, KeyframeEffect } from '../../dom';
import type { Animation } from '../../dom';
import { BaseStyleProps, ParsedBaseStyleProps } from '../../types';

export class Animatable<
  StyleProps extends BaseStyleProps = any,
  ParsedStyleProps extends ParsedBaseStyleProps = any,
> extends Element<StyleProps, ParsedStyleProps> {
  /**
   * push to active animations after calling `animate()`
   */
  private activeAnimations: Animation[] = [];

  /**
   * returns an array of all Animation objects affecting this element
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/getAnimations
   */
  getAnimations(): Animation[] {
    return this.activeAnimations;
  }
  /**
   * create an animation with WAAPI
   * @see https://developer.mozilla.org/zh-CN/docs/Web/API/Element/animate
   */
  animate(
    keyframes: Keyframe[] | PropertyIndexedKeyframes | null,
    options?: number | KeyframeAnimationOptions | undefined,
  ): Animation | null {
    let timeline = this.ownerDocument?.timeline;

    // accounte for clip path, use target's timeline
    if (this.attributes.clipPathTargets && this.attributes.clipPathTargets.length) {
      const target = this.attributes.clipPathTargets[0];
      timeline = target.ownerDocument?.timeline;
    }

    // clear old parsed transform
    this.parsedStyle.transform = undefined;

    if (timeline) {
      // @ts-ignore
      return timeline.play(new KeyframeEffect(this, keyframes, options));
    }
    return null;
  }

  destroy() {
    super.destroy();

    // stop all active animations
    this.getAnimations().forEach((animation) => {
      animation.cancel();
    });
  }
}
