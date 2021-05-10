import { Entity } from '@antv/g-ecs';
import { inject, injectable } from 'inversify';
import { DisplayObject } from '../../DisplayObject';
import { InteractionEvent } from '../../InteractionEvent';
import { ContextService, RenderingPlugin, RenderingService, RenderingContext } from '../../services';
import { CanvasConfig } from '../../types';
import {
  InteractionCallback,
  InteractivePointerEvent,
  isMouseEvent,
  isTouchEvent,
  normalizeToPointerEvent,
  supportsPointerEvents,
  supportsTouchEvents,
} from '../../utils/event';

/**
 * support mouse & touch events
 * @see https://github.com/pixijs/pixi.js/blob/dev/packages/interaction/README.md
 *
 * also provide some extra events such as `drag`
 */
@injectable()
export class InteractionPlugin implements RenderingPlugin {
  static tag = 'InteractionPlugin';

  @inject(CanvasConfig)
  private canvasConfig: CanvasConfig;

  @inject(ContextService)
  private contextService: ContextService<unknown>;

  @inject(RenderingService)
  private renderingService: RenderingService;

  @inject(RenderingContext)
  private renderingContext: RenderingContext;

  private didMove: boolean = false;

  apply(renderingService: RenderingService) {
    renderingService.hooks.init.tap(InteractionPlugin.tag, () => {
      const $el = this.contextService.getDomElement();

      if (supportsPointerEvents) {
        self.document.addEventListener('pointermove', this.onPointerMove, true);
        $el.addEventListener('pointerdown', this.onPointerDown, true);
        // pointerout is fired in addition to pointerup (for touch events) and pointercancel
        // we already handle those, so for the purposes of what we do in onPointerOut, we only
        // care about the pointerleave event
        $el.addEventListener('pointerleave', this.onPointerOut, true);
        $el.addEventListener('pointerover', this.onPointerOver, true);
        self.addEventListener('pointercancel', this.onPointerCancel, true);
        self.addEventListener('pointerup', this.onPointerUp, true);
      } else {
        self.document.addEventListener('mousemove', this.onPointerMove, true);
        $el.addEventListener('mousedown', this.onPointerDown, true);
        $el.addEventListener('mouseout', this.onPointerOut, true);
        $el.addEventListener('mouseover', this.onPointerOver, true);
        self.addEventListener('mouseup', this.onPointerUp, true);
      }

      // always look directly for touch events so that we can provide original data
      // In a future version we should change this to being just a fallback and rely solely on
      // PointerEvents whenever available
      if (supportsTouchEvents) {
        $el.addEventListener('touchstart', this.onPointerDown, true);
        $el.addEventListener('touchcancel', this.onPointerCancel, true);
        $el.addEventListener('touchend', this.onPointerUp, true);
        $el.addEventListener('touchmove', this.onPointerMove, true);
      }
    });

    renderingService.hooks.destroy.tap(InteractionPlugin.tag, async () => {
      const $el = this.contextService.getDomElement();
      if (supportsPointerEvents) {
        self.document.removeEventListener('pointermove', this.onPointerMove, true);
        $el.removeEventListener('pointerdown', this.onPointerDown, true);
        $el.removeEventListener('pointerleave', this.onPointerOut, true);
        $el.removeEventListener('pointerover', this.onPointerOver, true);
        self.removeEventListener('pointercancel', this.onPointerCancel, true);
        self.removeEventListener('pointerup', this.onPointerUp, true);
      } else {
        self.document.removeEventListener('mousemove', this.onPointerMove, true);
        $el.removeEventListener('mousedown', this.onPointerDown, true);
        $el.removeEventListener('mouseout', this.onPointerOut, true);
        $el.removeEventListener('mouseover', this.onPointerOver, true);
        self.removeEventListener('mouseup', this.onPointerUp, true);
      }

      if (supportsTouchEvents) {
        $el.removeEventListener('touchstart', this.onPointerDown, true);
        $el.removeEventListener('touchcancel', this.onPointerCancel, true);
        $el.removeEventListener('touchend', this.onPointerUp, true);
        $el.removeEventListener('touchmove', this.onPointerMove, true);
      }
    });
  }

  private onPointerMove = (originalEvent: InteractivePointerEvent) => {
    if (supportsTouchEvents && (originalEvent as PointerEvent).pointerType === 'touch') {
      return;
    }

    const events = normalizeToPointerEvent(originalEvent);

    if (events[0].pointerType === 'mouse' || events[0].pointerType === 'pen') {
      this.didMove = true;
      // this.cursor = null;
    }

    for (const event of events) {
      const interactionEvent = new InteractionEvent(event, originalEvent);

      this.processInteractive(
        interactionEvent,
        (event, displayObject, hit) => {
          const isTouch = InteractionEvent.isTouch(event);
          const isMouse = InteractionEvent.isMouse(event);

          if (isMouse) {
            // TODO:
            // this.processPointerOverOut(interactionEvent, displayObject, hit);
          }

          if (hit) {
            this.dispatchEvent('pointermove', displayObject, event);
            if (isTouch) {
              this.dispatchEvent('touchmove', displayObject, event);
            }
            if (isMouse) {
              this.dispatchEvent('mousemove', displayObject, event);
            }
          }
        },
        true
      );
    }
  };

  private onPointerDown = (originalEvent: InteractivePointerEvent) => {
    if (supportsTouchEvents && (originalEvent as PointerEvent).pointerType === 'touch') {
      return;
    }

    const events = normalizeToPointerEvent(originalEvent);

    for (const event of events) {
      const interactionEvent = new InteractionEvent(event, originalEvent);

      this.processInteractive(
        interactionEvent,
        (event, displayObject) => {
          this.dispatchEvent('pointerdown', displayObject, interactionEvent);
          if (event.formattedEvent.pointerType === 'touch') {
            this.dispatchEvent('touchstart', displayObject, interactionEvent);
          }
          // emit a mouse event for "pen" pointers, the way a browser would emit a fallback event
          else if (event.formattedEvent.pointerType === 'mouse' || event.formattedEvent.pointerType === 'pen') {
            const isRightButton = event.formattedEvent.button === 2;
            this.dispatchEvent(isRightButton ? 'rightdown' : 'mousedown', displayObject, interactionEvent);
          }
        },
        true
      );
    }
  };

  private onPointerUp = (originalEvent: InteractivePointerEvent) => {
    // if we support touch events, then only use those for touch events, not pointer events
    if (supportsTouchEvents && (originalEvent as PointerEvent).pointerType === 'touch') {
      return;
    }

    this.onPointerComplete(originalEvent, false, (event, displayObject, hit) => {
      const isTouch = InteractionEvent.isTouch(event);
      const isMouse = InteractionEvent.isMouse(event);

      if (isMouse) {
        const isRightButton = event.formattedEvent.button === 2;

        if (hit) {
          this.dispatchEvent(isRightButton ? 'rightup' : 'mouseup', displayObject, event);
          this.dispatchEvent(isRightButton ? 'rightclick' : 'click', displayObject, event);
        } else {
          this.dispatchEvent(isRightButton ? 'rightupoutside' : 'mouseupoutside', displayObject, event);
        }
      }

      if (hit) {
        this.dispatchEvent('pointerup', displayObject, event);
        if (isTouch) {
          this.dispatchEvent('touchend', displayObject, event);
        }
      }
    });
  };

  private onPointerComplete = (
    originalEvent: InteractivePointerEvent,
    cancelled: boolean,
    callback: InteractionCallback
  ) => {
    const events = normalizeToPointerEvent(originalEvent);
    const $el = this.contextService.getDomElement();

    // if the event wasn't targeting our canvas, then consider it to be pointerupoutside
    // in all cases (unless it was a pointercancel)
    const eventAppend = originalEvent.target !== $el ? 'outside' : '';

    for (const event of events) {
      const interactionEvent = new InteractionEvent(event, originalEvent);

      // perform hit testing for events targeting our canvas or cancel events
      this.processInteractive(interactionEvent, callback, cancelled || !eventAppend);
    }
  };

  private onPointerCancel = (originalEvent: InteractivePointerEvent) => {
    if (supportsTouchEvents && (originalEvent as PointerEvent).pointerType === 'touch') {
      return;
    }

    this.onPointerComplete(originalEvent, true, (event, displayObject) => {
      this.dispatchEvent('pointercancel', displayObject, event);
      if (event.formattedEvent.pointerType === 'touch') {
        this.dispatchEvent('touchcancel', displayObject, event);
      }
    });
  };

  private onPointerOver = () => {};

  private onPointerOut = (originalEvent: InteractivePointerEvent) => {
    if (supportsTouchEvents && (originalEvent as PointerEvent).pointerType === 'touch') {
      return;
    }

    const events = normalizeToPointerEvent(originalEvent);
    for (const event of events) {
      const interactionEvent = new InteractionEvent(event, originalEvent);
      const isMouse = InteractionEvent.isMouse(interactionEvent);

      // don't need to do hit testing
      this.processInteractive(
        interactionEvent,
        (event, displayObject) => {
          this.dispatchEvent('pointerout', displayObject, event);
          if (isMouse) {
            this.dispatchEvent('mouseout', displayObject, event);
          }
        },
        false
      );
    }
  };

  private dispatchEvent(eventName: string, picked: DisplayObject, event: InteractionEvent) {
    picked.emit(eventName, event);
  }

  private getEventPosition(event: PointerEvent) {
    const { clientX, clientY } = event;
    const bbox = this.contextService.getBoundingClientRect();

    return {
      clientX,
      clientY,
      x: clientX - (bbox?.left || 0),
      y: clientY - (bbox?.top || 0),
    };
  }

  private processInteractive(interactionEvent: InteractionEvent, callback: InteractionCallback, hitTest?: boolean) {
    const position = this.getEventPosition(interactionEvent.formattedEvent);
    interactionEvent.x = position.x;
    interactionEvent.y = position.y;

    // outside canvas
    if (
      position.x > this.canvasConfig.width ||
      position.x < 0 ||
      position.y > this.canvasConfig.height ||
      position.y < 0
    ) {
      return;
    }

    const { picked } = this.renderingService.hooks.pick.call({
      position,
      picked: null,
    });

    const lastPicked = this.renderingContext.lastPickedDisplayObject;
    if (picked !== lastPicked) {
      if (lastPicked) {
        lastPicked.emit('mouseleave');
        this.renderingContext.lastPickedDisplayObject = undefined;

        // restore default cursor style
        this.contextService.applyCursorStyle('default');
      }

      if (picked) {
        picked.emit('mouseenter');
        this.renderingContext.lastPickedDisplayObject = picked;

        // apply cursor style
        this.contextService.applyCursorStyle(picked.getAttribute('cursor') || this.canvasConfig.cursor || 'default');
      }
    }

    if (picked) {
      let tmp: DisplayObject | null = picked;
      while (tmp) {
        callback(interactionEvent, tmp, hitTest);
        tmp = tmp.parentNode;
      }
    }
  }
}
