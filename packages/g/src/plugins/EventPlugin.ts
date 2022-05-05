import { inject, singleton } from 'mana-syringe';
import { isUndefined } from 'lodash-es';
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
import { MOUSE_POINTER_ID } from '../utils/event';
import type { FormattedTouch, FormattedPointerEvent } from '../utils/event';
import { FederatedTouchEvent } from '../dom/FederatedTouchEvent';

/**
 * support mouse & touch events
 * @see https://github.com/pixijs/pixi.js/blob/dev/packages/interaction/README.md
 *
 * also provide some extra events such as `drag`
 */
@singleton({ contrib: RenderingPluginContribution })
export class EventPlugin implements RenderingPlugin {
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
    const canvas = this.renderingContext.root.ownerDocument.defaultView;

    this.eventService.setPickHandler(async (position: EventPosition) => {
      const { picked } = await this.renderingService.hooks.pick.callPromise({
        position,
        picked: [],
        topmost: true, // we only concern the topmost element
      });
      return picked[0] || null;
    });

    renderingService.hooks.pointerWheel.tap((nativeEvent: InteractivePointerEvent) => {
      const wheelEvent = this.normalizeWheelEvent(nativeEvent as WheelEvent);

      this.eventService.mapEvent(wheelEvent);
    });

    renderingService.hooks.pointerDown.tap((nativeEvent: InteractivePointerEvent) => {
      if (canvas.supportTouchEvent && (nativeEvent as PointerEvent).pointerType === 'touch') {
        return;
      }

      const normalizedEvent = this.normalizeToPointerEvent(nativeEvent, canvas);

      if (this.autoPreventDefault && (normalizedEvent as any).isNormalized) {
        const cancelable = nativeEvent.cancelable || !('cancelable' in nativeEvent);

        if (cancelable) {
          nativeEvent.preventDefault();
        }
      }

      const federatedEvent = this.bootstrapEvent(this.rootPointerEvent, normalizedEvent, canvas);
      this.eventService.mapEvent(federatedEvent);

      this.setCursor(this.eventService.cursor);
    });

    renderingService.hooks.pointerUp.tap((nativeEvent: InteractivePointerEvent) => {
      if (canvas.supportTouchEvent && (nativeEvent as PointerEvent).pointerType === 'touch') return;

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
      const normalizedEvent = this.normalizeToPointerEvent(nativeEvent, canvas);
      const event = this.bootstrapEvent(this.rootPointerEvent, normalizedEvent, canvas);
      event.type += outside;
      this.eventService.mapEvent(event);

      this.setCursor(this.eventService.cursor);
    });

    renderingService.hooks.pointerMove.tap(this.onPointerMove);

    renderingService.hooks.pointerOver.tap(this.onPointerMove);

    renderingService.hooks.pointerOut.tap(this.onPointerMove);
    renderingService.hooks.pointerCancel.tap((nativeEvent: InteractivePointerEvent) => {
      if (canvas.supportTouchEvent && (nativeEvent as PointerEvent).pointerType === 'touch') {
        return;
      }

      const normalizedEvent = this.normalizeToPointerEvent(nativeEvent, canvas);

      if (this.autoPreventDefault && (normalizedEvent as any).isNormalized) {
        const cancelable = nativeEvent.cancelable || !('cancelable' in nativeEvent);

        if (cancelable) {
          nativeEvent.preventDefault();
        }
      }

      const federatedEvent = this.bootstrapEvent(this.rootPointerEvent, normalizedEvent, canvas);
      this.eventService.mapEvent(federatedEvent);

      this.setCursor(this.eventService.cursor);
    });
  }

  private onPointerMove = (nativeEvent: InteractivePointerEvent) => {
    const canvas = this.renderingContext.root?.ownerDocument?.defaultView;
    if (canvas.supportTouchEvent && (nativeEvent as PointerEvent).pointerType === 'touch') return;

    const normalizedEvent = this.normalizeToPointerEvent(nativeEvent, canvas);

    const event = this.bootstrapEvent(this.rootPointerEvent, normalizedEvent, canvas);

    this.eventService.mapEvent(event);

    this.setCursor(this.eventService.cursor);
  };

  private formatTouch(touch: Touch): FormattedTouch {
    const formattedTouch: FormattedTouch = {
      nativeTouch: touch,
      clientX: touch.clientX,
      clientY: touch.clientY,
      screenX: touch.screenX,
      screenY: touch.screenY,
      viewportX: 0,
      viewportY: 0,
      canvasX: 0,
      canvasY: 0,
      x: 0,
      y: 0,
      target: undefined,
      force: touch.force,
      identifier: touch.identifier,
      pageX: touch.pageX,
      pageY: touch.pageY,
      radiusX: touch.radiusX,
      radiusY: touch.radiusY,
      rotationAngle: touch.rotationAngle,
    };

    const { x, y } = this.eventService.client2Viewport(new Point(touch.clientX, touch.clientY));
    formattedTouch.viewportX = x;
    formattedTouch.viewportY = y;
    const { x: canvasX, y: canvasY } = this.eventService.viewport2Canvas({ x, y });
    formattedTouch.canvasX = canvasX;
    formattedTouch.canvasY = canvasY;
    formattedTouch.x = canvasX;
    formattedTouch.y = canvasY;

    return formattedTouch;
  }

  private bootstrapEvent(
    e: FederatedPointerEvent | FederatedTouchEvent,
    nativeEvent: PointerEvent,
    view: ICanvas,
  ): FederatedPointerEvent | FederatedTouchEvent {
    e.pointerType = nativeEvent.pointerType;

    if (e.pointerType !== 'touch') {
      const event = e as FederatedPointerEvent;
      event.view = view;
      event.originalEvent = null;
      event.nativeEvent = nativeEvent;

      event.pointerId = nativeEvent.pointerId;
      event.width = nativeEvent.width;
      event.height = nativeEvent.height;
      event.isPrimary = nativeEvent.isPrimary;
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
      // if (event.type.startsWith('touch')) {
      //   event.type = TOUCH_TO_POINTER[event.type] || event.type;
      // }
    } else {
      const event = e as FederatedTouchEvent;

      // handle TouchEvent
      const ne = nativeEvent as unknown as TouchEvent;
      const changedTouches = [];
      const touches = [];
      for (let i = 0; i < ne.changedTouches.length; i++) {
        changedTouches.push(this.formatTouch(ne.changedTouches[i]));
      }

      for (let i = 0; i < ne.touches.length; i++) {
        touches.push(this.formatTouch(ne.touches[i]));
      }

      event.nativeEvent = nativeEvent;
      event.isTrusted = nativeEvent.isTrusted;
      event.timeStamp = performance.now();
      event.type = nativeEvent.type;

      // @see https://w3c.github.io/touch-events/#touchevent-interface
      event.altKey = nativeEvent.altKey;
      event.metaKey = nativeEvent.metaKey;
      event.shiftKey = nativeEvent.shiftKey;
      event.ctrlKey = nativeEvent.ctrlKey;

      // copy raw touches
      event.changedTouches = changedTouches;
      event.touches = touches;
      event.targetTouches = [];
    }

    return e;
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
    this.contextService.applyCursorStyle(cursor || this.canvasConfig.cursor || 'default');
  }

  private normalizeToPointerEvent(event: InteractivePointerEvent, canvas: ICanvas): PointerEvent {
    if (canvas.isTouchEvent(event)) {
      // @ts-ignore
      event.isNormalized = true;
      // @ts-ignore
      event.pointerType = 'touch';
      return event as unknown as PointerEvent;
    } else if (canvas.isMouseEvent(event)) {
      const tempEvent = event as FormattedPointerEvent;
      if (isUndefined(tempEvent.isPrimary)) tempEvent.isPrimary = true;
      if (isUndefined(tempEvent.width)) tempEvent.width = 1;
      if (isUndefined(tempEvent.height)) tempEvent.height = 1;
      if (isUndefined(tempEvent.tiltX)) tempEvent.tiltX = 0;
      if (isUndefined(tempEvent.tiltY)) tempEvent.tiltY = 0;
      if (isUndefined(tempEvent.pointerType)) tempEvent.pointerType = 'mouse';
      if (isUndefined(tempEvent.pointerId)) tempEvent.pointerId = MOUSE_POINTER_ID;
      if (isUndefined(tempEvent.pressure)) tempEvent.pressure = 0.5;
      if (isUndefined(tempEvent.twist)) tempEvent.twist = 0;
      if (isUndefined(tempEvent.tangentialPressure)) tempEvent.tangentialPressure = 0;
      tempEvent.isNormalized = true;

      return tempEvent;
    } else {
      return event;
    }
  }
}
