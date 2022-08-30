import type { InteractivePointerEvent, RenderingPlugin, RenderingService } from '@antv/g-lite';
import { ContextService, inject, RenderingContext, singleton } from '@antv/g-lite';

// const MOBILE_REGEX = /mobile|tablet|ip(ad|hone|od)|android/i;

/**
 * listen to mouse/touch/pointer events on DOM wrapper, trigger pointer events
 */
@singleton()
export class DOMInteractionPlugin implements RenderingPlugin {
  static tag = 'DOMInteraction';

  constructor(
    @inject(ContextService)
    private contextService: ContextService<unknown>,

    @inject(RenderingContext)
    private renderingContext: RenderingContext,
  ) {}

  apply(renderingService: RenderingService) {
    const canvas = this.renderingContext.root.ownerDocument.defaultView;
    // const SUPPORT_ONLY_TOUCH = canvas.supportsTouchEvents && MOBILE_REGEX.test(navigator.userAgent);

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

    const onPointerCancel = (ev: InteractivePointerEvent) => {
      renderingService.hooks.pointerCancel.call(ev);
    };

    const onPointerWheel = (ev: InteractivePointerEvent) => {
      renderingService.hooks.pointerWheel.call(ev);
    };

    const addPointerEventListener = ($el: HTMLElement) => {
      globalThis.document.addEventListener('pointermove', onPointerMove, true);
      $el.addEventListener('pointerdown', onPointerDown, true);
      $el.addEventListener('pointerleave', onPointerOut, true);
      $el.addEventListener('pointerover', onPointerOver, true);
      globalThis.addEventListener('pointerup', onPointerUp, true);
    };

    const addTouchEventListener = ($el: HTMLElement) => {
      $el.addEventListener('touchstart', onPointerDown, true);
      $el.addEventListener('touchend', onPointerUp, true);
      $el.addEventListener('touchmove', onPointerMove, true);
      $el.addEventListener('touchcancel', onPointerCancel, true);
    };

    const addMouseEventListener = ($el: HTMLElement) => {
      globalThis.document.addEventListener('mousemove', onPointerMove, true);
      $el.addEventListener('mousedown', onPointerDown, true);
      $el.addEventListener('mouseout', onPointerOut, true);
      $el.addEventListener('mouseover', onPointerOver, true);
      globalThis.addEventListener('mouseup', onPointerUp, true);
    };

    const removePointerEventListener = ($el: HTMLElement) => {
      globalThis.document.removeEventListener('pointermove', onPointerMove, true);
      $el.removeEventListener('pointerdown', onPointerDown, true);
      $el.removeEventListener('pointerleave', onPointerOut, true);
      $el.removeEventListener('pointerover', onPointerOver, true);
      globalThis.removeEventListener('pointerup', onPointerUp, true);
    };

    const removeTouchEventListener = ($el: HTMLElement) => {
      $el.removeEventListener('touchstart', onPointerDown, true);
      $el.removeEventListener('touchend', onPointerUp, true);
      $el.removeEventListener('touchmove', onPointerMove, true);
      $el.removeEventListener('touchcancel', onPointerCancel, true);
    };

    const removeMouseEventListener = ($el: HTMLElement) => {
      globalThis.document.removeEventListener('mousemove', onPointerMove, true);
      $el.removeEventListener('mousedown', onPointerDown, true);
      $el.removeEventListener('mouseout', onPointerOut, true);
      $el.removeEventListener('mouseover', onPointerOver, true);
      globalThis.removeEventListener('mouseup', onPointerUp, true);
    };

    renderingService.hooks.init.tapPromise(DOMInteractionPlugin.tag, async () => {
      const $el = this.contextService.getDomElement() as unknown as HTMLElement;

      // @ts-ignore
      if (globalThis.navigator.msPointerEnabled) {
        // @ts-ignore
        $el.style.msContentZooming = 'none';
        // @ts-ignore
        $el.style.msTouchAction = 'none';
      } else if (canvas.supportsPointerEvents) {
        $el.style.touchAction = 'none';
      }

      if (canvas.supportsPointerEvents) {
        addPointerEventListener($el);
      } else {
        addMouseEventListener($el);
      }

      if (canvas.supportsTouchEvents) {
        addTouchEventListener($el);
      }

      // use passive event listeners
      // @see https://zhuanlan.zhihu.com/p/24555031
      $el.addEventListener('wheel', onPointerWheel, {
        passive: true,
        capture: true,
      });
    });

    renderingService.hooks.destroy.tap(DOMInteractionPlugin.tag, () => {
      const $el = this.contextService.getDomElement() as unknown as HTMLElement;

      // @ts-ignore
      if (globalThis.navigator.msPointerEnabled) {
        // @ts-ignore
        $el.style.msContentZooming = '';
        // @ts-ignore
        $el.style.msTouchAction = '';
      } else if (canvas.supportsPointerEvents) {
        $el.style.touchAction = '';
      }

      if (canvas.supportsPointerEvents) {
        removePointerEventListener($el);
      } else {
        removeMouseEventListener($el);
      }

      if (canvas.supportsTouchEvents) {
        removeTouchEventListener($el);
      }

      $el.removeEventListener('wheel', onPointerWheel, true);
    });
  }
}
