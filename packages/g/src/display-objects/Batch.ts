import { Renderable, Cullable } from '../components';
import { CustomElement } from './CustomElement';
import type { INode, DisplayObjectConfig, BaseStyleProps } from '..';

export interface BatchStyleProps extends BaseStyleProps {
  instances: this[];
}
/**
 * A container for multiple display objects with the same `style`,
 * eg. 1000 Circles with the same stroke color, but their position, radius can be different
 *
 * @see https://developer.playcanvas.com/en/user-manual/optimization/batching/
 */
export class Batch extends CustomElement<BatchStyleProps> {
  static tag = 'batch';

  private batchType?: string;

  /**
   * need to reconstruct batch
   */
  dirty = true;

  constructor({ style = { instances: [] }, ...rest }: DisplayObjectConfig<BatchStyleProps>) {
    super({
      // @ts-ignore
      type: Batch.tag,
      style,
      ...rest,
    });

    this.getEntity().getComponent(Cullable).enable = false;

    if (style.instances) {
      style.instances.forEach((instance) => {
        // @ts-ignore
        this.appendChild(instance);
      });
    }
  }

  getBatchType() {
    return this.batchType;
  }

  appendChild<T extends INode>(child: T): T {
    if (!this.batchType) {
      this.batchType = child.nodeName;
    }

    super.appendChild(child);

    child.getEntity().getComponent(Renderable).instanced = true;

    const renderable = this.getEntity().getComponent(Renderable);
    renderable.boundsDirty = true;
    renderable.dirty = true;

    this.dirty = true;

    return child;
  }

  removeChild<T extends INode>(child: T): T {
    super.removeChild(child);

    child.getEntity().getComponent(Renderable).instanced = false;

    const renderable = this.getEntity().getComponent(Renderable);
    renderable.boundsDirty = true;
    renderable.dirty = true;

    this.dirty = true;

    return child;
  }

  attributeChangedCallback(name: string, value: any): void {
    throw new Error('Method not implemented.');
  }
}
