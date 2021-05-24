import { Cullable, SceneGraphNode } from '../components';
import { mat4, vec3 } from 'gl-matrix';
import { inject, injectable } from 'inversify';
import { CullingStrategy } from './CullingPlugin';
import { AABB, Mask, Plane } from '../shapes';
import { Camera } from '../Camera';
import { CanvasConfig } from '../types';
import { DisplayObject } from '../DisplayObject';

@injectable()
export class FrustumCullingStrategy implements CullingStrategy {
  @inject(Camera)
  private camera: Camera;

  @inject(CanvasConfig)
  private canvasConfig: CanvasConfig;

  isVisible(object: DisplayObject) {
    const entity = object.getEntity();
    const cullable = entity.getComponent(Cullable);
    const hierarchy = entity.getComponent(SceneGraphNode);
    const aabb = object.getBounds();

    if (!aabb) {
      return false;
    }

    // project (0, 0)(w, h) to (-w, -h)(w, h)
    const projectedAABB = new AABB();
    projectedAABB.setMinMax(
      vec3.scaleAndAdd(
        vec3.create(),
        vec3.fromValues(-this.canvasConfig.width, -this.canvasConfig.height, 0),
        aabb.getMin(),
        2
      ),
      vec3.scaleAndAdd(
        vec3.create(),
        vec3.fromValues(-this.canvasConfig.width, -this.canvasConfig.height, 0),
        aabb.getMax(),
        2
      )
    );

    // get VP matrix from camera
    const viewMatrix = this.camera.getViewTransform()!;
    const viewProjectionMatrix = mat4.multiply(mat4.create(), this.camera.getPerspective(), viewMatrix);
    this.camera.getFrustum().extractFromVPMatrix(viewProjectionMatrix);

    const parentVisibilityPlaneMask = hierarchy?.parent?.getComponent(Cullable)?.visibilityPlaneMask;
    cullable.visibilityPlaneMask = this.computeVisibilityWithPlaneMask(
      projectedAABB,
      parentVisibilityPlaneMask || Mask.INDETERMINATE,
      this.camera.getFrustum().planes
    );

    cullable.visible = cullable.visibilityPlaneMask !== Mask.OUTSIDE;

    return cullable.visible;
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
  private computeVisibilityWithPlaneMask(aabb: AABB, parentPlaneMask: Mask, planes: Plane[]) {
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
