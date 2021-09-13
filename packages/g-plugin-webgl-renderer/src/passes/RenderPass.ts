import {
  SceneGraphService,
  Renderable,
  Transform,
  Camera,
  DefaultCamera,
  SHAPE,
  Batch,
  DisplayObject,
  RenderingContext,
  Rectangle,
} from '@antv/g';
import { inject, injectable } from 'inversify';
import { mat4, vec3 } from 'gl-matrix';
import { FrameGraphHandle } from '../components/framegraph/FrameGraphHandle';
import { FrameGraphPass } from '../components/framegraph/FrameGraphPass';
import { PassNode } from '../components/framegraph/PassNode';
import { ResourcePool } from '../components/framegraph/ResourcePool';
import {
  IAttribute,
  IFramebuffer,
  IModelInitializationOptions,
  IUniform,
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
import { ShaderModuleService, ShaderType } from '../services/shader-module';
import { PickingIdGenerator } from '../PickingIdGenerator';

export interface RenderPassData {
  output: FrameGraphHandle;
  /**
   * FBO used in Picking
   */
  picking: FrameGraphHandle;
}

export const PickingStage = {
  NONE: 0.0,
  ENCODE: 1.0,
  HIGHLIGHT: 2.0,
};

@injectable()
export class RenderPass implements IRenderPass<RenderPassData> {
  static IDENTIFIER = 'Render Pass';

  @inject(RenderingEngine)
  private readonly engine: RenderingEngine;

  @inject(ResourcePool)
  private readonly resourcePool: ResourcePool;

  @inject(RenderingContext)
  private renderingContext: RenderingContext;

  @inject(SceneGraphService)
  private sceneGraph: SceneGraphService;

  @inject(ShaderModuleService)
  private shaderModuleService: ShaderModuleService;

  @inject(PickingIdGenerator)
  private pickingIdGenerator: PickingIdGenerator;

  @inject(View)
  private view: View;

  @inject(DefaultCamera)
  private camera: Camera;

  @inject(ModelBuilderFactory)
  private modelBuilderFactory: (shape: string) => ModelBuilder;

  private pickingFramebuffer: IFramebuffer;

  displayObjectsLastFrame: DisplayObject[] = [];

  pushToRenderQueue(object: DisplayObject) {
    this.displayObjectsLastFrame.push(object);
  }

  clearQueue() {
    this.displayObjectsLastFrame = [];
  }

  /**
   * return displayobjects in target rectangle
   */
  pickByRectangle(rect: Rectangle): DisplayObject[] {
    const targets: DisplayObject[] = [];
    let pickedColors: Uint8Array | undefined;
    let pickedFeatureIdx = -1;
    for (let i = 0; i < rect.width; i++) {
      for (let j = 0; j < rect.height; j++) {
        // avoid realloc, draw a 1x1 quad
        pickedColors = this.engine.readPixels({
          x: rect.x + i,
          y: rect.y + i,
          width: 1,
          height: 1,
          data: new Uint8Array(1 * 1 * 4),
          framebuffer: this.pickingFramebuffer,
        });

        if (
          pickedColors &&
          (pickedColors[0] !== 0 || pickedColors[1] !== 0 || pickedColors[2] !== 0)
        ) {
          pickedFeatureIdx = this.pickingIdGenerator.decodePickingColor(pickedColors);
        }

        if (pickedFeatureIdx > -1) {
          const pickedDisplayObject = this.pickingIdGenerator.getById(pickedFeatureIdx);
          if (
            pickedDisplayObject &&
            pickedDisplayObject.interactive &&
            targets.indexOf(pickedDisplayObject) === -1
          ) {
            targets.push(pickedDisplayObject);
          }
        }
      }
    }

    return targets;
  }

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
    const picking = fg.createRenderTarget(passNode, 'picking buffer', {
      width: 1,
      height: 1,
      usage: gl.RENDER_ATTACHMENT | gl.SAMPLED | gl.COPY_SRC,
    });

    pass.data = {
      output: passNode.write(fg, output),
      picking: passNode.write(fg, picking),
    };
  };

  execute = (fg: FrameGraphEngine, pass: FrameGraphPass<RenderPassData>) => {
    const resourceNode = fg.getResourceNode(pass.data.output);
    const framebuffer = this.resourcePool.getOrCreateResource(resourceNode.resource);

    const pickingResourceNode = fg.getResourceNode(pass.data.picking);
    const pickingFramebuffer = this.resourcePool.getOrCreateResource(pickingResourceNode.resource);
    this.pickingFramebuffer = pickingFramebuffer;

    const canvas = this.engine.getCanvas();
    framebuffer.resize({
      width: canvas.width,
      height: canvas.height,
    });
    pickingFramebuffer.resize({
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

        this.renderDisplayObjects(this.displayObjectsLastFrame);
      },
    );

    this.engine.useFramebuffer(
      {
        framebuffer: pickingFramebuffer,
        viewport: this.view.getViewport(),
      },
      () => {
        this.engine.clear({
          framebuffer: pickingFramebuffer,
          color: this.view.getClearColor(),
          depth: 1,
        });

        for (const object of this.displayObjectsLastFrame) {
          const material = object.getEntity().getComponent(Material3D);
          material?.setUniform(UNIFORM.PickingStage, PickingStage.ENCODE);
        }

        this.renderDisplayObjects(this.displayObjectsLastFrame);

        for (const object of this.displayObjectsLastFrame) {
          const material = object.getEntity().getComponent(Material3D);
          material?.setUniform(UNIFORM.PickingStage, PickingStage.NONE);
        }
      },
    );

    this.clearQueue();
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
      vs: this.shaderModuleService.transpile(
        material.vertexShaderGLSL,
        ShaderType.Vertex,
        this.engine.shaderLanguage,
        material.defines,
      ),
      fs: this.shaderModuleService.transpile(
        material.fragmentShaderGLSL,
        ShaderType.Fragment,
        this.engine.shaderLanguage,
        material.defines,
      ),
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
    const batchSize = (displayObject.nodeName === Batch.tag && displayObject.children.length) || 0;

    // create model(program) first
    if (!renderable3d.model) {
      renderable3d.model = this.createModel(
        {
          material,
          geometry,
        },
        batchSize,
      );
    }

    // update camera relative params
    const { width, height } = this.view.getViewport();
    material.setUniform({
      [UNIFORM.ProjectionMatrix]: this.camera.getPerspective(),
      [UNIFORM.ViewMatrix]: this.camera.getViewTransform(),
      [UNIFORM.CameraPosition]: this.camera.getPosition(),
      [UNIFORM.Viewport]: [width, height],
      [UNIFORM.DPR]: window.devicePixelRatio,
    });

    // update instance model matrix
    if (batchSize) {
      if ((displayObject as Batch).dirty) {
        const modelMatrixAttribute0 = geometry.getAttribute(ATTRIBUTE.ModelMatrix0);
        const modelMatrixAttribute1 = geometry.getAttribute(ATTRIBUTE.ModelMatrix1);
        const modelMatrixAttribute2 = geometry.getAttribute(ATTRIBUTE.ModelMatrix2);
        const modelMatrixAttribute3 = geometry.getAttribute(ATTRIBUTE.ModelMatrix3);

        const modelMatrixAttribute0Buffer: number[] = [];
        const modelMatrixAttribute1Buffer: number[] = [];
        const modelMatrixAttribute2Buffer: number[] = [];
        const modelMatrixAttribute3Buffer: number[] = [];

        const parentWorldMatrix = displayObject.getWorldTransform();

        displayObject.children.forEach((instance: DisplayObject) => {
          // don't get each child's worldTransform here, which will cause bad perf
          const m = mat4.multiply(mat4.create(), parentWorldMatrix, instance.getLocalTransform());
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

        (displayObject as Batch).dirty = false;
      }
    } else {
      const modelMatrix = displayObject.getWorldTransform();

      // set MVP matrix, other builtin uniforms @see https://threejs.org/docs/#api/en/renderers/webgl/WebGLProgram
      material.setUniform({
        [UNIFORM.ModelMatrix]: modelMatrix,
      });
    }

    // submit model
    const builder = this.modelBuilderFactory(displayObject.nodeName);
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
