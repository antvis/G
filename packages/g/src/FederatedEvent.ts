import { DisplayObject } from './DisplayObject';
import { Point } from './shapes/Point';
import { EventService } from './services';

/**
 * An DOM-compatible synthetic event implementation that is "forwarded" on behalf of an original
 * FederatedEvent or native {@link https://dom.spec.whatwg.org/#event Event}.
 */
export class FederatedEvent<N extends UIEvent = UIEvent> implements UIEvent {
  /**
   * The type of event, supports the following:
   * * pointerdown
   * * touchstart
   * * mousedown
   * * rightdown
   * * ...
   */
  type: string;

  /**
   * The propagation phase.
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Event/eventPhase
   */
  eventPhase = FederatedEvent.prototype.NONE;

  /**
   * The event target that this will be dispatched to.
   */
  target: DisplayObject | null;

  bubbles = true;
  cancelBubble = true;

  /**
   * Flags whether this event can be canceled using `preventDefault`.
   */
  readonly cancelable = false;

  /** The listeners of the event target that are being notified. */
  currentTarget: DisplayObject | null;

  /** Flags whether the default response of the user agent was prevent through this event. */
  defaultPrevented = false;

  /** The timestamp of when the event was created. */
  timeStamp: number;

  /** The native event that caused the foremost original event. */
  nativeEvent: N;

  /** The original event that caused this event, if any. */
  originalEvent: FederatedEvent<N>;

  /** Flags whether propagation was stopped. */
  propagationStopped = false;

  /** Flags whether propagation was immediately stopped. */
  propagationImmediatelyStopped = false;

  /** The composed path of the event's propagation. The target is at the end. */
  path: DisplayObject[];

  readonly manager: EventService | null;

  /** Event-specific detail */
  detail: number;

  /**
   * The coordinates of the evnet relative to the nearest DOM layer.
   * This is a non-standard property.
   */
  layer: Point = new Point();
  get layerX(): number { return this.layer.x; }
  get layerY(): number { return this.layer.y; }

  /**
   * The coordinates of the event relative to the DOM document.
   * This is a non-standard property.
   */
  page: Point = new Point();
  get pageX(): number { return this.page.x; }
  get pageY(): number { return this.page.y; }

  /**
   * The event boundary which manages this event. Propagation can only occur
   *  within the boundary's jurisdiction.
   */
  constructor(manager: EventService | null) {
    this.manager = manager;
  }

  /**
   * The propagation path for this event
   */
  composedPath(): DisplayObject[] {
    // Find the propagation path if it isn't cached or if the target has changed since since
    // the last evaluation.
    if (this.manager && (!this.path || this.path[this.path.length - 1] !== this.target)) {
      this.path = this.target ? this.manager.propagationPath(this.target) : [];
    }

    return this.path;
  }

  /**
   * @see https://developer.mozilla.org/zh-CN/docs/Web/API/Event/preventDefault
   */
  preventDefault(): void {
    if (this.nativeEvent instanceof Event && this.nativeEvent.cancelable) {
      this.nativeEvent.preventDefault();
    }

    this.defaultPrevented = true;
  }

  /**
   * @see https://developer.mozilla.org/zh-CN/docs/Web/API/Event/stopImmediatePropagation
   */
  stopImmediatePropagation(): void {
    this.propagationImmediatelyStopped = true;
  }

  /**
   * @see https://developer.mozilla.org/zh-CN/docs/Web/API/Event/stopPropagation
   */
  stopPropagation(): void {
    this.propagationStopped = true;
  }

  /**
   * added for compatibility with DOM Event,
   * deprecated props and methods
   */
  initEvent(): void { }
  view: WindowProxy;
  which: number;
  returnValue: boolean;
  srcElement: EventTarget;
  readonly composed = false;
  isTrusted: boolean;

  NONE = 0;
  CAPTURING_PHASE = 1;
  AT_TARGET = 2;
  BUBBLING_PHASE = 3;
}
