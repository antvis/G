import {
  RenderingPlugin,
  RenderingService,
  CanvasConfig,
  SceneGraphNode,
  SHAPE,
  ContextService,
  Camera,
  DisplayObject,
  Batch,
  Renderable,
} from '@antv/g';
import { isNil } from '@antv/util';
import { inject, injectable } from 'inversify';
import { ResourcePool } from './components/framegraph/ResourcePool';
import { Renderable3D, INSTANCING_STATUS } from './components/Renderable3D';
import { RenderingEngine } from './services/renderer';
import { TexturePool } from './shapes/TexturePool';
import { FrameGraphEngine, IRenderPass, RenderPassFactory } from './FrameGraphEngine';
import { CopyPass, CopyPassData } from './passes/CopyPass';
import { RenderPass, RenderPassData } from './passes/RenderPass';
import { Geometry3D } from './components/Geometry3D';
import { Material3D } from './components/Material3D';
import { ModelBuilder } from './shapes';
import { PickingIdGenerator } from './PickingIdGenerator';
import { WebGLRenderingContext } from '.';
import { ShaderModuleService } from './services/shader-module';
import { View } from './View';

export const ATTRIBUTE = {
  ModelMatrix0: 'a_ModelMatrix0',
  ModelMatrix1: 'a_ModelMatrix1',
  ModelMatrix2: 'a_ModelMatrix2',
  ModelMatrix3: 'a_ModelMatrix3',
  PickingColor: 'a_PickingColor',
};

export const UNIFORM = {
  ProjectionMatrix: 'u_ProjectionMatrix',
  ModelViewMatrix: 'u_ModelViewMatrix',
  ModelMatrix: 'u_ModelMatrix',
  ViewMatrix: 'u_ViewMatrix',
  CameraPosition: 'u_CameraPosition',
  Viewport: 'u_Viewport',
  DPR: 'u_DevicePixelRatio',
  Opacity: 'u_Opacity',
  PickingStage: 'u_PickingStage',
};

export const STYLE = {
  Opacity: 'opacity',
  FillOpacity: 'fillOpacity',
};

@injectable()
export class FrameGraphPlugin implements RenderingPlugin {
  static tag = 'FrameGraphPlugin';

  @inject(CanvasConfig)
  private canvasConfig: CanvasConfig;

  @inject(ContextService)
  private contextService: ContextService<WebGLRenderingContext>;

  @inject(ShaderModuleService)
  private shaderModuleService: ShaderModuleService;

  @inject(RenderPassFactory)
  private renderPassFactory: <T>(name: string) => IRenderPass<T>;

  @inject(ResourcePool)
  private resourcePool: ResourcePool;

  @inject(TexturePool)
  private texturePool: TexturePool;

  @inject(RenderingEngine)
  private engine: RenderingEngine;

  @inject(FrameGraphEngine)
  private frameGraphSystem: FrameGraphEngine;

  @inject(PickingIdGenerator)
  private pickingIdGenerator: PickingIdGenerator;

  @inject(ModelBuilder)
  private modelBuilderFactory: (shape: SHAPE) => ModelBuilder;

  @inject(Camera)
  private camera: Camera;

  @inject(View)
  private view: View;

  apply(renderingService: RenderingService) {
    renderingService.hooks.destroy.tap(FrameGraphPlugin.tag, () => {
      this.shaderModuleService.destroy();
      this.resourcePool.clean();
      this.texturePool.destroy();
      this.engine.destroy();
    });

    renderingService.hooks.render.tap(FrameGraphPlugin.tag, (dirtyObjects: DisplayObject[]) => {
      // skip group
      const objects = dirtyObjects.filter((object) => object.nodeType !== SHAPE.Group);

      console.log(objects);

      this.frameGraphSystem.compile();
      this.frameGraphSystem.executePassNodes(objects);
    });

    renderingService.hooks.beforeRender.tap(FrameGraphPlugin.tag, () => {
      this.engine.beforeRender();

      const { setup: setupRenderPass, execute: executeRenderPass } = this.renderPassFactory<RenderPassData>(
        RenderPass.IDENTIFIER
      );
      this.frameGraphSystem.addPass<RenderPassData>(RenderPass.IDENTIFIER, setupRenderPass, executeRenderPass);

      const {
        setup: setupCopyPass,
        execute: executeCopyPass,
        tearDown: tearDownCopyPass,
      } = this.renderPassFactory<CopyPassData>(CopyPass.IDENTIFIER);
      const copyPass = this.frameGraphSystem.addPass<CopyPassData>(
        CopyPass.IDENTIFIER,
        setupCopyPass,
        executeCopyPass,
        tearDownCopyPass
      );

      this.frameGraphSystem.present(copyPass.data.output);
    });

    renderingService.hooks.init.tap(FrameGraphPlugin.tag, async () => {
      this.canvasConfig.renderer.getConfig().enableDirtyRectangleRendering = false;

      this.shaderModuleService.registerBuiltinModules();

      const dpr = this.contextService.getDPR();
      const $canvas = this.contextService.getDomElement();

      this.engine.init({
        canvas: $canvas as HTMLCanvasElement,
        antialias: false,
        dpr,
      });

      const { width, height } = this.canvasConfig;
      this.view.setViewport({
        x: 0,
        y: 0,
        width: width * dpr,
        height: height * dpr,
      });
      this.contextService.resize(width, height);
    });

    renderingService.hooks.mounted.tap(FrameGraphPlugin.tag, (object: DisplayObject) => {
      const entity = object.getEntity();
      const renderable = entity.addComponent(Renderable);
      const renderable3d = entity.addComponent(Renderable3D);
      // add geometry & material required by Renderable3D
      const geometry = entity.addComponent(Geometry3D);
      entity.addComponent(Material3D);

      // add picking id
      renderable3d.pickingId = this.pickingIdGenerator.getId();

      if (!renderable3d.modelPrepared) {
        // TODO: ref engine to create buffers & textures
        renderable3d.engine = this.engine;
        geometry.engine = this.engine;

        let { tagName, attributes } = entity.getComponent(SceneGraphNode);

        // handle batch
        const isBatch = tagName === Batch.tag;
        if (isBatch) {
          tagName = ((object as unknown) as Batch).getBatchType();
        }

        const modelBuilder = this.modelBuilderFactory(tagName);
        if (!modelBuilder) {
          return;
        }
        modelBuilder.prepareModel(object);

        const material = entity.getComponent(Material3D);
        material.setUniform(
          UNIFORM.Opacity,
          isNil(attributes.fillOpacity || attributes.opacity) ? 1 : attributes.fillOpacity || attributes.opacity
        );

        if (isBatch) {
          // allocate pickingid for each child in batch
          const pickingColorBuffer: number[] = [];
          attributes.instances.forEach(() => {
            // TODO: save pickingID
            const childPickingId = this.pickingIdGenerator.getId();
            pickingColorBuffer.push(...this.pickingIdGenerator.encodePickingColor(childPickingId));
          });

          geometry.setAttribute(ATTRIBUTE.PickingColor, Float32Array.from(pickingColorBuffer), {
            arrayStride: 4 * 3,
            stepMode: 'instance',
            attributes: [
              {
                shaderLocation: 0,
                offset: 0,
                format: 'float3',
              },
            ],
          });
        } else {
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
        }

        renderable3d.modelPrepared = true;
      }
    });

    renderingService.hooks.attributeChanged.tap(
      FrameGraphPlugin.tag,
      (object: DisplayObject, name: string, value: any) => {
        const entity = object.getEntity();
        const renderable3d = entity.getComponent(Renderable3D);
        if (renderable3d.modelPrepared) {
          if (name === STYLE.Opacity || name === STYLE.FillOpacity) {
            const material = entity.getComponent(Material3D);
            material.setUniform(UNIFORM.Opacity, value);
          }

          const sceneGraphNode = entity.getComponent(SceneGraphNode);
          const modelBuilder = this.modelBuilderFactory(sceneGraphNode.tagName);
          modelBuilder.onAttributeChanged(object, name, value);
        }
      }
    );
  }
}
