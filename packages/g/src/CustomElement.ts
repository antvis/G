import { SceneGraphNode } from './components';
import { DisplayObject, DisplayObjectConfig, DISPLAY_OBJECT_EVENT } from './DisplayObject';

/**
 * shadow root
 * @see https://yuque.antfin-inc.com/antv/czqvg5/pgqipg
 */
export abstract class CustomElement<CustomElementStyleProps> extends DisplayObject<CustomElementStyleProps> {
  constructor(config: DisplayObjectConfig<CustomElementStyleProps>) {
    super(config);

    this.on(DISPLAY_OBJECT_EVENT.ChildInserted, this.handleChildInserted);
    this.on(DISPLAY_OBJECT_EVENT.ChildRemoved, this.handleChildRemoved);
    this.on(DISPLAY_OBJECT_EVENT.AttributeChanged, this.handleAttributeChanged);
  }

  abstract attributeChangedCallback(name: string, value: any): void;

  private handleChildInserted(child: DisplayObject<any>) {
    child.forEach((node) => {
      // every child and its children should turn into a shadow node
      // a shadow node doesn't mean to be unrenderable, it's just unsearchable in scenegraph
      node.getEntity().getComponent(SceneGraphNode).shadow = true;
    });
  }

  private handleChildRemoved(child: DisplayObject<any>) {
    child.forEach((node) => {
      node.getEntity().getComponent(SceneGraphNode).shadow = false;
    });
  }

  private handleAttributeChanged(name: string, value: any, displayObject: DisplayObject<any>) {
    this.attributeChangedCallback(name, value);
  }
}
