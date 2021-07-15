import { Geometry, Renderable, SceneGraphNode } from './components';
import { CustomElement } from './CustomElement';
import { DisplayObject, DISPLAY_OBJECT_EVENT } from './DisplayObject';
import { AABB } from './shapes';
import { SHAPE, ShapeCfg } from './types';

/**
 * A container for multiple display objects with the same `style`,
 * eg. 1000 Circles with the same stroke color, but their position, radius can be different
 *
 * @see https://developer.playcanvas.com/en/user-manual/optimization/batching/
 */
export class Batch extends CustomElement {
  static tag = 'batch';

  private batchType?: SHAPE;

  /**
   * need to reconstruct batch
   */
  private dirty = true;

  constructor({ attrs = {}, ...rest }: ShapeCfg) {
    super({
      type: Batch.tag,
      attrs: {
        ...attrs,
      },
      ...rest,
    });

    if (attrs.instances) {
      attrs.instances.forEach((instance: DisplayObject) => {
        this.appendChild(instance);
      });
    }
  }

  getBatchType() {
    return this.batchType;
  }

  appendChild(child: DisplayObject) {
    if (!this.batchType) {
      this.batchType = child.nodeType;
    }

    super.appendChild(child);

    const renderable = this.getEntity().getComponent(Renderable);
    renderable.aabbDirty = true;
    renderable.dirty = true;

    this.dirty = true;

    return child;
  }

  removeChild(child: DisplayObject) {
    super.removeChild(child);

    const renderable = this.getEntity().getComponent(Renderable);
    renderable.aabbDirty = true;
    renderable.dirty = true;

    this.dirty = true;

    return child;
  }

  attributeChangedCallback(name: string, value: any): void {
    throw new Error('Method not implemented.');
  }
}
