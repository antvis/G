import {
  SceneGraphService,
  Renderable,
  Transform,
  Camera,
  SceneGraphNode,
  SHAPE,
  Batch,
  DisplayObjectPool,
  DisplayObject,
} from '@antv/g';
import { inject, injectable } from 'inversify';
import { mat4, vec3 } from 'gl-matrix';
import { FrameGraphHandle } from '../components/framegraph/FrameGraphHandle';
import { FrameGraphPass } from '../components/framegraph/FrameGraphPass';
import { PassNode } from '../components/framegraph/PassNode';
import { ResourcePool } from '../components/framegraph/ResourcePool';
import {
  IAttribute,
  IModelInitializationOptions,
  IUniform,
  IViewport,
  RenderingEngine,
} from '../services/renderer';
import { gl } from '../services/renderer/constants';
import { FrameGraphEngine, IRenderPass } from '../FrameGraphEngine';
import { UNIFORM, ATTRIBUTE } from '../FrameGraphPlugin';
import { Renderable3D } from '../components/Renderable3D';
import { Geometry3D } from '../components/Geometry3D';
import { IUniformBinding, Material3D } from '../components/Material3D';
import { View } from '../View';
import { ModelBuilder, ModelBuilderFactory } from '../shapes';

export interface RenderPassData {
  output: FrameGraphHandle;
}

@injectable()
export class RenderPass implements IRenderPass<RenderPassData> {
  static IDENTIFIER = 'Render Pass';

  @inject(RenderingEngine)
  private readonly engine: RenderingEngine;

  @inject(ResourcePool)
  private readonly resourcePool: ResourcePool;

  @inject(SceneGraphService)
  private sceneGraph: SceneGraphService;

  @inject(View)
  private view: View;

  @inject(Camera)
  private camera: Camera;

  @inject(ModelBuilderFactory)
  private modelBuilderFactory: (shape: SHAPE) => ModelBuilder;

  displayObjectsLastFrame: DisplayObject[] = [];

  setup = (
    fg: FrameGraphEngine,
    passNode: PassNode,
    pass: FrameGraphPass<RenderPassData>,
  ): void => {
    const output = fg.createRenderTarget(passNode, 'color buffer', {
      width: 1,
      height: 1,
      usage: gl.RENDER_ATTACHMENT | gl.SAMPLED | gl.COPY_SRC,
    });

    pass.data = {
      output: passNode.write(fg, output),
    };
  };

  execute = (
    fg: FrameGraphEngine,
    pass: FrameGraphPass<RenderPassData>,
    displayObjects: DisplayObject[],
  ) => {
    const resourceNode = fg.getResourceNode(pass.data.output);
    const framebuffer = this.resourcePool.getOrCreateResource(resourceNode.resource);

    const canvas = this.engine.getCanvas();
    framebuffer.resize({
      width: canvas.width,
      height: canvas.height,
    });
    this.engine.useFramebuffer(
      {
        framebuffer,
        viewport: this.view.getViewport(),
      },
      () => {
        this.engine.clear({
          framebuffer,
          color: this.view.getClearColor(),
          depth: 1,
        });

        this.renderDisplayObjects(displayObjects);
        this.displayObjectsLastFrame = displayObjects;
      },
    );
  };

  renderDisplayObjects(displayObjects: DisplayObject[]) {
    for (const displayObject of displayObjects) {
      const entity = displayObject.getEntity();
      const renderable = entity.getComponent(Renderable);
      renderable.dirty = this.renderDisplayObject(displayObject);
    }
  }

  private createModel(
    { material, geometry }: { material: Material3D; geometry: Geometry3D },
    batchSize?: number,
  ) {
    const { createModel, createAttribute } = this.engine;

    if (batchSize) {
      this.createModelMatrixAttributes({
        geometry,
        count: batchSize,
      });
      material.setDefines({
        INSTANCING: 1,
      });
    }

    const modelInitializationOptions: IModelInitializationOptions = {
      vs: material.vertexShaderGLSL,
      fs: material.fragmentShaderGLSL,
      defines: material.defines,
      attributes: geometry.attributes.reduce((cur: { [key: string]: IAttribute }, prev: any) => {
        cur[prev.name] = prev.buffer;
        return cur;
      }, {}),
      uniforms: material.uniforms.reduce(
        (cur: { [key: string]: IUniform }, prev: IUniformBinding) => {
          cur[prev.name] = prev.data;
          return cur;
        },
        {},
      ),
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
    } else {
      modelInitializationOptions.count = geometry.vertexCount || 3;
    }

    return createModel(modelInitializationOptions);
  }

  private renderDisplayObject(displayObject: DisplayObject): boolean {
    const entity = displayObject.getEntity();
    const renderable3d = entity.getComponent(Renderable3D);
    const material = entity.getComponent(Material3D);

    // hang when model unprepared
    if (!renderable3d || !renderable3d.modelPrepared) {
      return true;
    }

    const geometry = entity.getComponent(Geometry3D);
    const transform = entity.getComponent(Transform);
    const sceneGraphNode = entity.getComponent(SceneGraphNode);
    const batchSize =
      (sceneGraphNode.tagName === Batch.tag &&
        displayObject.attributes.instances &&
        displayObject.attributes.instances.length) ||
      0;

    if (!renderable3d.model) {
      renderable3d.model = this.createModel(
        {
          material,
          geometry,
        },
        batchSize,
      );
    }

    // get VP matrix from camera
    const viewMatrix = this.camera.getViewTransform()!;

    const { width, height } = this.view.getViewport();

    const modelMatrix = this.sceneGraph.getWorldTransform(entity, transform);

    // set MVP matrix, other builtin uniforms @see https://threejs.org/docs/#api/en/renderers/webgl/WebGLProgram
    material.setUniform({
      [UNIFORM.ProjectionMatrix]: this.camera.getPerspective(),
      [UNIFORM.ModelMatrix]: modelMatrix,
      [UNIFORM.ViewMatrix]: viewMatrix,
      [UNIFORM.CameraPosition]: this.camera.getPosition(),
      [UNIFORM.Viewport]: [width, height],
      [UNIFORM.DPR]: window.devicePixelRatio,
    });

    if (renderable3d.model) {
      // update instance model matrix
      if (batchSize) {
        const modelMatrixAttribute0 = geometry.getAttribute(ATTRIBUTE.ModelMatrix0);
        const modelMatrixAttribute1 = geometry.getAttribute(ATTRIBUTE.ModelMatrix1);
        const modelMatrixAttribute2 = geometry.getAttribute(ATTRIBUTE.ModelMatrix2);
        const modelMatrixAttribute3 = geometry.getAttribute(ATTRIBUTE.ModelMatrix3);

        const modelMatrixAttribute0Buffer: number[] = [];
        const modelMatrixAttribute1Buffer: number[] = [];
        const modelMatrixAttribute2Buffer: number[] = [];
        const modelMatrixAttribute3Buffer: number[] = [];

        const parentWorldMatrix = this.sceneGraph.getWorldTransform(entity, transform);

        displayObject.attributes.instances.forEach((instance: DisplayObject) => {
          // don't get each child's worldTransform here, which will cause bad perf
          const m = mat4.multiply(
            mat4.create(),
            parentWorldMatrix,
            this.sceneGraph.getLocalTransform(instance.getEntity()),
          );
          modelMatrixAttribute0Buffer.push(m[0], m[1], m[2], m[3]);
          modelMatrixAttribute1Buffer.push(m[4], m[5], m[6], m[7]);
          modelMatrixAttribute2Buffer.push(m[8], m[9], m[10], m[11]);
          modelMatrixAttribute3Buffer.push(m[12], m[13], m[14], m[15]);
        });

        modelMatrixAttribute0?.buffer?.updateBuffer({
          data: modelMatrixAttribute0Buffer,
          offset: 0,
        });
        modelMatrixAttribute1?.buffer?.updateBuffer({
          data: modelMatrixAttribute1Buffer,
          offset: 0,
        });
        modelMatrixAttribute2?.buffer?.updateBuffer({
          data: modelMatrixAttribute2Buffer,
          offset: 0,
        });
        modelMatrixAttribute3?.buffer?.updateBuffer({
          data: modelMatrixAttribute3Buffer,
          offset: 0,
        });
      }

      const builder = this.modelBuilderFactory(displayObject.nodeType);
      if (builder && builder.renderModel) {
        builder.renderModel(displayObject);
      } else {
        renderable3d.model.draw({
          uniforms: material.uniforms.reduce(
            (cur: { [key: string]: IUniform }, prev: IUniformBinding) => {
              cur[prev.name] = prev.data;
              return cur;
            },
            {},
          ),
        });
      }
    }

    // finish rendering
    return false;
  }

  /**
   * we should decompose mat4 into 4 vec4 like Babylon.js
   * @see https://github.com/mrdoob/three.js/issues/16140
   * relative bug in regl:
   * @see https://github.com/regl-project/regl/issues/597
   */
  private createModelMatrixAttributes({
    geometry,
    count,
  }: {
    geometry: Geometry3D;
    count: number;
  }) {
    const m = mat4.create();
    const instancedModelMatrix0: number[] = [];
    const instancedModelMatrix1: number[] = [];
    const instancedModelMatrix2: number[] = [];
    const instancedModelMatrix3: number[] = [];
    for (let i = 0; i < count; i++) {
      instancedModelMatrix0.push(m[0], m[1], m[2], m[3]);
      instancedModelMatrix1.push(m[4], m[5], m[6], m[7]);
      instancedModelMatrix2.push(m[8], m[9], m[10], m[11]);
      instancedModelMatrix3.push(m[12], m[13], m[14], m[15]);
    }

    geometry
      .setAttribute(ATTRIBUTE.ModelMatrix0, Float32Array.from(instancedModelMatrix0), {
        arrayStride: 4 * 4,
        stepMode: 'instance',
        attributes: [
          {
            shaderLocation: 1,
            offset: 0,
            format: 'float4',
          },
        ],
      })
      .setAttribute(ATTRIBUTE.ModelMatrix1, Float32Array.from(instancedModelMatrix1), {
        arrayStride: 4 * 4,
        stepMode: 'instance',
        attributes: [
          {
            shaderLocation: 1,
            offset: 0,
            format: 'float4',
          },
        ],
      })
      .setAttribute(ATTRIBUTE.ModelMatrix2, Float32Array.from(instancedModelMatrix2), {
        arrayStride: 4 * 4,
        stepMode: 'instance',
        attributes: [
          {
            shaderLocation: 1,
            offset: 0,
            format: 'float4',
          },
        ],
      })
      .setAttribute(ATTRIBUTE.ModelMatrix3, Float32Array.from(instancedModelMatrix3), {
        arrayStride: 4 * 4,
        stepMode: 'instance',
        attributes: [
          {
            shaderLocation: 1,
            offset: 0,
            format: 'float4',
          },
        ],
      });
  }
}
