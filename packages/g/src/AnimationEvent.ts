import { FederatedEvent } from './FederatedEvent';
import { EventService } from './services';
import { DisplayObject } from './DisplayObject';

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/API/AnimationPlaybackEvent
 */
export class AnimationEvent extends FederatedEvent implements globalThis.AnimationPlaybackEvent {
  constructor(
    manager: EventService | null,
    target: DisplayObject,
    public currentTime: number,
    public timelineTime: number,
  ) {
    super(manager);

    this.target = target;
    this.type = 'finish';
    this.bubbles = false;
    this.currentTarget = target;
    this.defaultPrevented = false;
    this.eventPhase = this.AT_TARGET;
    this.timeStamp = Date.now();
  }
}