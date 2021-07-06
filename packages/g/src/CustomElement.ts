import { Geometry, SceneGraphNode } from './components';
import { DisplayObject, DISPLAY_OBJECT_EVENT } from './DisplayObject';
import { ShapeCfg } from './types';

/**
 * shadow root
 * @see https://yuque.antfin-inc.com/antv/czqvg5/pgqipg
 */
export abstract class CustomElement extends DisplayObject {
  constructor(config: ShapeCfg) {
    super(config);

    this.on(DISPLAY_OBJECT_EVENT.ChildInserted, this.handleChildInserted);
    this.on(DISPLAY_OBJECT_EVENT.ChildRemoved, this.handleChildRemoved);
    this.on(DISPLAY_OBJECT_EVENT.AttributeChanged, this.handleAttributeChanged);
  }

  abstract attributeChangedCallback(name: string, value: any): void;

  private handleChildInserted(child: DisplayObject) {
    child.forEach((node) => {
      // every child and its children should turn into a shadow node
      // a shadow node doesn't mean to be unrenderable, it's just unsearchable in scenegraph
      node.getEntity().getComponent(SceneGraphNode).shadow = true;
    });
  }

  private handleChildRemoved(child: DisplayObject) {
    child.forEach((node) => {
      node.getEntity().getComponent(SceneGraphNode).shadow = false;
    });
  }

  private handleAttributeChanged(name: string, value: any, displayObject: DisplayObject) {
    this.attributeChangedCallback(name, value);
  }
}
