import { Entity } from '@antv/g-ecs';
import { ContextService, RenderingContext, RenderingService, RenderingPlugin } from '@antv/g';
import { inject, injectable } from 'inversify';
import { ElementSVG } from '../components/ElementSVG';

@injectable()
export class FrameRendererPlugin implements RenderingPlugin {
  static tag = 'SVGFrameRendererPlugin';

  @inject(RenderingContext)
  private renderingContext: RenderingContext;

  @inject(ContextService)
  private contextService: ContextService<SVGElement>;

  apply(renderingService: RenderingService) {
    renderingService.hooks.beginFrame.tapPromise(
      FrameRendererPlugin.tag,
      async (entitiesToRender: Entity[], entities: Entity[]) => {
        if (this.renderingContext.dirtyEntities.length) {
          // clear dirty entities first
          // this.renderingContext.dirtyEntities.forEach((entity: Entity) => {
          //   const element = entity.getComponent(ElementSVG);
          //   if (element.$el) {
          //     element.$el.setAttribute('visibility', 'hidden');
          //   }
          // });
          // create empty fragment
          // const fragment = document.createDocumentFragment();
          // entitiesToRender.forEach((entity) => {
          //   const $el = entity.getComponent(ElementSVG).$el;
          //   if ($el) {
          //     fragment.appendChild($el);
          //   }
          // });
          // this.contextService.getContext().appendChild(fragment);
          // sort
          // console.log(entitiesToRender, entities);
        }
      }
    );
  }

  private diff(entities: Entity[]) {}
}
