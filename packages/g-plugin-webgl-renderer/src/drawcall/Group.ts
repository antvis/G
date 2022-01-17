import { DisplayObject, SHAPE } from '@antv/g';
import { injectable } from 'mana-syringe';
import { Batch } from './Batch';
import { ShapeRenderer, ShapeMesh } from '../tokens';
import { BatchMesh } from './BatchMesh';

@injectable({
  token: [{ token: ShapeMesh, named: SHAPE.Group }],
})
export class GroupBatchMesh extends BatchMesh {
  protected createMaterial(objects: DisplayObject[]): void {}
  protected createGeometry(objects: DisplayObject[]): void {}

  protected updateMeshAttribute(object: DisplayObject, index: number, name: string, value: any) {}
}

@injectable({
  token: [{ token: ShapeRenderer, named: SHAPE.Group }],
})
export class GroupRenderer extends Batch {
  protected validate() {
    return true;
  }

  protected createBatchMeshList() {}
}
