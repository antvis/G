import { inject, singleton } from 'mana-syringe';
import type { ICanvas, FederatedMouseEvent } from '../dom';
import { FederatedPointerEvent } from '../dom/FederatedPointerEvent';
import { FederatedWheelEvent } from '../dom/FederatedWheelEvent';
import { RenderingContext } from '../services';
import type { RenderingPlugin } from '../services';
import {
  ContextService,
  RenderingService,
  EventService,
  RenderingPluginContribution,
} from '../services';
import { Point } from '../shapes';
import type { Cursor, EventPosition, InteractivePointerEvent } from '../types';
import { CanvasConfig } from '../types';
import { normalizeToPointerEvent, supportsTouchEvents, TOUCH_TO_POINTER } from '../utils/event';

/**
 * support mouse & touch events
 * @see https://github.com/pixijs/pixi.js/blob/dev/packages/interaction/README.md
 *
 * also provide some extra events such as `drag`
 */
@singleton({ contrib: RenderingPluginContribution })
export class EventPlugin implements RenderingPlugin {
  static tag = 'EventPlugin';

  @inject(CanvasConfig)
  private canvasConfig: CanvasConfig;

  @inject(ContextService)
  private contextService: ContextService<unknown>;

  @inject(RenderingService)
  private renderingService: RenderingService;

  @inject(RenderingContext)
  private renderingContext: RenderingContext;

  @inject(EventService)
  private eventService: EventService;

  private autoPreventDefault = true;
  private rootPointerEvent = new FederatedPointerEvent(null);
  private rootWheelEvent = new FederatedWheelEvent(null);

  apply(renderingService: RenderingService) {
    this.eventService.setPickHandler(async (position: EventPosition) => {
      const { picked } = await this.renderingService.hooks.pick.promise({
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

        const event = normalizeToPointerEvent(nativeEvent);

        if (this.autoPreventDefault && (event as any).isNormalized) {
          const cancelable = nativeEvent.cancelable || !('cancelable' in nativeEvent);

          if (cancelable) {
            nativeEvent.preventDefault();
          }
        }

        const federatedEvent = this.bootstrapEvent(
          this.rootPointerEvent,
          event,
          this.renderingContext.root?.ownerDocument?.defaultView,
        );
        this.eventService.mapEvent(federatedEvent);

        this.setCursor(this.eventService.cursor);
      },
    );

    renderingService.hooks.pointerUp.tap(
      EventPlugin.tag,
      (nativeEvent: InteractivePointerEvent) => {
        if (supportsTouchEvents && (nativeEvent as PointerEvent).pointerType === 'touch') return;

        // account for element in SVG
        const $element = this.contextService.getDomElement();
        const outside =
          $element &&
          nativeEvent.target &&
          nativeEvent.target !== $element &&
          // @ts-ignore
          $element.contains &&
          // @ts-ignore
          !$element.contains(nativeEvent.target)
            ? 'outside'
            : '';
        const normalizedEvent = normalizeToPointerEvent(nativeEvent);

        const event = this.bootstrapEvent(
          this.rootPointerEvent,
          normalizedEvent,
          this.renderingContext.root?.ownerDocument?.defaultView,
        );
        event.type += outside;
        this.eventService.mapEvent(event);

        this.setCursor(this.eventService.cursor);
      },
    );

    renderingService.hooks.pointerMove.tap(EventPlugin.tag, this.onPointerMove);

    renderingService.hooks.pointerOver.tap(EventPlugin.tag, this.onPointerMove);

    renderingService.hooks.pointerOut.tap(EventPlugin.tag, this.onPointerMove);
  }

  private onPointerMove = (nativeEvent: InteractivePointerEvent) => {
    if (supportsTouchEvents && (nativeEvent as PointerEvent).pointerType === 'touch') return;

    const normalizedEvent = normalizeToPointerEvent(nativeEvent);

    const event = this.bootstrapEvent(
      this.rootPointerEvent,
      normalizedEvent,
      this.renderingContext.root?.ownerDocument?.defaultView,
    );

    this.eventService.mapEvent(event);

    this.setCursor(this.eventService.cursor);
  };

  private bootstrapEvent(
    event: FederatedPointerEvent,
    nativeEvent: PointerEvent,
    view: ICanvas,
  ): FederatedPointerEvent {
    event.view = view;
    // @ts-ignore
    event._originalEvent = null;
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

    const { x, y } = this.eventService.client2Viewport(
      new Point(nativeEvent.clientX, nativeEvent.clientY),
    );
    event.viewport.x = x;
    event.viewport.y = y;
    const { x: canvasX, y: canvasY } = this.eventService.viewport2Canvas(event.viewport);
    event.canvas.x = canvasX;
    event.canvas.y = canvasY;
    event.global.copyFrom(event.canvas);
    event.offset.copyFrom(event.canvas);

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

    const { x, y } = this.eventService.client2Viewport(
      new Point(nativeEvent.clientX, nativeEvent.clientY),
    );
    event.viewport.x = x;
    event.viewport.y = y;
    const { x: canvasX, y: canvasY } = this.eventService.viewport2Canvas(event.viewport);
    event.canvas.x = canvasX;
    event.canvas.y = canvasY;
    event.global.copyFrom(event.canvas);
    event.offset.copyFrom(event.canvas);

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
    event.screen.x = nativeEvent.screenX;
    event.screen.y = nativeEvent.screenY;
    event.relatedTarget = null;
  }

  private setCursor(cursor: Cursor | null) {
    this.contextService.applyCursorStyle(cursor || this.canvasConfig.cursor || 'default');
  }
}
