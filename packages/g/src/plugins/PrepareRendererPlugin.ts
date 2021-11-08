import { inject, singleton } from 'mana-syringe';
import { ElementEvent, FederatedEvent, INode } from '../dom';
import {
  dirtifyRenderable,
  RenderingContext,
  RENDER_REASON,
  RenderingPluginContribution,
} from '../services';
import { RenderingService, RenderingPlugin } from '../services/RenderingService';

@singleton({ contrib: RenderingPluginContribution })
export class PrepareRendererPlugin implements RenderingPlugin {
  static tag = 'PrepareRendererPlugin';

  @inject(RenderingContext)
  private renderingContext: RenderingContext;

  apply(renderingService: RenderingService) {
    const handleAttributeChanged = (
      e: FederatedEvent<
        Event,
        {
          attributeName: string;
          oldValue: any;
          newValue: any;
        }
      >,
    ) => {
      this.renderingContext.renderReasons.add(RENDER_REASON.DisplayObjectChanged);
    };

    const dirtifyToRoot = (e: FederatedEvent) => {
      dirtifyRenderable(e.target as INode, true);

      renderingService.dirtify();
    };

    const handleBoundsChanged = (e: FederatedEvent) => {
      // const path = e.composedPath().slice(0, -2);
      // path.forEach((node: DisplayObject) => {
      //   const parent = node.parentElement as DisplayObject;
      //   if (parent && parent.style && parent.style.transformOrigin) {
      //     updateTransformOrigin(
      //       parent.style.transformOrigin,
      //       parent.style.transformOrigin,
      //       parent,
      //       true,
      //     );
      //   }
      // });

      renderingService.dirtify();
    };

    const handleMounted = (e: FederatedEvent) => {
      dirtifyToRoot(e);
    };

    const handleUnmounted = (e: FederatedEvent) => {
      dirtifyToRoot(e);
    };

    renderingService.hooks.init.tap(PrepareRendererPlugin.tag, () => {
      this.renderingContext.root.addEventListener(ElementEvent.MOUNTED, handleMounted);
      this.renderingContext.root.addEventListener(ElementEvent.UNMOUNTED, handleUnmounted);
      this.renderingContext.root.addEventListener(
        ElementEvent.ATTRIBUTE_CHANGED,
        handleAttributeChanged,
      );
      this.renderingContext.root.addEventListener(ElementEvent.BOUNDS_CHANGED, handleBoundsChanged);
    });

    renderingService.hooks.destroy.tap(PrepareRendererPlugin.tag, () => {
      this.renderingContext.root.removeEventListener(ElementEvent.MOUNTED, handleMounted);
      this.renderingContext.root.removeEventListener(ElementEvent.UNMOUNTED, handleUnmounted);
      this.renderingContext.root.removeEventListener(
        ElementEvent.ATTRIBUTE_CHANGED,
        handleAttributeChanged,
      );
      this.renderingContext.root.removeEventListener(
        ElementEvent.BOUNDS_CHANGED,
        handleBoundsChanged,
      );
    });
  }
}
