import { AABB, CullingStrategy, Hierarchy, Mask, Plane, Renderable } from '@antv/g-core';
import { Cullable } from '@antv/g-core/src/components/Cullable';
import { Entity } from '@antv/g-ecs';
import { vec3 } from 'gl-matrix';
import { inject, injectable } from 'inversify';
import { Camera } from '../Camera';
import { ICamera } from '../services/renderer';

@injectable()
export class FrustumCulling implements CullingStrategy {
  @inject(Camera)
  private camera: ICamera;

  isVisible(entity: Entity) {
    const renderable = entity.getComponent(Renderable);
    const cullable = entity.getComponent(Cullable);
    const hierarchy = entity.getComponent(Hierarchy);

    const parentVisibilityPlaneMask = hierarchy?.parent?.getComponent(Cullable)?.visibilityPlaneMask;
    cullable.visibilityPlaneMask = this.computeVisibilityWithPlaneMask(
      renderable.aabb,
      parentVisibilityPlaneMask || Mask.INDETERMINATE,
      this.planes || this.camera.getFrustum().planes
    );
    cullable.visible = cullable.visibilityPlaneMask !== Mask.OUTSIDE;

    return cullable.visible;
  }

  private planes: Plane[];

  public setFrustumPlanes(planes: Plane[]) {
    this.planes = planes;
  }

  /**
   *
   * @see「Optimized View Frustum Culling Algorithms for Bounding Boxes」
   * @see https://github.com/antvis/GWebGPUEngine/issues/3
   *
   * * 基础相交测试 the basic intersection test
   * * 标记 masking @see https://cesium.com/blog/2015/08/04/fast-hierarchical-culling/
   * * TODO: 平面一致性测试 the plane-coherency test
   * * TODO: 支持 mesh 指定自身的剔除策略，参考 Babylon.js @see https://doc.babylonjs.com/how_to/optimizing_your_scene#changing-mesh-culling-strategy
   *
   * @param aabb aabb
   * @param parentPlaneMask mask of parent
   * @param planes planes of frustum
   */
  public computeVisibilityWithPlaneMask(aabb: AABB, parentPlaneMask: Mask, planes: Plane[]) {
    if (parentPlaneMask === Mask.OUTSIDE || parentPlaneMask === Mask.INSIDE) {
      // 父节点完全位于视锥内或者外部，直接返回
      return parentPlaneMask;
    }

    // Start with MASK_INSIDE (all zeros) so that after the loop, the return value can be compared with MASK_INSIDE.
    // (Because if there are fewer than 31 planes, the upper bits wont be changed.)
    let mask = Mask.INSIDE;

    for (let k = 0, len = planes.length; k < len; ++k) {
      // For k greater than 31 (since 31 is the maximum number of INSIDE/INTERSECTING bits we can store), skip the optimization.
      const flag = k < 31 ? 1 << k : 0;
      if (k < 31 && (parentPlaneMask & flag) === 0) {
        // 父节点处于当前面内部，可以跳过
        continue;
      }

      // 使用 p-vertex 和 n-vertex 加速，避免进行平面和 aabb 全部顶点的相交检测
      const { normal, distance } = planes[k];
      if (vec3.dot(normal, aabb.getNegativeFarPoint(planes[k])) + distance > 0) {
        return Mask.OUTSIDE;
      }
      if (vec3.dot(normal, aabb.getPositiveFarPoint(planes[k])) + distance > 0) {
        // 和当前面相交，对应位置为1，继续检测下一个面
        mask |= flag;
      }
    }

    return mask;
  }
}
