import type { EventService } from '../services';
import { Point } from '../shapes/Point';
import { ERROR_MSG_METHOD_NOT_IMPLEMENTED } from '../utils';
import type { IEventTarget } from './interfaces';

export function isFederatedEvent(value: any): value is FederatedEvent {
  return !!(value as FederatedEvent).type;
}

/**
 * An DOM-compatible synthetic event implementation that is "forwarded" on behalf of an original
 * FederatedEvent or native Event.
 */
export class FederatedEvent<N extends Event = Event, T = any> {
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
   * @deprecated
   */
  get name() {
    return this.type;
  }

  /**
   * The propagation phase.
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Event/eventPhase
   */
  eventPhase = FederatedEvent.prototype.NONE;

  /**
   * can be used to implement event delegation
   * @see https://developer.mozilla.org/zh-CN/docs/Web/API/Event/target
   */
  target: IEventTarget | null;

  /**
   * @see https://developer.mozilla.org/zh-CN/docs/Web/API/Event/bubbles
   */
  bubbles = true;
  /**
   * @see https://developer.mozilla.org/zh-CN/docs/Web/API/Event/cancelBubble
   */
  cancelBubble = true;

  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Event/cancelable
   */
  readonly cancelable = false;

  /** the event target when listeners binded */
  currentTarget: IEventTarget | null;

  /** Flags whether the default response of the user agent was prevent through this event. */
  defaultPrevented = false;

  /**
   * timestamp when the event created
   * @see https://developer.mozilla.org/zh-CN/docs/Web/API/Event/timeStamp
   */
  timeStamp: number;

  /**
   * the original event.
   */
  nativeEvent: N;

  /** The original event that caused this event, if any. */
  originalEvent: FederatedEvent<N>;

  /** Flags whether propagation was stopped. */
  propagationStopped = false;

  /** Flags whether propagation was immediately stopped. */
  propagationImmediatelyStopped = false;

  manager: EventService | null;

  /** Event-specific detail */
  detail: T;

  /**
   * The coordinates of the evnet relative to the nearest DOM layer.
   * This is a non-standard property.
   */
  layer: Point = new Point();
  get layerX(): number {
    return this.layer.x;
  }
  get layerY(): number {
    return this.layer.y;
  }

  /**
   * The coordinates of the event relative to the DOM document.
   * This is a non-standard property.
   * relative to the DOM document.
   * @see https://developer.mozilla.org/zh-CN/docs/Web/API/MouseEvent/pageX
   */
  page: Point = new Point();
  get pageX(): number {
    return this.page.x;
  }
  get pageY(): number {
    return this.page.y;
  }

  /**
   * relative to Canvas, origin is left-top
   */
  canvas: Point = new Point();
  get x(): number {
    return this.canvas.x;
  }
  get y(): number {
    return this.canvas.y;
  }
  get canvasX(): number {
    return this.canvas.x;
  }
  get canvasY(): number {
    return this.canvas.y;
  }

  /**
   * relative to Viewport, account for Camera
   */
  viewport: Point = new Point();
  get viewportX(): number {
    return this.viewport.x;
  }
  get viewportY(): number {
    return this.viewport.y;
  }

  /**
   * The event boundary which manages this event. Propagation can only occur
   *  within the boundary's jurisdiction.
   */
  constructor(manager: EventService | null) {
    this.manager = manager;
  }

  path: IEventTarget[];
  /**
   * The propagation path for this event
   * @see https://developer.mozilla.org/zh-CN/docs/Web/API/Event/composedPath
   *
   * So composedPath()[0] represents the original target.
   * @see https://polymer-library.polymer-project.org/3.0/docs/devguide/events#retargeting
   */
  composedPath(): IEventTarget[] {
    if (this.manager && (!this.path || this.path[0] !== this.target)) {
      this.path = this.target ? this.manager.propagationPath(this.target) : [];
    }

    return this.path;
  }
  /**
   * @deprecated
   */
  get propagationPath() {
    return this.composedPath();
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
   * @see https://developer.mozilla.org/en-US/docs/Web/API/UIEvent/view
   */
  view: any;

  /**
   * added for compatibility with DOM Event,
   * deprecated props and methods
   */
  initEvent(): void {}
  initUIEvent(): void {}
  which: number;
  returnValue: boolean;
  srcElement: IEventTarget;
  readonly composed = false;
  isTrusted: boolean;

  clone() {
    throw new Error(ERROR_MSG_METHOD_NOT_IMPLEMENTED);
  }

  NONE = 0;
  CAPTURING_PHASE = 1;
  AT_TARGET = 2;
  BUBBLING_PHASE = 3;
}
