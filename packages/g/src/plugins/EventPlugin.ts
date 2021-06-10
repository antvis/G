import { inject, injectable } from 'inversify';
import { DisplayObject } from '../DisplayObject';
import {
  InteractionCallback,
  InteractionEvent,
  InteractivePointerEvent,
} from '../InteractionEvent';
import { ContextService, RenderingPlugin, RenderingService, RenderingContext } from '../services';
import { CanvasConfig } from '../types';

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

  @inject(RenderingContext)
  private renderingContext: RenderingContext;

  private didMove: boolean = false;

  apply(renderingService: RenderingService) {
    renderingService.hooks.pointerWheel.tap(
      EventPlugin.tag,
      (event: PointerEvent, originalEvent: InteractivePointerEvent) => {
        const interactionEvent = new InteractionEvent(event, originalEvent);

        this.processInteractive(
          interactionEvent,
          (event, displayObject) => {
            this.dispatchEvent('mousewheel', displayObject, event);
          },
          false,
        );
      },
    );

    renderingService.hooks.pointerMove.tap(
      EventPlugin.tag,
      (event: PointerEvent, originalEvent: InteractivePointerEvent) => {
        if (event.pointerType === 'mouse' || event.pointerType === 'pen') {
          // this.didMove = true;
          // this.cursor = null;
        }

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
          true,
        );
      },
    );

    renderingService.hooks.pointerDown.tap(
      EventPlugin.tag,
      (event: PointerEvent, originalEvent: InteractivePointerEvent) => {
        // if (supportsTouchEvents && (originalEvent as PointerEvent).pointerType === 'touch') {
        //   return;
        // }

        const interactionEvent = new InteractionEvent(event, originalEvent);

        this.processInteractive(
          interactionEvent,
          (event, displayObject) => {
            this.dispatchEvent('pointerdown', displayObject, interactionEvent);
            if (event.formattedEvent.pointerType === 'touch') {
              this.dispatchEvent('touchstart', displayObject, interactionEvent);
            }
            // emit a mouse event for "pen" pointers, the way a browser would emit a fallback event
            else if (
              event.formattedEvent.pointerType === 'mouse' ||
              event.formattedEvent.pointerType === 'pen'
            ) {
              const isRightButton = event.formattedEvent.button === 2;
              this.dispatchEvent(
                isRightButton ? 'rightdown' : 'mousedown',
                displayObject,
                interactionEvent,
              );
            }
          },
          true,
        );
      },
    );

    renderingService.hooks.pointerUp.tap(
      EventPlugin.tag,
      (event: PointerEvent, originalEvent: InteractivePointerEvent) => {
        // if (supportsTouchEvents && (originalEvent as PointerEvent).pointerType === 'touch') {
        //   return;
        // }

        this.onPointerComplete(event, originalEvent, false, (event, displayObject, hit) => {
          const isTouch = InteractionEvent.isTouch(event);
          const isMouse = InteractionEvent.isMouse(event);

          if (isMouse) {
            const isRightButton = event.formattedEvent.button === 2;

            if (hit) {
              this.dispatchEvent(isRightButton ? 'rightup' : 'mouseup', displayObject, event);
              this.dispatchEvent(isRightButton ? 'rightclick' : 'click', displayObject, event);
            } else {
              this.dispatchEvent(
                isRightButton ? 'rightupoutside' : 'mouseupoutside',
                displayObject,
                event,
              );
            }
          }

          if (hit) {
            this.dispatchEvent('pointerup', displayObject, event);
            if (isTouch) {
              this.dispatchEvent('touchend', displayObject, event);
            }
          }
        });
      },
    );

    renderingService.hooks.pointerCancel.tap(
      EventPlugin.tag,
      (event: PointerEvent, originalEvent: InteractivePointerEvent) => {
        // if (supportsTouchEvents && (originalEvent as PointerEvent).pointerType === 'touch') {
        //   return;
        // }

        this.onPointerComplete(event, originalEvent, true, (event, displayObject) => {
          this.dispatchEvent('pointercancel', displayObject, event);
          if (event.formattedEvent.pointerType === 'touch') {
            this.dispatchEvent('touchcancel', displayObject, event);
          }
        });
      },
    );

    renderingService.hooks.pointerOver.tap(
      EventPlugin.tag,
      (event: PointerEvent, originalEvent: InteractivePointerEvent) => {},
    );

    renderingService.hooks.pointerOut.tap(
      EventPlugin.tag,
      (event: PointerEvent, originalEvent: InteractivePointerEvent) => {
        // if (supportsTouchEvents && (originalEvent as PointerEvent).pointerType === 'touch') {
        //   return;
        // }

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
          false,
        );
      },
    );
  }

  private onPointerComplete = (
    event: PointerEvent,
    originalEvent: InteractivePointerEvent,
    cancelled: boolean,
    callback: InteractionCallback,
  ) => {
    const $el = this.contextService.getDomElement();

    // if the event wasn't targeting our canvas, then consider it to be pointerupoutside
    // in all cases (unless it was a pointercancel)
    const eventAppend = originalEvent.target !== $el ? 'outside' : '';

    const interactionEvent = new InteractionEvent(event, originalEvent);

    // perform hit testing for events targeting our canvas or cancel events
    this.processInteractive(interactionEvent, callback, cancelled || !eventAppend);
  };

  private dispatchEvent(eventName: string, target: DisplayObject, event: InteractionEvent) {
    let tmp: DisplayObject | null = target;
    while (tmp && !event.propagationStopped) {
      tmp.emit(eventName, event);
      tmp = tmp.parentNode;
    }
  }

  private getEventPosition(event: PointerEvent) {
    const { clientX, clientY } = event;
    const bbox = this.contextService.getBoundingClientRect();

    return {
      clientX,
      clientY,
      x: clientX - ((bbox && bbox.left) || 0),
      y: clientY - ((bbox && bbox.top) || 0),
    };
  }

  private processInteractive(
    interactionEvent: InteractionEvent,
    callback: InteractionCallback,
    hitTest?: boolean,
  ) {
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
        this.dispatchEvent('mouseleave', lastPicked, interactionEvent);
        this.renderingContext.lastPickedDisplayObject = undefined;
      }

      if (picked) {
        const cursor = this.getCursor(picked) || this.canvasConfig.cursor || 'default';
        this.dispatchEvent('mouseenter', picked, interactionEvent);
        this.renderingContext.lastPickedDisplayObject = picked;

        // apply cursor style
        this.contextService.applyCursorStyle(cursor);
      }
    }

    if (picked) {
      callback(interactionEvent, picked, hitTest);
    } else {
      // trigger on root
      callback(interactionEvent, this.renderingContext.root, hitTest);
      // restore default cursor style
      this.contextService.applyCursorStyle(this.canvasConfig.cursor || 'default');
    }
  }

  private getCursor(target: DisplayObject) {
    let tmp: DisplayObject | null = target;
    while (tmp) {
      const cursor = tmp.getAttribute('cursor');
      if (cursor) {
        return cursor;
      }
      tmp = tmp.parentNode;
    }
  }
}
