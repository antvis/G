import { inject, injectable } from 'inversify';
import { FederatedMouseEvent } from '../FederatedMouseEvent';
import { FederatedPointerEvent } from '../FederatedPointerEvent';
import { FederatedWheelEvent } from '../FederatedWheelEvent';
import { ContextService, RenderingPlugin, RenderingService, EventService } from '../services';
import { CanvasConfig, Cursor, EventPosition, InteractivePointerEvent } from '../types';
import { normalizeToPointerEvent, supportsTouchEvents, TOUCH_TO_POINTER } from '../utils/event';

/**
 * support mouse & touch events
 * @see https://github.com/pixijs/pixi.js/blob/dev/packages/interaction/README.md
 *
 * also provide some extra events such as `drag`
 */
@injectable()
export class EventPlugin implements RenderingPlugin {
  static tag = 'EventPlugin';

  @inject(CanvasConfig)
  private canvasConfig: CanvasConfig;

  @inject(ContextService)
  private contextService: ContextService<unknown>;

  @inject(RenderingService)
  private renderingService: RenderingService;

  @inject(EventService)
  private eventService: EventService;

  private autoPreventDefault = true;
  private rootPointerEvent = new FederatedPointerEvent(null);
  private rootWheelEvent = new FederatedWheelEvent(null);

  apply(renderingService: RenderingService) {
    this.eventService.setPickHandler((position: EventPosition) => {
      const { picked } = this.renderingService.hooks.pick.call({
        position,
        picked: null,
      });

      return picked;
    });

    renderingService.hooks.pointerWheel.tap(
      EventPlugin.tag,
      (nativeEvent: InteractivePointerEvent) => {
        const wheelEvent = this.normalizeWheelEvent(nativeEvent as WheelEvent);

        this.eventService.mapEvent(wheelEvent);
      },
    );

    renderingService.hooks.pointerDown.tap(
      EventPlugin.tag,
      (nativeEvent: InteractivePointerEvent) => {
        if (supportsTouchEvents && (nativeEvent as PointerEvent).pointerType === 'touch') {
          return;
        }

        const events = normalizeToPointerEvent(nativeEvent);

        if (this.autoPreventDefault && (events[0] as any).isNormalized) {
          const cancelable = nativeEvent.cancelable || !('cancelable' in nativeEvent);

          if (cancelable) {
            nativeEvent.preventDefault();
          }
        }

        for (const event of events) {
          const federatedEvent = this.bootstrapEvent(this.rootPointerEvent, event);
          this.eventService.mapEvent(federatedEvent);
        }

        this.setCursor(this.eventService.cursor);
      },
    );

    renderingService.hooks.pointerUp.tap(
      EventPlugin.tag,
      (nativeEvent: InteractivePointerEvent) => {
        if (supportsTouchEvents && (nativeEvent as PointerEvent).pointerType === 'touch') return;

        const outside = nativeEvent.target !== this.contextService.getDomElement()
          ? 'outside' : '';
        const normalizedEvents = normalizeToPointerEvent(nativeEvent);

        for (const normalizedEvent of normalizedEvents) {
          const event = this.bootstrapEvent(this.rootPointerEvent, normalizedEvent);
          event.type += outside;
          this.eventService.mapEvent(event);
        }

        this.setCursor(this.eventService.cursor);
      },
    );

    renderingService.hooks.pointerMove.tap(
      EventPlugin.tag,
      this.onPointerMove,
    );

    renderingService.hooks.pointerOver.tap(
      EventPlugin.tag,
      this.onPointerMove,
    );

    renderingService.hooks.pointerOut.tap(
      EventPlugin.tag,
      this.onPointerMove,
    );
  }

  private onPointerMove = (nativeEvent: InteractivePointerEvent) => {
    if (supportsTouchEvents && (nativeEvent as PointerEvent).pointerType === 'touch') return;

    const normalizedEvents = normalizeToPointerEvent(nativeEvent);

    for (const normalizedEvent of normalizedEvents) {
      const event = this.bootstrapEvent(this.rootPointerEvent, normalizedEvent);

      this.eventService.mapEvent(event);
    }

    this.setCursor(this.eventService.cursor);
  }

  private bootstrapEvent(event: FederatedPointerEvent, nativeEvent: PointerEvent): FederatedPointerEvent {
    // @ts-ignore
    event.originalEvent = null;
    event.nativeEvent = nativeEvent;

    event.pointerId = nativeEvent.pointerId;
    event.width = nativeEvent.width;
    event.height = nativeEvent.height;
    event.isPrimary = nativeEvent.isPrimary;
    event.pointerType = nativeEvent.pointerType;
    event.pressure = nativeEvent.pressure;
    event.tangentialPressure = nativeEvent.tangentialPressure;
    event.tiltX = nativeEvent.tiltX;
    event.tiltY = nativeEvent.tiltY;
    event.twist = nativeEvent.twist;
    this.transferMouseData(event, nativeEvent);

    // calc position
    const bbox = this.contextService.getBoundingClientRect();
    event.screen.x = nativeEvent.clientX - ((bbox && bbox.left) || 0);
    event.screen.y = nativeEvent.clientY - ((bbox && bbox.top) || 0);
    event.global.copyFrom(event.screen);
    event.offset.copyFrom(event.screen);

    event.isTrusted = nativeEvent.isTrusted;
    if (event.type === 'pointerleave') {
      event.type = 'pointerout';
    }
    if (event.type.startsWith('mouse')) {
      event.type = event.type.replace('mouse', 'pointer');
    }
    if (event.type.startsWith('touch')) {
      event.type = TOUCH_TO_POINTER[event.type] || event.type;
    }

    return event;
  }

  private normalizeWheelEvent(nativeEvent: WheelEvent): FederatedWheelEvent {
    const event = this.rootWheelEvent;

    this.transferMouseData(event, nativeEvent);

    event.deltaMode = nativeEvent.deltaMode;
    event.deltaX = nativeEvent.deltaX;
    event.deltaY = nativeEvent.deltaY;
    event.deltaZ = nativeEvent.deltaZ;

    // calc position
    const bbox = this.contextService.getBoundingClientRect();
    event.screen.x = nativeEvent.clientX - ((bbox && bbox.left) || 0);
    event.screen.y = nativeEvent.clientY - ((bbox && bbox.top) || 0);
    event.global.copyFrom(event.screen);
    event.offset.copyFrom(event.screen);

    event.nativeEvent = nativeEvent;
    event.type = nativeEvent.type;

    return event;
  }

  /**
   * Transfers base & mouse event data from the nativeEvent to the federated event.
   */
  private transferMouseData(event: FederatedMouseEvent, nativeEvent: MouseEvent): void {
    event.isTrusted = nativeEvent.isTrusted;
    event.timeStamp = performance.now();
    event.type = nativeEvent.type;

    event.altKey = nativeEvent.altKey;
    event.button = nativeEvent.button;
    event.buttons = nativeEvent.buttons;
    event.client.x = nativeEvent.clientX;
    event.client.y = nativeEvent.clientY;
    event.ctrlKey = nativeEvent.ctrlKey;
    event.metaKey = nativeEvent.metaKey;
    event.movement.x = nativeEvent.movementX;
    event.movement.y = nativeEvent.movementY;
    event.page.x = nativeEvent.pageX;
    event.page.y = nativeEvent.pageY;
    event.relatedTarget = null;
  }

  private setCursor(cursor: Cursor | null) {
    this.contextService.applyCursorStyle(cursor || this.canvasConfig.cursor || 'default');
  }
}
