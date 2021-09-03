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
  PARSED_COLOR_TYPE,
  OffscreenCanvasCreator,
  ParsedColorStyleProperty,
} from '@antv/g';
import { mat3 } from 'gl-matrix';
import { isNil } from '@antv/util';
import { inject, injectable } from 'inversify';
import { ResourcePool } from './components/framegraph/ResourcePool';
import { Renderable3D, INSTANCING_STATUS } from './components/Renderable3D';
import { ITexture2D, RenderingEngine } from './services/renderer';
import { TexturePool } from './shapes/TexturePool';
import { FrameGraphEngine, IRenderPass, RenderPassFactory } from './FrameGraphEngine';
import { CopyPass, CopyPassData } from './passes/CopyPass';
import { RenderPass, RenderPassData } from './passes/RenderPass';
import { Geometry3D } from './components/Geometry3D';
import { Material3D } from './components/Material3D';
import { ModelBuilder, ModelBuilderFactory } from './shapes';
import { PickingIdGenerator } from './PickingIdGenerator';
import { WebGLRenderingContext } from '.';
import { ShaderModuleService } from './services/shader-module';
import { View } from './View';
import TAAPass, { TAAPassData } from './passes/TAAPass';
import { PassNode } from './components/framegraph/PassNode';
import { FrameGraphPass } from './components/framegraph/FrameGraphPass';
import { gl } from './services/renderer/constants';

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
  FillOpacity: 'u_FillOpacity',
  Opacity: 'u_Opacity',
  PickingStage: 'u_PickingStage',
  /**
   * gradient(linear/radial) & pattern
   */
  Map: 'u_Map',
  UvTransform: 'u_UvTransform',
};

export const STYLE = {
  Fill: 'fill',
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

  @inject(ModelBuilderFactory)
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

    renderingService.hooks.render.tap(FrameGraphPlugin.tag, (dirtyObject: DisplayObject) => {
      // skip group
      // const objects = dirtyObjects.filter((object) => object.nodeName !== SHAPE.Group);

      if (
        dirtyObject.nodeName === SHAPE.Group ||
        dirtyObject.getEntity().getComponent(Renderable).instanced
      ) {
        return;
      }

      const renderPass = this.renderPassFactory<RenderPassData>(
        RenderPass.IDENTIFIER,
      ) as RenderPass;
      renderPass.pushToRenderQueue(dirtyObject);
    });

    renderingService.hooks.beginFrame.tap(FrameGraphPlugin.tag, () => {
      // update viewport
      const { width, height } = this.canvasConfig;
      const dpr = this.contextService.getDPR();
      this.view.setViewport({
        x: 0,
        y: 0,
        width: width * dpr,
        height: height * dpr,
      });

      this.engine.beforeRender();

      this.buildFrameGraph();
    });

    renderingService.hooks.endFrame.tap(FrameGraphPlugin.tag, () => {
      this.frameGraphSystem.executePassNodes();
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
      this.contextService.resize(width, height);
    });

    renderingService.hooks.mounted.tap(FrameGraphPlugin.tag, async (object: DisplayObject) => {
      const entity = object.getEntity();
      const renderable = entity.getComponent(Renderable);
      if (renderable.instanced) {
        return;
      }

      const renderable3d = entity.addComponent(Renderable3D);
      // add geometry & material required by Renderable3D
      const geometry = entity.addComponent(Geometry3D);
      entity.addComponent(Material3D);

      // add picking id
      renderable3d.pickingId = this.pickingIdGenerator.getId(object);

      if (!renderable3d.modelPrepared) {
        // TODO: ref engine to create buffers & textures
        renderable3d.engine = this.engine;
        geometry.engine = this.engine;

        let { tagName, attributes } = entity.getComponent(SceneGraphNode);

        // handle batch
        const isBatch = tagName === Batch.tag;
        if (isBatch) {
          tagName = (object as unknown as Batch<any>).getBatchType()!;
        }

        const modelBuilder = this.modelBuilderFactory(tagName);
        if (!modelBuilder) {
          return;
        }
        await modelBuilder.prepareModel(object);

        const material = entity.getComponent(Material3D);

        const { fill, opacity, fillOpacity } = object.parsedStyle;
        material.setUniform(UNIFORM.Opacity, opacity);
        material.setUniform(UNIFORM.FillOpacity, fillOpacity);
        await this.updateFill(fill, object, renderingService);

        // allocate pickingid for each child in batch
        const pickingColorBuffer: number[] = [];
        if (isBatch) {
          object.children.forEach((instance: DisplayObject) => {
            const childPickingId = this.pickingIdGenerator.getId(instance);
            pickingColorBuffer.push(...this.pickingIdGenerator.encodePickingColor(childPickingId));
          });
        } else {
          pickingColorBuffer.push(
            ...this.pickingIdGenerator.encodePickingColor(renderable3d.pickingId),
          );
        }
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

        renderable3d.modelPrepared = true;
      }
    });

    renderingService.hooks.unmounted.tap(FrameGraphPlugin.tag, (object: DisplayObject) => {
      const entity = object.getEntity();
      entity.removeComponent(Renderable3D, true);
      entity.removeComponent(Geometry3D, true);
      entity.removeComponent(Material3D, true);
    });

    renderingService.hooks.attributeChanged.tap(
      FrameGraphPlugin.tag,
      async (object: DisplayObject, name: string, value: any) => {
        const entity = object.getEntity();
        const renderable3d = entity.getComponent(Renderable3D);
        const material = entity.getComponent(Material3D);
        if (renderable3d && renderable3d.modelPrepared) {
          if (name === STYLE.Opacity) {
            material.setUniform(UNIFORM.Opacity, value);
          } else if (name === STYLE.FillOpacity) {
            material.setUniform(UNIFORM.FillOpacity, value);
          } else if (name === STYLE.Fill) {
            await this.updateFill(object.parsedStyle.fill, object, renderingService);
          }

          const sceneGraphNode = entity.getComponent(SceneGraphNode);
          const modelBuilder = this.modelBuilderFactory(sceneGraphNode.tagName);
          modelBuilder.onAttributeChanged(object, name, value);
        }
      },
    );
  }

  private buildFrameGraph() {
    const { enableTAA } = this.canvasConfig.renderer.getConfig();

    const { setup: setupRenderPass, execute: executeRenderPass } =
      this.renderPassFactory<RenderPassData>(RenderPass.IDENTIFIER);
    const renderPass = this.frameGraphSystem.addPass<RenderPassData>(
      RenderPass.IDENTIFIER,
      // @ts-ignore
      setupRenderPass,
      executeRenderPass,
    );

    const { setup: setupTAAPass, execute: executeTAAPass } = this.renderPassFactory<TAAPassData>(
      TAAPass.IDENTIFIER,
    );
    const taaPass = this.frameGraphSystem.addPass<TAAPassData>(
      TAAPass.IDENTIFIER,
      // @ts-ignore
      setupTAAPass,
      executeTAAPass,
    );

    const { execute: executeCopyPass } = this.renderPassFactory<CopyPassData>(CopyPass.IDENTIFIER);
    const copyPass = this.frameGraphSystem.addPass<CopyPassData>(
      CopyPass.IDENTIFIER,
      (fg: FrameGraphEngine, passNode: PassNode, pass: FrameGraphPass<CopyPassData>) => {
        const output = fg.createRenderTarget(passNode, 'render to screen', {
          width: 1,
          height: 1,
        });

        pass.data = {
          input: passNode.read(enableTAA ? taaPass.data.copy : renderPass.data.output),
          output: passNode.write(fg, output),
        };
      },
      executeCopyPass,
    );

    // render to screen
    this.frameGraphSystem.present(copyPass.data.output);
    this.frameGraphSystem.compile();
  }

  private async updateFill(
    fill: ParsedColorStyleProperty,
    object: DisplayObject,
    renderingService: RenderingService,
  ) {
    const material = object.getEntity().getComponent(Material3D);
    const renderable = object.getEntity().getComponent(Renderable);
    // use pattern & gradient
    if (
      fill.type === PARSED_COLOR_TYPE.Pattern ||
      fill.type === PARSED_COLOR_TYPE.LinearGradient ||
      fill.type === PARSED_COLOR_TYPE.RadialGradient
    ) {
      let texture: ITexture2D;
      if (
        fill.type === PARSED_COLOR_TYPE.LinearGradient ||
        fill.type === PARSED_COLOR_TYPE.RadialGradient
      ) {
        this.texturePool.getOrCreateGradient({
          type: fill.type,
          ...fill.value,
          width: 128,
          height: 128,
        });
        const canvas = this.texturePool.getOrCreateCanvas();
        texture = await this.texturePool.getOrCreateTexture2D(this.engine, canvas, {
          width: 32,
          height: 32,
        });
      } else {
        texture = await this.texturePool.getOrCreateTexture2D(this.engine, fill.value.src, {
          width: 32,
          height: 32,
        });
      }
      material.setDefines({
        USE_UV: 1,
        USE_MAP: 1,
      });
      material.setUniform({
        [UNIFORM.Map]: texture,
        [UNIFORM.UvTransform]: mat3.create(),
      });
      renderable.dirty = true;
      renderingService.dirtify();
    }
  }
}
