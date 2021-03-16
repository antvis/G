import { Entity, Matcher, System } from '@antv/g-ecs';
import { inject, injectable } from 'inversify';
import { Geometry3D } from '../components/Geometry3D';
import { Renderable3D } from '../components/Renderable3D';
import { RenderingEngine } from '../services/renderer';
import { gl } from '../services/renderer/constants';

@injectable()
export class GeometrySystem implements System {
  static tag = 's-geometry-3d';
  static trigger = new Matcher().allOf(Geometry3D);
  static priority = 1000;

  @inject(RenderingEngine)
  private readonly engine: RenderingEngine;

  public execute(entities: Entity[]) {
    entities.forEach((entity) => {
      const geometry = entity.getComponent(Geometry3D);
      const renderable = entity.getComponent(Renderable3D);
      const instancing = renderable && renderable.instances.length;

      // build buffers for each geometry
      if (geometry.dirty) {
        geometry.attributes.forEach((attribute) => {
          if (attribute.dirty && attribute.data) {
            if (!attribute.buffer) {
              attribute.buffer = this.engine.createBuffer({
                data: attribute.data,
                type: gl.FLOAT,
                usage: instancing ? gl.DYNAMIC_DRAW : gl.STATIC_DRAW,
              });
            } else {
              attribute.buffer?.subData({
                data: attribute.data,
                // TODO: support offset in subdata
                offset: 0,
              });
            }
            attribute.dirty = false;
          }
        });

        // create index buffer if needed
        if (geometry.indices) {
          if (!geometry.indicesBuffer) {
            geometry.indicesBuffer = this.engine.createElements({
              data: geometry.indices,
              count: geometry.indices.length,
              type: gl.UNSIGNED_INT,
              usage: gl.STATIC_DRAW,
            });
          } else {
            geometry.indicesBuffer.subData({
              data: geometry.indices,
              offset: 0,
            });
          }
        }

        geometry.dirty = false;
      }
    });
  }

  public tearDown(entities: Entity[]) {
    entities.forEach((entity) => {
      const geometry = entity.getComponent(Geometry3D);
      if (geometry.indicesBuffer) {
        geometry.indicesBuffer.destroy();
      }

      geometry.attributes.forEach((attribute) => {
        if (attribute.buffer) {
          attribute.buffer.destroy();
        }
      });
    });
  }

  // /**
  //  * @see https://threejs.org/docs/#api/en/core/BufferGeometry
  //  */
  // public createBufferGeometry(
  //   { vertexCount }: { vertexCount: number } = { vertexCount: 3 },
  // ) {
  //   const entity = createEntity();
  //   return this.geometry.create(entity, {
  //     vertexCount,
  //   });
  // }

  // /**
  //  * @see https://threejs.org/docs/#api/en/core/InstancedBufferGeometry
  //  */
  // public createInstancedBufferGeometry({
  //   maxInstancedCount,
  //   vertexCount,
  // }: {
  //   maxInstancedCount: number;
  //   vertexCount: number;
  // }) {
  //   const entity = createEntity();
  //   return this.geometry.create(entity, {
  //     maxInstancedCount,
  //     vertexCount,
  //   });
  // }
}
