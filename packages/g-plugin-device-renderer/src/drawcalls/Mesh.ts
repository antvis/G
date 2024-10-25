import type { DisplayObject } from '@antv/g-lite';
import { Shape } from '@antv/g-lite';
import type { Mesh } from '../Mesh';
import { Instanced } from './Instanced';

export class MeshDrawcall extends Instanced {
  protected mergeXYZIntoModelMatrix = false;

  shouldMerge(object: DisplayObject, index: number) {
    const shouldMerge = super.shouldMerge(object, index);

    if (!shouldMerge) {
      return false;
    }

    if (this.instance.nodeName === Shape.MESH) {
      if (
        this.instance.attributes.material !== object.attributes.material ||
        this.instance.attributes.geometry !== object.attributes.geometry
      ) {
        return false;
      }
    }

    return true;
  }

  updateAttribute(
    objects: DisplayObject[],
    startIndex: number,
    name: string,
    value: any,
  ): void {
    if (objects.length === 0) {
      return;
    }

    super.updateAttribute(objects, startIndex, name, value);
    this.updateBatchedAttribute(objects, startIndex, name, value);
  }

  createMaterial(objects: DisplayObject[]): void {
    const { material } = (this.instance as Mesh).attributes;
    this.material = material;
    this.observeMaterialChanged();
  }

  createGeometry(objects: DisplayObject[]): void {
    const { geometry } = (this.instance as Mesh).attributes;
    this.geometry = geometry;

    // use default common attributes
    super.createGeometry(objects);

    this.geometry.build(objects as Mesh[]);

    // TODO: clear dirty listener
    this.observeGeometryChanged();
  }
}
