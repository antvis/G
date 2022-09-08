import type { DisplayObject } from '@antv/g';
import { injectable, Shape } from '@antv/g';
import { ShapeRenderer } from '../tokens';
import { Batch } from './Batch';
// import { BatchMesh } from '../meshes/Instanced';

// @injectable({
//   token: [{ token: ShapeMesh, named: Shape.GROUP }],
// })
// export class GroupBatchMesh extends BatchMesh {
//   protected createMaterial(objects: DisplayObject[]): void {}
//   protected createGeometry(objects: DisplayObject[]): void {}

//   protected updateMeshAttribute(object: DisplayObject, index: number, name: string, value: any) {}
// }

@injectable({
  token: [{ token: ShapeRenderer, named: Shape.GROUP }],
})
export class GroupRenderer extends Batch {
  meshes = [];

  shouldSubmitRenderInst(object: DisplayObject, index: number) {
    return true;
  }
}
