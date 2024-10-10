import type { DisplayObject, IAnimation } from '@antv/g-lite';
import { ERROR_MSG_METHOD_NOT_IMPLEMENTED } from '@antv/g-lite';
import { AnimationEvent } from './AnimationEvent';
import type { AnimationTimeline } from './AnimationTimeline';
import type { KeyframeEffect } from './KeyframeEffect';

let sequenceNumber = 0;

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Animation/Animation
 */
export class Animation implements IAnimation {
  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Animation/effect
   */
  effect: KeyframeEffect;

  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Animation/timeline
   */
  timeline: AnimationTimeline;

  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Animation/id
   */
  id: string;

  // animation: InternalAnimation | null;

  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Animation/pending
   */
  get pending() {
    return (
      (this._startTime === null && !this._paused && this.playbackRate !== 0) ||
      this.currentTimePending
    );
  }
  private currentTimePending = false;

  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Animation/playState
   */
  // playState: AnimationPlayState;
  private _idle = true;
  private _paused = false;
  private _finishedFlag = true;
  get playState(): AnimationPlayState {
    if (this._idle) return 'idle';
    if (this._isFinished) return 'finished';
    if (this._paused) return 'paused';
    return 'running';
  }

  /**
   * record previos state
   */
  private oldPlayState: AnimationPlayState | 'pending';

  private _holdTime: number;

  private readyPromise: Promise<any> | undefined;
  private finishedPromise: Promise<any> | undefined;
  private resolveReadyPromise: Function;
  private rejectReadyPromise: Function;
  private resolveFinishedPromise: Function;
  private rejectFinishedPromise: Function;

  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Animation/ready
   * @example
    animation.pause();
    animation.ready.then(function() {
      // Displays 'running'
      alert(animation.playState);
    });
    animation.play();
   */
  get ready() {
    if (!this.readyPromise) {
      if (this.timeline.animationsWithPromises.indexOf(this) === -1) {
        this.timeline.animationsWithPromises.push(this);
      }
      this.readyPromise = new Promise((resolve, reject) => {
        this.resolveReadyPromise = () => {
          resolve(this);
        };
        this.rejectReadyPromise = () => {
          reject(new Error());
        };
      });
      if (!this.pending) {
        this.resolveReadyPromise();
      }
    }
    return this.readyPromise;
  }

  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Animation/finished
   * @example
    Promise.all(
      elem.getAnimations().map(
        function(animation) {
          return animation.finished
        }
      )
    ).then(
      function() {
        return elem.remove();
      }
    );
   */
  get finished() {
    if (!this.finishedPromise) {
      if (this.timeline.animationsWithPromises.indexOf(this) === -1) {
        this.timeline.animationsWithPromises.push(this);
      }
      this.finishedPromise = new Promise((resolve, reject) => {
        this.resolveFinishedPromise = () => {
          resolve(this);
        };
        this.rejectFinishedPromise = () => {
          reject(new Error());
        };
      });
      if (this.playState === 'finished') {
        this.resolveFinishedPromise();
      }
    }
    return this.finishedPromise;
  }

  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Animation/onfinish
   */
  onfinish: ((this: Animation, ev: AnimationPlaybackEvent) => any) | null;

  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Animation/oncancel
   */
  oncancel: ((this: Animation, ev: AnimationPlaybackEvent) => any) | null;

  /**
   * get called after each frame when running
   */
  onframe: ((this: Animation, ev: AnimationPlaybackEvent) => any) | null;

  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Animation/currentTime
   */
  private _currentTime = 0;
  get currentTime(): number | null {
    this.updatePromises();
    return this._idle || this.currentTimePending ? null : this._currentTime;
  }
  set currentTime(newTime: number | null) {
    newTime = Number(newTime);
    if (isNaN(newTime)) return;
    this.timeline.restart();
    if (!this._paused && this._startTime !== null) {
      this._startTime =
        Number(this.timeline?.currentTime) - newTime / this.playbackRate;
    }
    this.currentTimePending = false;
    if (this._currentTime === newTime) {
      return;
    }
    if (this._idle) {
      this._idle = false;
      this._paused = true;
    }
    this.tickCurrentTime(newTime, true);
    this.timeline.applyDirtiedAnimation(this);
  }

  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Animation/startTime
   */
  private _startTime: number | null;
  get startTime() {
    return this._startTime;
  }
  set startTime(newTime: number | null) {
    if (newTime !== null) {
      this.updatePromises();
      newTime = Number(newTime);
      if (isNaN(newTime)) return;
      if (this._paused || this._idle) return;
      this._startTime = newTime;
      this.tickCurrentTime(
        (Number(this.timeline.currentTime) - this._startTime) *
          this.playbackRate,
      );
      this.timeline.applyDirtiedAnimation(this);
      this.updatePromises();
    }
  }

  private _playbackRate = 1;
  get playbackRate() {
    return this._playbackRate;
  }
  set playbackRate(value: number) {
    if (value === this._playbackRate) {
      return;
    }

    this.updatePromises();
    const oldCurrentTime = this.currentTime;
    this._playbackRate = value;
    this.startTime = null;
    if (this.playState !== 'paused' && this.playState !== 'idle') {
      this._finishedFlag = false;
      this._idle = false;
      this.ensureAlive();
      this.timeline.applyDirtiedAnimation(this);
    }
    if (oldCurrentTime !== null) {
      this.currentTime = oldCurrentTime;
    }
    this.updatePromises();
  }

  get _isFinished() {
    return (
      !this._idle &&
      ((this._playbackRate > 0 &&
        Number(this._currentTime) >= this._totalDuration) ||
        (this._playbackRate < 0 && Number(this._currentTime) <= 0))
    );
  }

  _totalDuration: number;
  get totalDuration() {
    return this._totalDuration;
  }

  _inEffect: boolean;
  _inTimeline = true;
  get _needsTick() {
    return this.pending || this.playState === 'running' || !this._finishedFlag;
  }

  constructor(effect: KeyframeEffect, timeline: AnimationTimeline) {
    this.effect = effect;
    effect.animation = this;
    this.timeline = timeline;
    this.id = `${sequenceNumber++}`;

    this._inEffect = !!this.effect.update(0);
    this._totalDuration = Number(this.effect?.getComputedTiming().endTime);
    this._holdTime = 0;
    this._paused = false;
    this.oldPlayState = 'idle';
    this.updatePromises();
  }

  /**
   * state machine,
   * resolve/reject ready/finished Promise according to current state
   */
  updatePromises() {
    const { oldPlayState } = this;
    const newPlayState = this.pending ? 'pending' : this.playState;
    if (this.readyPromise && newPlayState !== oldPlayState) {
      if (newPlayState === 'idle') {
        this.rejectReadyPromise();
        this.readyPromise = undefined;
      } else if (oldPlayState === 'pending') {
        this.resolveReadyPromise();
      } else if (newPlayState === 'pending') {
        this.readyPromise = undefined;
      }
    }
    if (this.finishedPromise && newPlayState !== oldPlayState) {
      if (newPlayState === 'idle') {
        this.rejectFinishedPromise();
        this.finishedPromise = undefined;
      } else if (newPlayState === 'finished') {
        this.resolveFinishedPromise();
      } else if (oldPlayState === 'finished') {
        this.finishedPromise = undefined;
      }
    }
    this.oldPlayState = newPlayState;
    return this.readyPromise || this.finishedPromise;
  }

  play() {
    this.updatePromises();
    this._paused = false;
    if (this._isFinished || this._idle) {
      this.rewind();
      this._startTime = null;
    }
    this._finishedFlag = false;
    this._idle = false;
    this.ensureAlive();
    this.timeline.applyDirtiedAnimation(this);

    if (this.timeline.animations.indexOf(this) === -1) {
      this.timeline.animations.push(this);
    }

    this.updatePromises();
  }

  pause() {
    this.updatePromises();
    if (this.currentTime) {
      this._holdTime = this.currentTime;
    }

    if (!this._isFinished && !this._paused && !this._idle) {
      this.currentTimePending = true;
    } else if (this._idle) {
      this.rewind();
      this._idle = false;
    }
    this._startTime = null;
    this._paused = true;

    this.updatePromises();
  }

  finish() {
    this.updatePromises();
    if (this._idle) return;
    this.currentTime = this._playbackRate > 0 ? this._totalDuration : 0;
    this._startTime = this._totalDuration - this.currentTime;
    this.currentTimePending = false;
    this.timeline.applyDirtiedAnimation(this);

    this.updatePromises();
  }

  cancel() {
    this.updatePromises();
    if (!this._inEffect) return;
    this._inEffect = false;
    this._idle = true;
    this._paused = false;
    this._finishedFlag = true;
    this._currentTime = 0;
    this._startTime = null;
    this.effect.update(null);
    // effects are invalid after cancellation as the animation state
    // needs to un-apply.
    this.timeline.applyDirtiedAnimation(this);

    this.updatePromises();

    /**
     * 1. Reject the current finished promise with a DOMException named "AbortError".
     * 2. Let current finished promise be a new promise
     * @see https://w3c.github.io/csswg-drafts/web-animations-1/#canceling-an-animation-section
     */
    // if (this.finishedPromise) {
    //   this.rejectFinishedPromise();
    //   this.finishedPromise = undefined;
    // }

    if (this.oncancel) {
      const event = new AnimationEvent(
        null,
        this,
        this.currentTime,
        null,
      ) as AnimationPlaybackEvent;
      setTimeout(() => {
        this.oncancel(event);
      });
    }
  }

  reverse() {
    this.updatePromises();
    const oldCurrentTime = this.currentTime;

    this.playbackRate *= -1;
    this.play();

    if (oldCurrentTime !== null) {
      this.currentTime = oldCurrentTime;
    }
    this.updatePromises();
  }

  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Animation/updatePlaybackRate
   */
  updatePlaybackRate(playbackRate: number): void {
    this.playbackRate = playbackRate;
  }

  targetAnimations() {
    const target = this.effect?.target as unknown as DisplayObject;
    return target.getAnimations();
  }
  markTarget() {
    const animations = this.targetAnimations();
    if (animations.indexOf(this) === -1) {
      animations.push(this);
    }
  }
  unmarkTarget() {
    const animations = this.targetAnimations();
    const index = animations.indexOf(this);
    if (index !== -1) {
      animations.splice(index, 1);
    }
  }

  tick(timelineTime: number, isAnimationFrame: boolean) {
    if (!this._idle && !this._paused) {
      if (this._startTime === null) {
        if (isAnimationFrame) {
          this.startTime = timelineTime - this._currentTime / this.playbackRate;
        }
      } else if (!this._isFinished) {
        this.tickCurrentTime(
          (timelineTime - this._startTime) * this.playbackRate,
        );
      }
    }

    if (isAnimationFrame) {
      this.currentTimePending = false;
      this.fireEvents(timelineTime);
    }
  }

  private rewind() {
    if (this.playbackRate >= 0) {
      this.currentTime = 0;
    } else if (this._totalDuration < Infinity) {
      this.currentTime = this._totalDuration;
    } else {
      throw new Error(
        'Unable to rewind negative playback rate animation with infinite duration',
      );
    }
  }

  persist(): void {
    throw new Error(ERROR_MSG_METHOD_NOT_IMPLEMENTED);
  }

  addEventListener<K extends keyof AnimationEventMap>(
    type: K,
    listener: (this: Animation, ev: AnimationEventMap[K]) => any,
    options?: boolean | AddEventListenerOptions,
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions,
  ): void;

  addEventListener(type: any, listener: any, options?: any): void {
    throw new Error(ERROR_MSG_METHOD_NOT_IMPLEMENTED);
  }
  removeEventListener<K extends keyof AnimationEventMap>(
    type: K,
    listener: (this: Animation, ev: AnimationEventMap[K]) => any,
    options?: boolean | EventListenerOptions,
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions,
  ): void;

  removeEventListener(type: any, listener: any, options?: any): void {
    throw new Error(ERROR_MSG_METHOD_NOT_IMPLEMENTED);
  }

  dispatchEvent(event: Event): boolean {
    throw new Error(ERROR_MSG_METHOD_NOT_IMPLEMENTED);
  }
  onremove: ((this: Animation, ev: Event) => any) | null;
  // replaceState: AnimationReplaceState;
  commitStyles(): void {
    throw new Error(ERROR_MSG_METHOD_NOT_IMPLEMENTED);
  }

  private ensureAlive() {
    // If an animation is playing backwards and is not fill backwards/both
    // then it should go out of effect when it reaches the start of its
    // active interval (currentTime === 0).
    if (this.playbackRate < 0 && this.currentTime === 0) {
      this._inEffect = !!this.effect?.update(-1);
    } else {
      this._inEffect = !!this.effect?.update(this.currentTime);
    }
    if (!this._inTimeline && (this._inEffect || !this._finishedFlag)) {
      this._inTimeline = true;
      this.timeline.animations.push(this);
    }
  }

  private tickCurrentTime(newTime: number, ignoreLimit?: boolean) {
    if (newTime !== this._currentTime) {
      this._currentTime = newTime;
      if (this._isFinished && !ignoreLimit) {
        this._currentTime = this._playbackRate > 0 ? this._totalDuration : 0;
      }
      this.ensureAlive();
    }
  }

  private fireEvents(baseTime: number) {
    if (this._isFinished) {
      if (!this._finishedFlag) {
        if (this.onfinish) {
          const event = new AnimationEvent(
            null,
            this,
            this.currentTime,
            baseTime,
          ) as AnimationPlaybackEvent;
          setTimeout(() => {
            if (this.onfinish) {
              this.onfinish(event);
            }
          });
        }
        this._finishedFlag = true;
      }
    } else {
      if (this.onframe && this.playState === 'running') {
        const event = new AnimationEvent(
          null,
          this,
          this.currentTime,
          baseTime,
        ) as AnimationPlaybackEvent;
        this.onframe(event);
      }
      this._finishedFlag = false;
    }
  }
}
