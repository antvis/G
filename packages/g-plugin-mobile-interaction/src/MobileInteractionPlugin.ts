import type { InteractivePointerEvent, RenderingPlugin, RenderingService } from '@antv/g';
import { ContextService, RenderingPluginContribution } from '@antv/g';
import { inject, singleton } from 'mana-syringe';

/**
 * listen to mouse/touch/pointer events on DOM wrapper, trigger pointer events
 */
@singleton({ contrib: RenderingPluginContribution })
export class MobileInteractionPlugin implements RenderingPlugin {
  static tag = 'MobileInteractionPlugin';

  @inject(ContextService)
  private contextService: ContextService<CanvasRenderingContext2D>;

  apply(renderingService: RenderingService) {
    const onPointerMove = (ev: InteractivePointerEvent) => {
      // 触发 G 定义的标准 pointerMove 事件
      renderingService.hooks.pointerMove.call(ev);
    };

    const onPointerUp = (ev: InteractivePointerEvent) => {
      // 触发 G 定义的标准 pointerUp 事件
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

    // TODO: 移动端应该无需滚轮事件？
    // const onPointerWheel = (ev: InteractivePointerEvent) => {
    //   renderingService.hooks.pointerWheel.call(ev);
    // };

    renderingService.hooks.init.tap(MobileInteractionPlugin.tag, () => {
      // 获取小程序上下文
      const context = this.contextService.getContext();

      // 基于小程序上下文的事件监听方式，绑定事件监听，可以参考下面基于 DOM 的方式

      // if (supportsPointerEvents) {
      //   self.document.addEventListener('pointermove', onPointerMove, true);
      //   $el.addEventListener('pointerdown', onPointerDown, true);
      //   $el.addEventListener('pointerleave', onPointerOut, true);
      //   $el.addEventListener('pointerover', onPointerOver, true);
      //   self.addEventListener('pointerup', onPointerUp, true);
      // } else {
      //   self.document.addEventListener('mousemove', onPointerMove, true);
      //   $el.addEventListener('mousedown', onPointerDown, true);
      //   $el.addEventListener('mouseout', onPointerOut, true);
      //   $el.addEventListener('mouseover', onPointerOver, true);
      //   self.addEventListener('mouseup', onPointerUp, true);
      // }

      // always look directly for touch events so that we can provide original data
      // In a future version we should change this to being just a fallback and rely solely on
      // PointerEvents whenever available
      // if (supportsTouchEvents) {
      //   $el.addEventListener('touchstart', onPointerDown, true);
      //   $el.addEventListener('touchend', onPointerUp, true);
      //   $el.addEventListener('touchmove', onPointerMove, true);
      // }

      // // use passive event listeners
      // // @see https://zhuanlan.zhihu.com/p/24555031
      // $el.addEventListener('wheel', onPointerWheel, {
      //   passive: true,
      //   capture: true,
      // });
    });

    renderingService.hooks.destroy.tap(MobileInteractionPlugin.tag, () => {
      // 获取小程序上下文
      const context = this.contextService.getContext();

      // 基于小程序上下文的事件监听方式，移除事件监听

      // if (supportsPointerEvents) {
      //   self.document.removeEventListener('pointermove', onPointerMove, true);
      //   $el.removeEventListener('pointerdown', onPointerDown, true);
      //   $el.removeEventListener('pointerleave', onPointerOut, true);
      //   $el.removeEventListener('pointerover', onPointerOver, true);
      //   self.removeEventListener('pointerup', onPointerUp, true);
      // } else {
      //   self.document.removeEventListener('mousemove', onPointerMove, true);
      //   $el.removeEventListener('mousedown', onPointerDown, true);
      //   $el.removeEventListener('mouseout', onPointerOut, true);
      //   $el.removeEventListener('mouseover', onPointerOver, true);
      //   self.removeEventListener('mouseup', onPointerUp, true);
      // }

      // if (supportsTouchEvents) {
      //   $el.removeEventListener('touchstart', onPointerDown, true);
      //   $el.removeEventListener('touchend', onPointerUp, true);
      //   $el.removeEventListener('touchmove', onPointerMove, true);
      // }

      // $el.removeEventListener('wheel', onPointerWheel, true);
    });
  }
}
