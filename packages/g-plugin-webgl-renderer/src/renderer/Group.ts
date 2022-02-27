import { DisplayObject, SHAPE } from '@antv/g';
import { injectable } from 'mana-syringe';
import { Batch } from './Batch';
import { ShapeRenderer } from '../tokens';
// import { BatchMesh } from '../meshes/Instanced';

// @injectable({
//   token: [{ token: ShapeMesh, named: SHAPE.Group }],
// })
// export class GroupBatchMesh extends BatchMesh {
//   protected createMaterial(objects: DisplayObject[]): void {}
//   protected createGeometry(objects: DisplayObject[]): void {}

//   protected updateMeshAttribute(object: DisplayObject, index: number, name: string, value: any) {}
// }

@injectable({
  token: [{ token: ShapeRenderer, named: SHAPE.Group }],
})
export class GroupRenderer extends Batch {
  meshes = [];

  shouldSubmitRenderInst(object: DisplayObject, index: number) {
    return true;
  }
}
