import { isUndefined } from '@antv/util';
import type { FederatedMouseEvent, ICanvas, IEventTarget } from '../dom';
import { FederatedPointerEvent } from '../dom/FederatedPointerEvent';
import { FederatedWheelEvent } from '../dom/FederatedWheelEvent';
import type { RenderingPlugin, RenderingPluginContext } from '../services';
import type { Cursor, EventPosition, InteractivePointerEvent } from '../types';
import type { FormattedPointerEvent, FormattedTouch } from '../utils/event';
import { MOUSE_POINTER_ID, TOUCH_TO_POINTER, clock } from '../utils/event';

/**
 * support mouse & touch events
 * @see https://github.com/pixijs/pixi.js/blob/dev/packages/interaction/README.md
 *
 * also provide some extra events such as `drag`
 */
export class EventPlugin implements RenderingPlugin {
  static tag = 'Event';

  private autoPreventDefault = false;
  private rootPointerEvent = new FederatedPointerEvent(null);
  private rootWheelEvent = new FederatedWheelEvent(null);

  private context: RenderingPluginContext;

  apply(context: RenderingPluginContext) {
    this.context = context;
    const { renderingService } = context;

    const canvas = this.context.renderingContext.root.ownerDocument.defaultView;

    this.context.eventService.setPickHandler((position: EventPosition) => {
      const { picked } = this.context.renderingService.hooks.pickSync.call({
        position,
        picked: [],
        topmost: true, // we only concern the topmost element
      });
      return picked[0] || null;
    });

    renderingService.hooks.pointerWheel.tap(
      EventPlugin.tag,
      (nativeEvent: InteractivePointerEvent) => {
        const wheelEvent = this.normalizeWheelEvent(nativeEvent as WheelEvent);

        this.context.eventService.mapEvent(wheelEvent);
      },
    );

    renderingService.hooks.pointerDown.tap(
      EventPlugin.tag,
      (nativeEvent: InteractivePointerEvent) => {
        if (
          canvas.supportsTouchEvents &&
          (nativeEvent as PointerEvent).pointerType === 'touch'
        )
          return;

        const events = this.normalizeToPointerEvent(nativeEvent, canvas);

        if (this.autoPreventDefault && (events[0] as any).isNormalized) {
          const cancelable =
            nativeEvent.cancelable || !('cancelable' in nativeEvent);

          if (cancelable) {
            nativeEvent.preventDefault();
          }
        }

        for (const event of events) {
          const federatedEvent = this.bootstrapEvent(
            this.rootPointerEvent,
            event,
            canvas,
            nativeEvent,
          );
          this.context.eventService.mapEvent(federatedEvent);
        }

        this.setCursor(this.context.eventService.cursor);
      },
    );

    renderingService.hooks.pointerUp.tap(
      EventPlugin.tag,
      (nativeEvent: InteractivePointerEvent) => {
        if (
          canvas.supportsTouchEvents &&
          (nativeEvent as PointerEvent).pointerType === 'touch'
        )
          return;

        // account for element in SVG
        const $element =
          this.context.contextService.getDomElement() as HTMLCanvasElement;

        const isNativeEventFromCanvas =
          this.context.eventService.isNativeEventFromCanvas(
            $element,
            nativeEvent,
          );
        const outside = !isNativeEventFromCanvas ? 'outside' : '';
        const normalizedEvents = this.normalizeToPointerEvent(
          nativeEvent,
          canvas,
        );

        for (const normalizedEvent of normalizedEvents) {
          const event = this.bootstrapEvent(
            this.rootPointerEvent,
            normalizedEvent,
            canvas,
            nativeEvent,
          );
          event.type += outside;
          this.context.eventService.mapEvent(event);
        }

        this.setCursor(this.context.eventService.cursor);
      },
    );

    renderingService.hooks.pointerMove.tap(EventPlugin.tag, this.onPointerMove);

    renderingService.hooks.pointerOver.tap(EventPlugin.tag, this.onPointerMove);

    renderingService.hooks.pointerOut.tap(EventPlugin.tag, this.onPointerMove);

    renderingService.hooks.click.tap(EventPlugin.tag, this.onClick);

    renderingService.hooks.pointerCancel.tap(
      EventPlugin.tag,
      (nativeEvent: InteractivePointerEvent) => {
        const normalizedEvents = this.normalizeToPointerEvent(
          nativeEvent,
          canvas,
        );

        for (const normalizedEvent of normalizedEvents) {
          const event = this.bootstrapEvent(
            this.rootPointerEvent,
            normalizedEvent,
            canvas,
            nativeEvent,
          );
          this.context.eventService.mapEvent(event);
        }
        this.setCursor(this.context.eventService.cursor);
      },
    );
  }

  private onPointerMove = (nativeEvent: InteractivePointerEvent) => {
    const canvas =
      this.context.renderingContext.root?.ownerDocument?.defaultView;
    if (
      canvas.supportsTouchEvents &&
      (nativeEvent as PointerEvent).pointerType === 'touch'
    )
      return;

    const normalizedEvents = this.normalizeToPointerEvent(nativeEvent, canvas);

    for (const normalizedEvent of normalizedEvents) {
      const event = this.bootstrapEvent(
        this.rootPointerEvent,
        normalizedEvent,
        canvas,
        nativeEvent,
      );

      this.context.eventService.mapEvent(event);
    }

    this.setCursor(this.context.eventService.cursor);
  };

  private onClick = (nativeEvent: InteractivePointerEvent) => {
    const canvas =
      this.context.renderingContext.root?.ownerDocument?.defaultView;

    const normalizedEvents = this.normalizeToPointerEvent(nativeEvent, canvas);

    for (const normalizedEvent of normalizedEvents) {
      const event = this.bootstrapEvent(
        this.rootPointerEvent,
        normalizedEvent,
        canvas,
        nativeEvent,
      );

      this.context.eventService.mapEvent(event);
    }

    this.setCursor(this.context.eventService.cursor);
  };

  private bootstrapEvent(
    event: FederatedPointerEvent,
    normalizedEvent: PointerEvent,
    view: ICanvas,
    nativeEvent: PointerEvent | MouseEvent | TouchEvent,
  ): FederatedPointerEvent {
    event.view = view;
    event.originalEvent = null;
    event.nativeEvent = nativeEvent;

    event.pointerId = normalizedEvent.pointerId;
    event.width = normalizedEvent.width;
    event.height = normalizedEvent.height;
    event.isPrimary = normalizedEvent.isPrimary;
    event.pointerType = normalizedEvent.pointerType;
    event.pressure = normalizedEvent.pressure;
    event.tangentialPressure = normalizedEvent.tangentialPressure;
    event.tiltX = normalizedEvent.tiltX;
    event.tiltY = normalizedEvent.tiltY;
    event.twist = normalizedEvent.twist;
    this.transferMouseData(event, normalizedEvent);

    const { x, y } = this.context.eventService.client2Viewport({
      x: normalizedEvent.clientX,
      y: normalizedEvent.clientY,
    });
    event.viewport.x = x;
    event.viewport.y = y;
    const { x: canvasX, y: canvasY } =
      this.context.eventService.viewport2Canvas(event.viewport);
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

    const { x, y } = this.context.eventService.client2Viewport({
      x: nativeEvent.clientX,
      y: nativeEvent.clientY,
    });
    event.viewport.x = x;
    event.viewport.y = y;
    const { x: canvasX, y: canvasY } =
      this.context.eventService.viewport2Canvas(event.viewport);
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
  private transferMouseData(
    event: FederatedMouseEvent,
    nativeEvent: MouseEvent,
  ): void {
    event.isTrusted = nativeEvent.isTrusted;
    event.srcElement = nativeEvent.srcElement as IEventTarget;
    event.timeStamp = clock.now();
    event.type = nativeEvent.type;

    event.altKey = nativeEvent.altKey;
    event.metaKey = nativeEvent.metaKey;
    event.shiftKey = nativeEvent.shiftKey;
    event.ctrlKey = nativeEvent.ctrlKey;
    event.button = nativeEvent.button;
    event.buttons = nativeEvent.buttons;
    event.client.x = nativeEvent.clientX;
    event.client.y = nativeEvent.clientY;
    event.movement.x = nativeEvent.movementX;
    event.movement.y = nativeEvent.movementY;
    event.page.x = nativeEvent.pageX;
    event.page.y = nativeEvent.pageY;
    event.screen.x = nativeEvent.screenX;
    event.screen.y = nativeEvent.screenY;
    event.relatedTarget = null;
  }

  private setCursor(cursor: Cursor | null) {
    this.context.contextService.applyCursorStyle(
      cursor || this.context.config.cursor || 'default',
    );
  }

  private normalizeToPointerEvent(
    event: InteractivePointerEvent,
    canvas: ICanvas,
  ): PointerEvent[] {
    const normalizedEvents = [];
    if (canvas.isTouchEvent(event)) {
      for (let i = 0; i < event.changedTouches.length; i++) {
        const touch = event.changedTouches[i] as FormattedTouch;

        // use changedTouches instead of touches since touchend has no touches
        // @see https://stackoverflow.com/a/10079076
        if (isUndefined(touch.button)) touch.button = 0;
        if (isUndefined(touch.buttons)) touch.buttons = 1;
        if (isUndefined(touch.isPrimary)) {
          touch.isPrimary =
            event.touches.length === 1 && event.type === 'touchstart';
        }
        if (isUndefined(touch.width)) touch.width = touch.radiusX || 1;
        if (isUndefined(touch.height)) touch.height = touch.radiusY || 1;
        if (isUndefined(touch.tiltX)) touch.tiltX = 0;
        if (isUndefined(touch.tiltY)) touch.tiltY = 0;
        if (isUndefined(touch.pointerType)) touch.pointerType = 'touch';
        // @see https://developer.mozilla.org/zh-CN/docs/Web/API/Touch/identifier
        if (isUndefined(touch.pointerId))
          touch.pointerId = touch.identifier || 0;
        if (isUndefined(touch.pressure)) touch.pressure = touch.force || 0.5;
        if (isUndefined(touch.twist)) touch.twist = 0;
        if (isUndefined(touch.tangentialPressure)) touch.tangentialPressure = 0;
        touch.isNormalized = true;
        touch.type = event.type;

        normalizedEvents.push(touch);
      }
    } else if (canvas.isMouseEvent(event)) {
      const tempEvent = event as FormattedPointerEvent;
      if (isUndefined(tempEvent.isPrimary)) tempEvent.isPrimary = true;
      if (isUndefined(tempEvent.width)) tempEvent.width = 1;
      if (isUndefined(tempEvent.height)) tempEvent.height = 1;
      if (isUndefined(tempEvent.tiltX)) tempEvent.tiltX = 0;
      if (isUndefined(tempEvent.tiltY)) tempEvent.tiltY = 0;
      if (isUndefined(tempEvent.pointerType)) tempEvent.pointerType = 'mouse';
      if (isUndefined(tempEvent.pointerId))
        tempEvent.pointerId = MOUSE_POINTER_ID;
      if (isUndefined(tempEvent.pressure)) tempEvent.pressure = 0.5;
      if (isUndefined(tempEvent.twist)) tempEvent.twist = 0;
      if (isUndefined(tempEvent.tangentialPressure))
        tempEvent.tangentialPressure = 0;
      tempEvent.isNormalized = true;

      normalizedEvents.push(tempEvent);
    } else {
      normalizedEvents.push(event);
    }

    return normalizedEvents as PointerEvent[];
  }
}
