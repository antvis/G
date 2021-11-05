import {
  InteractivePointerEvent,
  ContextService,
  RenderingPlugin,
  RenderingService,
} from '@antv/g';
import { inject, injectable } from 'inversify';
import { supportsPointerEvents, supportsTouchEvents } from './utils';

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
      renderingService.hooks.pointerMove.call(ev);
    };

    const onPointerUp = (ev: InteractivePointerEvent) => {
      renderingService.hooks.pointerUp.call(ev);
    };

    const onPointerDown = (ev: InteractivePointerEvent) => {
      renderingService.hooks.pointerDown.call(ev);
    };

    const onPointerOver = (ev: InteractivePointerEvent) => {
      renderingService.hooks.pointerOver.call(ev);
    };

    const onPointerOut = (ev: InteractivePointerEvent) => {
      renderingService.hooks.pointerOut.call(ev);
    };

    const onPointerWheel = (ev: InteractivePointerEvent) => {
      renderingService.hooks.pointerWheel.call(ev);
    };

    renderingService.hooks.init.tap(DOMInteractionPlugin.tag, () => {
      const $el = this.contextService.getDomElement()!;

      if (supportsPointerEvents) {
        self.document.addEventListener('pointermove', onPointerMove, true);
        $el.addEventListener('pointerdown', onPointerDown, true);
        $el.addEventListener('pointerleave', onPointerOut, true);
        $el.addEventListener('pointerover', onPointerOver, true);
        self.addEventListener('pointerup', onPointerUp, true);
      } else {
        self.document.addEventListener('mousemove', onPointerMove, true);
        $el.addEventListener('mousedown', onPointerDown, true);
        $el.addEventListener('mouseout', onPointerOut, true);
        $el.addEventListener('mouseover', onPointerOver, true);
        self.addEventListener('mouseup', onPointerUp, true);
      }

      // always look directly for touch events so that we can provide original data
      // In a future version we should change this to being just a fallback and rely solely on
      // PointerEvents whenever available
      if (supportsTouchEvents) {
        $el.addEventListener('touchstart', onPointerDown, true);
        $el.addEventListener('touchend', onPointerUp, true);
        $el.addEventListener('touchmove', onPointerMove, true);
      }

      // use passive event listeners
      // @see https://zhuanlan.zhihu.com/p/24555031
      $el.addEventListener('wheel', onPointerWheel, {
        passive: true,
        capture: true,
      });
    });

    renderingService.hooks.destroy.tap(DOMInteractionPlugin.tag, () => {
      const $el = this.contextService.getDomElement()!;
      if (supportsPointerEvents) {
        self.document.removeEventListener('pointermove', onPointerMove, true);
        $el.removeEventListener('pointerdown', onPointerDown, true);
        $el.removeEventListener('pointerleave', onPointerOut, true);
        $el.removeEventListener('pointerover', onPointerOver, true);
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
        $el.removeEventListener('touchend', onPointerUp, true);
        $el.removeEventListener('touchmove', onPointerMove, true);
      }

      $el.removeEventListener('wheel', onPointerWheel, true);
    });
  }
}
