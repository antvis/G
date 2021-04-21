import { RenderingPlugin, RenderingService } from '@antv/g';
import { Entity } from '@antv/g-ecs';
import { injectable } from 'inversify';
import { Geometry3D } from '../components/Geometry3D';
import { Material3D } from '../components/Material3D';
import { Renderable3D } from '../components/Renderable3D';
import { RenderingContext } from '../services/WebGLContextService';

@injectable()
export class CleanRenderablePlugin implements RenderingPlugin {
  static tag = 'CleanRenderablePlugin';

  apply(renderer: RenderingService) {
    renderer.hooks.unmounted.tapPromise(
      CleanRenderablePlugin.tag,
      async (context: RenderingContext, entity: Entity) => {
        const renderable = entity.getComponent(Renderable3D);
        const geometry = entity.getComponent(Geometry3D);
        const material = entity.getComponent(Material3D);

        if (renderable.model) {
          renderable.model.destroy();
        }

        renderable.modelPrepared = false;
        renderable.model = null;

        geometry.reset();
        geometry.dirty = false;

        material.dirty = false;
      }
    );
  }
}
