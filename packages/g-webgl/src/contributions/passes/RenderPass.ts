import { ContextService, Renderable, Transform } from '@antv/g-core';
import { Entity } from '@antv/g-ecs';
import { mat4 } from 'gl-matrix';
import { inject, injectable } from 'inversify';
import { FrameGraphHandle } from '../../components/framegraph/FrameGraphHandle';
import { FrameGraphPass } from '../../components/framegraph/FrameGraphPass';
import { PassNode } from '../../components/framegraph/PassNode';
import { ResourcePool } from '../../components/framegraph/ResourcePool';
import { Geometry3D } from '../../components/Geometry3D';
import { IUniformBinding, Material3D } from '../../components/Material3D';
import {
  IAttribute,
  ICamera,
  IModel,
  IModelInitializationOptions,
  IUniform,
  IView,
  RenderingEngine,
} from '../../services/renderer';
import { gl } from '../../services/renderer/constants';
import { FrameGraphSystem, IRenderPass } from '../../systems/FrameGraph';
import { RenderingContext } from '../../WebGLContext';

export interface RenderPassData {
  output: FrameGraphHandle;
}

@injectable()
export class RenderPass implements IRenderPass<RenderPassData> {
  public static IDENTIFIER = 'Render Pass';

  @inject(RenderingEngine)
  private readonly engine: RenderingEngine;

  @inject(ResourcePool)
  private readonly resourcePool: ResourcePool;

  @inject(ContextService)
  private readonly contextService: ContextService<RenderingContext>;

  private modelCache: Record<string, IModel> = {};

  public setup = (fg: FrameGraphSystem, passNode: PassNode, pass: FrameGraphPass<RenderPassData>): void => {
    const output = fg.createRenderTarget(passNode, 'color buffer', {
      width: 1,
      height: 1,
      usage: gl.RENDER_ATTACHMENT | gl.SAMPLED | gl.COPY_SRC,
    });

    pass.data = {
      output: passNode.write(fg, output),
    };
  };

  public execute = async (
    fg: FrameGraphSystem,
    pass: FrameGraphPass<RenderPassData>,
    entities: Entity[]
  ): Promise<void> => {
    const resourceNode = fg.getResourceNode(pass.data.output);
    const framebuffer = this.resourcePool.getOrCreateResource(resourceNode.resource);

    // initialize model of each renderable
    for (const entity of entities) {
      await this.initEntity(entity);
    }

    const canvas = this.engine.getCanvas();
    framebuffer.resize({
      width: canvas.width,
      height: canvas.height,
    });

    this.engine.setScissor({
      enable: false,
    });
    this.engine.clear({
      framebuffer,
      color: this.contextService.getContext()?.view.getClearColor(), // TODO: use clearColor defined in view
      depth: 1,
    });

    this.engine.useFramebuffer(framebuffer, () => {
      for (const entity of entities) {
        // must do rendering in a sync way
        this.renderEntity(entity);
      }
    });
  };

  public renderEntity(entity: Entity) {
    // const scene = view.getScene();
    const view = this.contextService.getContext()?.view;
    const camera = this.contextService.getContext()?.camera;

    if (view && camera) {
      // get VP matrix from camera
      const viewMatrix = camera.getViewTransform()!;
      const viewProjectionMatrix = mat4.multiply(mat4.create(), camera.getPerspective(), viewMatrix);
      // TODO: use cached planes if camera was not changed
      camera.getFrustum().extractFromVPMatrix(viewProjectionMatrix);

      const { x, y, width, height } = view.getViewport();
      this.engine.viewport({
        x,
        y,
        width,
        height,
      });

      // this.engine.setScissor({
      //   enable: true,
      //   box: { x, y, width, height },
      // });
      // this.engine.clear({
      //   // framebuffer,
      //   color: [1, 1, 1, 1], // TODO: use clearColor defined in view
      //   depth: 1,
      // });

      this.renderMesh(entity, {
        camera,
        view,
        viewMatrix,
      });
    }
  }

  private renderMesh(
    entity: Entity,
    {
      camera,
      view,
      viewMatrix,
    }: {
      camera: ICamera;
      view: IView;
      viewMatrix: mat4;
    }
  ) {
    const renderable = entity.getComponent(Renderable);
    if (!renderable || !renderable.visible) {
      return;
    }

    const material = entity.getComponent(Material3D);
    const geometry = entity.getComponent(Geometry3D);

    // geometry 在自己的 System 中完成脏检查后的更新
    if (!geometry || geometry.dirty || !material) {
      return;
    }

    // get model matrix from renderable
    const transform = entity.getComponent(Transform);

    const modelViewMatrix = mat4.multiply(mat4.create(), viewMatrix, transform.worldTransform);
    const { width, height } = view.getViewport();

    // set MVP matrix, other builtin uniforms @see https://threejs.org/docs/#api/en/renderers/webgl/WebGLProgram
    material.setUniform({
      projectionMatrix: camera.getPerspective(),
      modelViewMatrix,
      modelMatrix: transform.worldTransform,
      viewMatrix,
      cameraPosition: camera.getPosition(),
      u_viewport: [width, height],
    });

    if (renderable.model) {
      console.log(material.uniforms);
      renderable.model.draw({
        uniforms: material.uniforms.reduce((cur: { [key: string]: IUniform }, prev: IUniformBinding) => {
          cur[prev.name] = prev.data;
          return cur;
        }, {}),
      });

      material.uniforms.forEach((u) => {
        u.dirty = false;
      });
      material.dirty = false;
    }
  }

  private async initEntity(entity: Entity) {
    const renderable = entity.getComponent(Renderable);

    if (!renderable) {
      return;
    }

    const material = entity.getComponent(Material3D);
    const geometry = entity.getComponent(Geometry3D);

    if (!geometry || geometry.dirty || !material || !material.vertexShaderGLSL || !material.fragmentShaderGLSL) {
      return;
    }

    if (!renderable.model) {
      // @ts-ignore
      const modelCacheKey = `m-${material.getId()}-g-${geometry.getId()}`;
      if (this.modelCache[modelCacheKey]) {
        renderable.model = this.modelCache[modelCacheKey];
        return;
      }

      material.setUniform({
        projectionMatrix: 1,
        modelViewMatrix: 1,
        modelMatrix: 1,
        viewMatrix: 1,
        cameraPosition: 1,
        u_viewport: 1,
      });

      const { createModel, createAttribute } = this.engine;
      const view = this.contextService.getContext()?.view;

      const modelInitializationOptions: IModelInitializationOptions = {
        vs: material.vertexShaderGLSL,
        fs: material.fragmentShaderGLSL,
        defines: material.defines,
        attributes: geometry.attributes.reduce((cur: { [key: string]: IAttribute }, prev: any) => {
          if (prev.data && prev.buffer) {
            cur[prev.name] = createAttribute({
              buffer: prev.buffer,
              attributes: prev.attributes,
              arrayStride: prev.arrayStride,
              stepMode: prev.stepMode,
              divisor: prev.stepMode === 'vertex' ? 0 : 1,
            });
          }
          return cur;
        }, {}),
        uniforms: material.uniforms.reduce((cur: { [key: string]: IUniform }, prev: IUniformBinding) => {
          cur[prev.name] = prev.data;
          return cur;
        }, {}),
        scissor: {
          enable: true,
          // @ts-ignore
          box: () => view.getViewport(),
        },
      };

      if (material.cull) {
        modelInitializationOptions.cull = material.cull;
      }
      if (material.depth) {
        modelInitializationOptions.depth = material.depth;
      }
      if (material.blend) {
        modelInitializationOptions.blend = material.blend;
      }

      if (geometry.indicesBuffer) {
        modelInitializationOptions.elements = geometry.indicesBuffer;
      }

      if (geometry.maxInstancedCount) {
        modelInitializationOptions.instances = geometry.maxInstancedCount;
        modelInitializationOptions.count = geometry.vertexCount || 3;
      }

      renderable.model = await createModel(modelInitializationOptions);
      this.modelCache[modelCacheKey] = renderable.model;
    }
  }
}
