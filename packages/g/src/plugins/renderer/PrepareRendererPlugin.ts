import { Entity } from '@antv/g-ecs';
import { inject, injectable } from 'inversify';
import { Renderable } from '../../components';
import { DisplayObjectHooks } from '../../hooks';
import { ContextService } from '../../services';
import { RenderingService, RenderingPlugin } from '../../services/RenderingService';
import { SceneGraphService, SCENE_GRAPH_EVENT } from '../../services/SceneGraphService';
import { CanvasConfig, RendererConfig } from '../../types';

@injectable()
export class PrepareRendererPlugin implements RenderingPlugin {
  @inject(CanvasConfig)
  private canvasConfig: CanvasConfig;

  @inject(ContextService)
  private contextService: ContextService<unknown>;

  @inject(SceneGraphService)
  private sceneGraphService: SceneGraphService;

  apply(renderer: RenderingService) {
    renderer.hooks.prepareEntities.tapPromise('PrepareRendererPlugin', async (entities: Entity[]) => {
      return Promise.all(
        entities.map(async (entity) => {
          const renderable = entity.getComponent(Renderable);

          // trigger hooks
          if (!renderable.didMount) {
            this.sceneGraphService.emit(SCENE_GRAPH_EVENT.AABBChanged, entity);

            await DisplayObjectHooks.mounted.promise(
              (this.canvasConfig.renderer as RendererConfig).type,
              this.contextService.getContext(),
              entity
            );
            renderable.didMount = true;
            renderable.dirty = true;
          }

          return entity;
        })
      );
    });
  }
}
