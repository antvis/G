import type {
  IDocument,
  IAnimationTimeline,
  IElement,
  IAnimation,
} from '@antv/g-lite';
import { Animation } from './Animation';
import { KeyframeEffect } from './KeyframeEffect';

export function compareAnimations(
  leftAnimation: IAnimation,
  rightAnimation: IAnimation,
) {
  return Number(leftAnimation.id) - Number(rightAnimation.id);
}

/**
 * @see https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/web-animations-js/index.d.ts
 */
export class AnimationTimeline implements IAnimationTimeline {
  /**
   * all active animations
   */
  animations: Animation[] = [];

  private ticking = false;

  private timelineTicking = false;

  private hasRestartedThisFrame = false;

  animationsWithPromises: Animation[] = [];

  private inTick = false;

  private pendingEffects: (KeyframeEffect | null)[] = [];

  currentTime: number | null = null;

  private rafId = 0;
  private rafCallbacks: [number, (x: number) => void][] = [];

  private frameId: number;

  constructor(private document: IDocument) {}

  getAnimations() {
    this.discardAnimations();
    return this.animations.slice();
  }

  isTicking() {
    return this.inTick;
  }

  play(
    target: IElement,
    keyframes: Keyframe[] | PropertyIndexedKeyframes | null,
    options?: number | KeyframeAnimationOptions,
  ): Animation {
    const effect = new KeyframeEffect(target, keyframes, options);
    const animation = new Animation(effect, this);
    this.animations.push(animation);
    this.restartWebAnimationsNextTick();
    animation.updatePromises();
    animation.play();
    animation.updatePromises();
    return animation;
  }

  // RAF is supposed to be the last script to occur before frame rendering but not
  // all browsers behave like this. This function is for synchonously updating an
  // animation's effects whenever its state is mutated by script to work around
  // incorrect script execution ordering by the browser.
  applyDirtiedAnimation(animation: Animation) {
    if (this.inTick) {
      return;
    }
    // update active animations in displayobject
    animation.markTarget();
    const animations = animation.targetAnimations();
    animations.sort(compareAnimations);

    // clear inactive animations
    const inactiveAnimations = this.tick(
      Number(this.currentTime),
      false,
      animations.slice(),
    )[1];
    inactiveAnimations.forEach((animation) => {
      const index = this.animations.indexOf(animation);
      if (index !== -1) {
        this.animations.splice(index, 1);
      }
    });
    this.applyPendingEffects();
  }

  restart() {
    if (!this.ticking) {
      this.ticking = true;
      this.requestAnimationFrame(() => {});
      this.hasRestartedThisFrame = true;
    }
    return this.hasRestartedThisFrame;
  }

  destroy() {
    this.document.defaultView.cancelAnimationFrame(this.frameId);
  }

  applyPendingEffects() {
    this.pendingEffects.forEach((effect) => {
      effect?.applyInterpolations();
    });
    this.pendingEffects = [];
  }

  private updateAnimationsPromises() {
    this.animationsWithPromises = this.animationsWithPromises.filter(
      (animation) => {
        return animation.updatePromises();
      },
    );
  }

  private discardAnimations() {
    this.updateAnimationsPromises();
    this.animations = this.animations.filter((animation) => {
      return (
        animation.playState !== 'finished' && animation.playState !== 'idle'
      );
    });
  }

  private restartWebAnimationsNextTick() {
    if (!this.timelineTicking) {
      this.timelineTicking = true;
      this.requestAnimationFrame(this.webAnimationsNextTick);
    }
  }

  private webAnimationsNextTick = (t: number) => {
    this.currentTime = t;
    this.discardAnimations();
    if (this.animations.length === 0) {
      this.timelineTicking = false;
    } else {
      this.requestAnimationFrame(this.webAnimationsNextTick);
    }
  };

  private processRafCallbacks = (t: number) => {
    const processing = this.rafCallbacks;
    this.rafCallbacks = [];
    if (t < Number(this.currentTime)) t = Number(this.currentTime);
    this.animations.sort(compareAnimations);
    this.animations = this.tick(t, true, this.animations)[0];
    processing.forEach((entry) => {
      entry[1](t);
    });
    this.applyPendingEffects();
  };

  private rAF(f: (x: number) => void) {
    const id = this.rafId++;
    if (this.rafCallbacks.length === 0) {
      this.frameId = this.document.defaultView.requestAnimationFrame(
        this.processRafCallbacks,
      );
    }
    this.rafCallbacks.push([id, f]);
    return id;
  }

  private requestAnimationFrame(f: (ts: number) => void) {
    return this.rAF((x: number) => {
      this.updateAnimationsPromises();
      f(x);
      this.updateAnimationsPromises();
    });
  }

  tick(t: number, isAnimationFrame: boolean, updatingAnimations: IAnimation[]) {
    this.inTick = true;
    this.hasRestartedThisFrame = false;

    this.currentTime = t;
    this.ticking = false;

    const newPendingClears: (KeyframeEffect | null)[] = [];
    const newPendingEffects: (KeyframeEffect | null)[] = [];
    const activeAnimations: Animation[] = [];
    const inactiveAnimations: Animation[] = [];

    (updatingAnimations as unknown as Animation[]).forEach((animation) => {
      animation.tick(t, isAnimationFrame);

      if (!animation._inEffect) {
        newPendingClears.push(animation.effect);
        animation.unmarkTarget();
      } else {
        newPendingEffects.push(animation.effect);
        animation.markTarget();
      }

      if (animation._needsTick) this.ticking = true;

      const alive = animation._inEffect || animation._needsTick;
      animation._inTimeline = alive;
      if (alive) {
        activeAnimations.push(animation);
      } else {
        inactiveAnimations.push(animation);
      }
    });

    this.pendingEffects.push(...newPendingClears);
    this.pendingEffects.push(...newPendingEffects);

    if (this.ticking) this.requestAnimationFrame(() => {});

    this.inTick = false;
    return [activeAnimations, inactiveAnimations];
  }
}
