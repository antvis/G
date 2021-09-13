import { FederatedEvent } from './dom/FederatedEvent';
import type { EventService } from './services';

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/API/AnimationPlaybackEvent
 */
export class AnimationEvent extends FederatedEvent implements AnimationPlaybackEvent {
  constructor(
    manager: EventService | null,
    target: Animation,
    public currentTime: number | null,
    public timelineTime: number,
  ) {
    super(manager);

    // @ts-ignore
    this.target = target;
    this.type = 'finish';
    this.bubbles = false;
    // @ts-ignore
    this.currentTarget = target;
    this.defaultPrevented = false;
    this.eventPhase = this.AT_TARGET;
    this.timeStamp = Date.now();
    this.currentTime = currentTime;
    this.timelineTime = timelineTime;
  }
}
