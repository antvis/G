import { injectable } from 'mana-syringe';
import { DisplayObject } from '@antv/g';
import { Batch } from './Batch';
import { ShapeMesh, ShapeRenderer } from '../tokens';
import { Mesh } from '../Mesh';
import { BatchMesh } from './BatchMesh';

@injectable({
  token: [{ token: ShapeMesh, named: Mesh.tag }],
})
export class MeshBatchMesh extends BatchMesh {
  protected updateMeshAttribute(
    object: DisplayObject<any, any>,
    index: number,
    name: string,
    value: any,
  ): void {
    this.updateBatchedAttribute(object, index, name, value);
  }

  protected createMaterial(objects: DisplayObject[]): void {
    const instance = objects[0] as Mesh;
    const { material } = instance.parsedStyle;
    this.material = material;
  }

  protected createGeometry(objects: DisplayObject[]): void {
    const instance = objects[0] as Mesh;
    const { geometry } = instance.parsedStyle;
    this.geometry = geometry;

    // use default common attributes
    this.createBatchedGeometry(objects);

    this.geometry.build(objects as Mesh[]);
  }
}

@injectable({
  token: [{ token: ShapeRenderer, named: Mesh.tag }],
})
export class MeshRenderer extends Batch {
  protected createBatchMeshList(): void {
    this.batchMeshList.push(this.meshFactory(Mesh.tag));
  }

  protected validate(object: Mesh): boolean {
    if (this.instance.nodeName === Mesh.tag) {
      // Material 必须为同一个，Geometry 类型必须相同，例如同为 CubeGeometry
      if (
        this.instance.parsedStyle.material !== object.parsedStyle.material ||
        this.instance.parsedStyle.geometry !== object.parsedStyle.geometry
      ) {
        return false;
      }
    }

    return true;
  }
}
