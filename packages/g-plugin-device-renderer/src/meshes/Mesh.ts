import { injectable } from 'mana-syringe';
import type { DisplayObject } from '@antv/g';
import { Mesh } from '../Mesh';
import { Instanced } from './Instanced';

@injectable()
export class MeshMesh extends Instanced {
  shouldMerge(object: DisplayObject, index: number) {
    const shouldMerge = super.shouldMerge(object, index);

    if (!shouldMerge) {
      return false;
    }

    if (this.instance.nodeName === Mesh.tag) {
      if (
        this.instance.parsedStyle.material !== object.parsedStyle.material ||
        this.instance.parsedStyle.geometry !== object.parsedStyle.geometry
      ) {
        return false;
      }
    }

    return true;
  }

  updateAttribute(objects: DisplayObject[], startIndex: number, name: string, value: any): void {
    super.updateAttribute(objects, startIndex, name, value);
    this.updateBatchedAttribute(objects, startIndex, name, value);
  }

  createMaterial(objects: DisplayObject[]): void {
    const { material } = (this.instance as Mesh).parsedStyle;
    this.material = material;
  }

  createGeometry(objects: DisplayObject[]): void {
    const { geometry } = (this.instance as Mesh).parsedStyle;
    this.geometry = geometry;

    // use default common attributes
    super.createGeometry(objects);

    this.geometry.build(objects as Mesh[]);
  }
}
