import { ContextService, DefaultShapeRenderer, Renderable, SHAPE, ShapeCfg, Transform } from '@antv/g-core';
import { Entity } from '@antv/g-ecs';
import { mat4 } from 'gl-matrix';
import { inject, injectable } from 'inversify';
import { Geometry3D } from '../components/Geometry3D';
import { IUniformBinding, Material3D } from '../components/Material3D';
import { Renderable3D, INSTANCING_STATUS } from '../components/Renderable3D';
import { IAttribute, IModelInitializationOptions, IUniform, RenderingEngine } from '../services/renderer';
import { RenderingContext } from '../services/WebGLContextService';

const ATTRIBUTE = {
  ModelMatrix0: 'a_ModelMatrix0',
  ModelMatrix1: 'a_ModelMatrix1',
  ModelMatrix2: 'a_ModelMatrix2',
  ModelMatrix3: 'a_ModelMatrix3',
};

const UNIFORM = {
  ProjectionMatrix: 'u_ProjectionMatrix',
  ModelViewMatrix: 'u_ModelViewMatrix',
  ModelMatrix: 'u_ModelMatrix',
  ViewMatrix: 'u_ViewMatrix',
  CameraPosition: 'u_CameraPosition',
  Viewport: 'u_Viewport',
  DPR: 'u_DevicePixelRatio',
  Opacity: 'u_Opacity',
};

const STYLE = {
  Opacity: 'opacity',
};

@injectable()
export abstract class BaseRenderer extends DefaultShapeRenderer {
  @inject(ContextService)
  protected contextService: ContextService<RenderingContext>;

  @inject(RenderingEngine)
  private readonly engine: RenderingEngine;

  protected buildModel(entity: Entity): Promise<void> | void {
    const renderable = entity.getComponent(Renderable);
    const material = entity.getComponent(Material3D);
    material.setUniform(UNIFORM.Opacity, renderable.attrs?.opacity || 1);
  }

  onAttributeChanged(entity: Entity, name: string, value: any) {
    super.onAttributeChanged(entity, name, value);

    if (name === STYLE.Opacity) {
      const material = entity.getComponent(Material3D);
      material.setUniform(UNIFORM.Opacity, value);
    }
  }

  init(entity: Entity, type: SHAPE, cfg: ShapeCfg, instanceEntity?: Entity) {
    super.init(entity, type, cfg);

    entity.addComponent(Renderable3D);

    const subRenderable = entity.getComponent(Renderable3D);

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
    } else {
      // add geometry & material required by Renderable3D
      entity.addComponent(Geometry3D);
      entity.addComponent(Material3D);
      this.buildModel(entity);
    }
  }

  async render(entity: Entity) {
    const renderable3d = entity.getComponent(Renderable3D);
    const rootRenderable = renderable3d.source;
    const rootEntity = renderable3d.sourceEntity;

    if (rootRenderable) {
      if (rootRenderable.instanceDirty) {
        // destroy the dirty model
        rootRenderable.model?.destroy();
        rootRenderable.model = null;

        // rebuild model
        this.buildModel(rootEntity);

        // create model matrix decomposed into 4 vec4 instead of mat4
        const geometry = rootEntity.getComponent(Geometry3D);
        this.createModelMatrixAttributes({
          geometry,
          count: rootRenderable.instances.length,
        });

        // switch to instancing mode
        const material = rootEntity.getComponent(Material3D);
        material.setDefines({
          INSTANCING: 1,
        });

        rootRenderable.instanceDirty = false;
      }

      // skip if current batch is rendering, make sure every batch get rendererd once per frame
      if (rootRenderable.status === INSTANCING_STATUS.Rendering) {
        return;
      }

      // render root renderable instead
      rootRenderable.status = INSTANCING_STATUS.Rendering;
      await this.renderEntity(rootEntity);
    } else {
      await this.renderEntity(entity);
    }
  }

  private async createModel({ material, geometry }: { material: Material3D; geometry: Geometry3D }) {
    const { createModel, createAttribute } = this.engine;

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

    return createModel(modelInitializationOptions);
  }

  private async renderEntity(entity: Entity) {
    const renderable3d = entity.getComponent(Renderable3D);
    const material = entity.getComponent(Material3D);
    const geometry = entity.getComponent(Geometry3D);
    const transform = entity.getComponent(Transform);
    const instancing = renderable3d.instanceEntities.length > 0;

    // waiting for dirty geometry updated
    if (geometry.dirty || material.dirty) {
      return;
    }

    if (!renderable3d.model) {
      renderable3d.model = await this.createModel({
        material,
        geometry,
      });
    }

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

      const modelViewMatrix = mat4.multiply(mat4.create(), viewMatrix, transform.worldTransform);

      // set MVP matrix, other builtin uniforms @see https://threejs.org/docs/#api/en/renderers/webgl/WebGLProgram
      material.setUniform({
        [UNIFORM.ProjectionMatrix]: camera.getPerspective(),
        [UNIFORM.ModelViewMatrix]: modelViewMatrix,
        [UNIFORM.ModelMatrix]: transform.worldTransform,
        [UNIFORM.ViewMatrix]: viewMatrix,
        [UNIFORM.CameraPosition]: camera.getPosition(),
        [UNIFORM.Viewport]: [width, height],
        [UNIFORM.DPR]: window.devicePixelRatio,
      });

      if (renderable3d.model) {
        // update instance model matrix
        // TODO: add dirty flag
        if (instancing) {
          const modelMatrixAttribute0 = geometry.getAttribute(ATTRIBUTE.ModelMatrix0);
          const modelMatrixAttribute1 = geometry.getAttribute(ATTRIBUTE.ModelMatrix1);
          const modelMatrixAttribute2 = geometry.getAttribute(ATTRIBUTE.ModelMatrix2);
          const modelMatrixAttribute3 = geometry.getAttribute(ATTRIBUTE.ModelMatrix3);
          renderable3d.instanceEntities.forEach((subEntity, i) => {
            const m = subEntity.getComponent(Transform).worldTransform;

            modelMatrixAttribute0?.buffer?.subData({
              data: [m[0], m[1], m[2], m[3]],
              offset: i * Float32Array.BYTES_PER_ELEMENT * 4,
            });
            modelMatrixAttribute1?.buffer?.subData({
              data: [m[4], m[5], m[6], m[7]],
              offset: i * Float32Array.BYTES_PER_ELEMENT * 4,
            });
            modelMatrixAttribute2?.buffer?.subData({
              data: [m[8], m[9], m[10], m[11]],
              offset: i * Float32Array.BYTES_PER_ELEMENT * 4,
            });
            modelMatrixAttribute3?.buffer?.subData({
              data: [m[12], m[13], m[14], m[15]],
              offset: i * Float32Array.BYTES_PER_ELEMENT * 4,
            });
          });
        }

        renderable3d.model.draw({
          uniforms: material.uniforms.reduce((cur: { [key: string]: IUniform }, prev: IUniformBinding) => {
            cur[prev.name] = prev.data;
            return cur;
          }, {}),
        });
      }
    }
  }

  /**
   * we should decompose mat4 into 4 vec4 like Babylon.js
   * @see https://github.com/mrdoob/three.js/issues/16140
   * relative bug in regl:
   * @see https://github.com/regl-project/regl/issues/597
   */
  private createModelMatrixAttributes({ geometry, count }: { geometry: Geometry3D; count: number }) {
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
