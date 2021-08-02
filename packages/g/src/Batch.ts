import { Geometry, Renderable, SceneGraphNode, Cullable } from './components';
import { CustomElement } from './CustomElement';
import { DisplayObject, DisplayObjectConfig, DISPLAY_OBJECT_EVENT } from './DisplayObject';
import { BaseStyleProps, SHAPE } from './types';

export interface BatchStyleProps<T> extends BaseStyleProps {
  instances: DisplayObject<T>[];
}
/**
 * A container for multiple display objects with the same `style`,
 * eg. 1000 Circles with the same stroke color, but their position, radius can be different
 *
 * @see https://developer.playcanvas.com/en/user-manual/optimization/batching/
 */
export class Batch<T> extends CustomElement<BatchStyleProps<T>> {
  static tag = 'batch';

  private batchType?: SHAPE;

  /**
   * need to reconstruct batch
   */
  dirty = true;

  constructor({ style = { instances: [] }, ...rest }: DisplayObjectConfig<BatchStyleProps<T>>) {
    super({
      // @ts-ignore
      type: Batch.tag,
      style,
      ...rest,
    });

    this.getEntity().getComponent(Cullable).enable = false;

    if (style.instances) {
      style.instances.forEach((instance: DisplayObject<T>) => {
        this.appendChild(instance);
      });
    }
  }

  getBatchType() {
    return this.batchType;
  }

  appendChild(child: DisplayObject<T>) {
    if (!this.batchType) {
      this.batchType = child.nodeName;
    }

    super.appendChild(child);

    child.getEntity().getComponent(Renderable).instanced = true;

    const renderable = this.getEntity().getComponent(Renderable);
    renderable.aabbDirty = true;
    renderable.dirty = true;

    this.dirty = true;

    return child;
  }

  removeChild(child: DisplayObject<T>) {
    super.removeChild(child);

    child.getEntity().getComponent(Renderable).instanced = false;

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
