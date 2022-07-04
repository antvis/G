import type { DisplayObject, FederatedEvent, RenderingPlugin, RenderingService } from '@antv/g';
import {
  ContextService,
  inject,
  RenderingContext,
  RenderingPluginContribution,
  singleton,
} from '@antv/g';
import { AnnotationPluginOptions } from './tokens';

/**
 * make shape selectable:
 * @example
 * circle.style.selectable = true;
 */
@singleton({ contrib: RenderingPluginContribution })
export class AnnotationPlugin implements RenderingPlugin {
  static tag = 'Annotation';

  @inject(RenderingContext)
  private renderingContext: RenderingContext;

  @inject(ContextService)
  private contextService: ContextService<unknown>;

  @inject(AnnotationPluginOptions)
  private annotationPluginOptions: AnnotationPluginOptions;

  apply(renderingService: RenderingService) {
    const document = this.renderingContext.root.ownerDocument;
    const canvas = document.defaultView;

    renderingService.hooks.init.tapPromise(AnnotationPlugin.tag, async () => {
      canvas.addEventListener('click', (e: FederatedEvent) => {
        const object = e.target as DisplayObject;

        if (object.style?.selectable) {
          // 绘制辅助 UI
        }
      });
    });

    renderingService.hooks.destroy.tap(AnnotationPlugin.tag, () => {});
  }
}
