import { RenderingService, RenderingPlugin, Group } from '@antv/g';
import { ContextService, RenderingContext, RenderingPluginContribution } from '@antv/g';
import { inject, singleton } from 'mana-syringe';

export const RBushRoot = 'RBushRoot';

export interface JsonRenderingContext {
  transferJSON: Function;
}

export class JsonRendering {
  transferJSON(node) {
    const { config, childNodes, nodeName } = node;
    const { style } = config;
    let obj = {
      type: nodeName,
      props: {
        style,
        children: childNodes.map((d) => this.transferJSON(d)),
      },
    };
    return obj;
  }
}
/**
 * support 2 modes in rendering:
 * * immediate
 * * delayed: render at the end of frame with dirty-rectangle
 */
@singleton({ contrib: RenderingPluginContribution })
export class JsonRendererPlugin implements RenderingPlugin {
  static tag = 'JsonRendererPlugin';

  @inject(ContextService)
  private contextService: ContextService<JsonRenderingContext>;

  @inject(RenderingContext)
  private renderingContext: RenderingContext;

  apply(renderingService: RenderingService) {
    renderingService.hooks.beginFrame.tap(JsonRendererPlugin.tag, () => {
      const object = this.renderingContext.root;
      const context = this.contextService.getContext();
      // get json renderer
      const jsonrender = context.transferJSON(object);
      console.log(jsonrender);
    });
  }
}
