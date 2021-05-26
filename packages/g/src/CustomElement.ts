import { Geometry, SceneGraphNode } from './components';
import { DisplayObject, DISPLAY_OBJECT_EVENT } from './DisplayObject';
import { SHAPE, ShapeCfg } from './types';

/**
 * shadow root
 * @see https://yuque.antfin-inc.com/antv/czqvg5/pgqipg
 */
export abstract class CustomElement extends DisplayObject {
  constructor(config: ShapeCfg) {
    super(config);

    this.on(DISPLAY_OBJECT_EVENT.ChildInserted, this.handleChildInserted);
    this.on(DISPLAY_OBJECT_EVENT.AttributeChanged, this.handleAttributeChanged);
  }

  abstract attributeChangedCallback(name: string, value: any): void;

  private handleChildInserted(child: DisplayObject) {
    // its child should turn into a shadow node
    // a shadow node doesn't mean to be unrenderable, it's just unsearchable in scenegraph
    child.getEntity().getComponent(SceneGraphNode).shadow = true;

    // merge all children's AABBs
    // this.getEntity().getComponent(Geometry).aabb.add(child.getEntity().getComponent(Geometry).aabb);
  }

  private handleAttributeChanged(displayObject: DisplayObject, name: string, value: any) {
    this.attributeChangedCallback(name, value);
  }
}
