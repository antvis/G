import { InteractivePointerEvent, ContextService, RenderingPlugin, RenderingService } from '@antv/g';
import { inject, injectable } from 'inversify';
import { supportsPointerEvents, supportsTouchEvents, normalizeToPointerEvent } from './utils';

/**
 * listen to mouse/touch/pointer events on DOM wrapper, trigger pointer events
 */
@injectable()
export class DOMInteractionPlugin implements RenderingPlugin {
  static tag = 'DOMInteractionPlugin';

  @inject(ContextService)
  private contextService: ContextService<unknown>;

  apply(renderingService: RenderingService) {
    const onPointerMove = (ev: InteractivePointerEvent) => {
      renderingService.hooks.pointerMove.call(normalizeToPointerEvent(ev), ev);
    };

    const onPointerUp = (ev: InteractivePointerEvent) => {
      renderingService.hooks.pointerUp.call(normalizeToPointerEvent(ev), ev);
    };

    const onPointerDown = (ev: InteractivePointerEvent) => {
      renderingService.hooks.pointerDown.call(normalizeToPointerEvent(ev), ev);
    };

    const onPointerCancel = (ev: InteractivePointerEvent) => {
      renderingService.hooks.pointerCancel.call(normalizeToPointerEvent(ev), ev);
    };

    const onPointerOver = (ev: InteractivePointerEvent) => {
      renderingService.hooks.pointerOver.call(normalizeToPointerEvent(ev), ev);
    };

    const onPointerOut = (ev: InteractivePointerEvent) => {
      renderingService.hooks.pointerOut.call(normalizeToPointerEvent(ev), ev);
    };

    const onPointerWheel = (ev: InteractivePointerEvent) => {
      renderingService.hooks.pointerWheel.call(normalizeToPointerEvent(ev), ev);
    };

    renderingService.hooks.init.tap(DOMInteractionPlugin.tag, () => {
      const $el = this.contextService.getDomElement()!;

      if (supportsPointerEvents) {
        self.document.addEventListener('pointermove', onPointerMove, true);
        $el.addEventListener('pointerdown', onPointerDown, true);
        // pointerout is fired in addition to pointerup (for touch events) and pointercancel
        // we already handle those, so for the purposes of what we do in onPointerOut, we only
        // care about the pointerleave event
        $el.addEventListener('pointerleave', onPointerOut, true);
        $el.addEventListener('pointerover', onPointerOver, true);
        self.addEventListener('pointercancel', onPointerCancel, true);
        self.addEventListener('pointerup', onPointerUp, true);
        $el.addEventListener('wheel', onPointerWheel, true);
      } else {
        self.document.addEventListener('mousemove', onPointerMove, true);
        $el.addEventListener('mousedown', onPointerDown, true);
        $el.addEventListener('mouseout', onPointerOut, true);
        $el.addEventListener('mouseover', onPointerOver, true);
        self.addEventListener('mouseup', onPointerUp, true);
        $el.addEventListener('wheel', onPointerWheel, true);
      }

      // always look directly for touch events so that we can provide original data
      // In a future version we should change this to being just a fallback and rely solely on
      // PointerEvents whenever available
      if (supportsTouchEvents) {
        $el.addEventListener('touchstart', onPointerDown, true);
        $el.addEventListener('touchcancel', onPointerCancel, true);
        $el.addEventListener('touchend', onPointerUp, true);
        $el.addEventListener('touchmove', onPointerMove, true);
      }
    });

    renderingService.hooks.destroy.tap(DOMInteractionPlugin.tag, async () => {
      const $el = this.contextService.getDomElement()!;
      if (supportsPointerEvents) {
        self.document.removeEventListener('pointermove', onPointerMove, true);
        $el.removeEventListener('pointerdown', onPointerDown, true);
        $el.removeEventListener('pointerleave', onPointerOut, true);
        $el.removeEventListener('pointerover', onPointerOver, true);
        self.removeEventListener('pointercancel', onPointerCancel, true);
        self.removeEventListener('pointerup', onPointerUp, true);
      } else {
        self.document.removeEventListener('mousemove', onPointerMove, true);
        $el.removeEventListener('mousedown', onPointerDown, true);
        $el.removeEventListener('mouseout', onPointerOut, true);
        $el.removeEventListener('mouseover', onPointerOver, true);
        self.removeEventListener('mouseup', onPointerUp, true);
      }

      if (supportsTouchEvents) {
        $el.removeEventListener('touchstart', onPointerDown, true);
        $el.removeEventListener('touchcancel', onPointerCancel, true);
        $el.removeEventListener('touchend', onPointerUp, true);
        $el.removeEventListener('touchmove', onPointerMove, true);
      }
    });
  }
}
