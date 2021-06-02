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
export class Batch extends DisplayObject {
  static tag = 'batch';

  private batchType?: SHAPE;

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
        this.addInstance(instance);
      });
    }

    this.on(DISPLAY_OBJECT_EVENT.AttributeChanged, this.attributeChangedCallback);
  }

  getBatchType() {
    return this.batchType;
  }

  addInstance(child: DisplayObject) {
    if (!this.batchType) {
      this.batchType = child.nodeType;
    }

    // merge child's aabb
    const geometry = this.getEntity().getComponent(Geometry);
    geometry.aabb.add(child.getBounds()!);

    // change child into a "shadow node"
    const childSceneGraphNode = child.getEntity().getComponent(SceneGraphNode);
    childSceneGraphNode.shadow = true;

    if (!this.attributes.instances) {
      this.attributes.instances = [];
    }
    this.attributes.instances.push(child);

    return child;
  }

  private attributeChangedCallback(name: string, value: string) {
    if (name === 'instances') {
      // TODO:
    }
  }

  // TODO:
  // removeChild() {

  // }
}
