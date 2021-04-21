import { Entity } from '@antv/g-ecs';
import { SceneGraphNode, DisplayObjectPlugin, DisplayObjectHooks, SHAPE, RENDERER } from '@antv/g';
import { inject, injectable } from 'inversify';
import { Geometry3D } from '../components/Geometry3D';
import { Material3D } from '../components/Material3D';
import { Renderable3D } from '../components/Renderable3D';
import { PickingIdGenerator } from './PickingIdGenerator';
import { ModelBuilder } from '../shapes';
import { RenderingContext } from '../services/WebGLContextService';
import { ATTRIBUTE, FrameGraphPlugin, STYLE, UNIFORM } from './FrameGraphPlugin';
import { isNil } from '@antv/util';

@injectable()
export class InitShapePlugin implements DisplayObjectPlugin {
  @inject(PickingIdGenerator)
  private pickingIdGenerator: PickingIdGenerator;

  @inject(ModelBuilder)
  private modelBuilderFactory: (shape: SHAPE) => ModelBuilder;

  apply() {
    DisplayObjectHooks.init.tap('InitPlugins', (entity: Entity) => {
      const subRenderable = entity.addComponent(Renderable3D);
      // add geometry & material required by Renderable3D
      entity.addComponent(Geometry3D);
      entity.addComponent(Material3D);

      // add picking id
      subRenderable.pickingId = this.pickingIdGenerator.getId();

      // instancing
      const instanceEntity = entity.getComponent(SceneGraphNode).attributes.instanceEntity;
      // TODO: check whether current engine supports instanced array?
      if (instanceEntity) {
        const source = instanceEntity.getComponent(Renderable3D);
        const geometry = instanceEntity.getComponent(Geometry3D);

        subRenderable.source = source;
        subRenderable.sourceEntity = instanceEntity;
        source.instances.push(subRenderable);
        source.instanceEntities.push(entity);
        source.instanceDirty = true;
        geometry.reset();
      }
    });

    DisplayObjectHooks.mounted.tapPromise(
      FrameGraphPlugin.tag,
      async (renderer: RENDERER, context: RenderingContext, entity: Entity) => {
        if (renderer !== RENDERER.WebGL) {
          return;
        }

        const renderable3d = entity.getComponent(Renderable3D);
        const geometry = entity.getComponent(Geometry3D);
        const { tagName, attributes } = entity.getComponent(SceneGraphNode);

        if (!renderable3d.modelPrepared) {
          // TODO: ref engine to create buffers & textures
          renderable3d.engine = context.engine;
          geometry.engine = context.engine;

          const modelBuilder = this.modelBuilderFactory(tagName);
          await modelBuilder.prepareModel(context, entity);

          const material = entity.getComponent(Material3D);
          material.setUniform(
            UNIFORM.Opacity,
            isNil(attributes.fillOpacity || attributes.opacity) ? 1 : attributes.fillOpacity || attributes.opacity
          );

          geometry.setAttribute(
            ATTRIBUTE.PickingColor,
            Float32Array.from(this.pickingIdGenerator.encodePickingColor(renderable3d.pickingId)),
            {
              arrayStride: 4 * 3,
              stepMode: 'instance',
              attributes: [
                {
                  shaderLocation: 0,
                  offset: 0,
                  format: 'float3',
                },
              ],
            }
          );

          renderable3d.modelPrepared = true;
        }
      }
    );

    DisplayObjectHooks.unmounted.tapPromise(
      'CleanRenderablePlugin',
      async (renderer: RENDERER, context: RenderingContext, entity: Entity) => {
        if (renderer !== RENDERER.WebGL) {
          return;
        }

        const renderable = entity.getComponent(Renderable3D);
        const geometry = entity.getComponent(Geometry3D);
        const material = entity.getComponent(Material3D);

        if (renderable.model) {
          renderable.model.destroy();
        }

        renderable.modelPrepared = false;
        renderable.model = null;

        geometry.reset();

        material.dirty = false;
      }
    );

    DisplayObjectHooks.changeAttribute.tapPromise(
      FrameGraphPlugin.tag,
      async (entity: Entity, name: string, value: any) => {
        const renderable3d = entity.getComponent(Renderable3D);
        if (renderable3d.modelPrepared) {
          if (name === STYLE.Opacity || name === STYLE.FillOpacity) {
            const material = entity.getComponent(Material3D);
            material.setUniform(UNIFORM.Opacity, value);
          }

          const sceneGraphNode = entity.getComponent(SceneGraphNode);
          const modelBuilder = this.modelBuilderFactory(sceneGraphNode.tagName);
          await modelBuilder.onAttributeChanged(entity, name, value);
        }
      }
    );
  }
}
