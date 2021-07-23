import { SceneGraphNode } from './components';
import type { DisplayObjectConfig } from './DisplayObject';
import { DisplayObject, DISPLAY_OBJECT_EVENT } from './DisplayObject';

/**
 * shadow root
 * @see https://yuque.antfin-inc.com/antv/czqvg5/pgqipg
 */
export abstract class CustomElement<
  CustomElementStyleProps,
> extends DisplayObject<CustomElementStyleProps> {
  constructor(config: DisplayObjectConfig<CustomElementStyleProps>) {
    super(config);

    this.on(DISPLAY_OBJECT_EVENT.ChildInserted, this.handleChildInserted);
    this.on(DISPLAY_OBJECT_EVENT.ChildRemoved, this.handleChildRemoved);
    this.on(DISPLAY_OBJECT_EVENT.AttributeChanged, this.handleAttributeChanged);
    this.on(DISPLAY_OBJECT_EVENT.Inserted, this.connectedCallback);
    this.on(DISPLAY_OBJECT_EVENT.Removed, this.disconnectedCallback);
  }

  /**
   * fired after element insert into DOM tree
   */
  abstract connectedCallback(): void;

  /**
   * fired before element removed from DOM tree
   */
  abstract disconnectedCallback(): void;

  abstract attributeChangedCallback<Key extends keyof CustomElementStyleProps>(
    name: Key,
    oldValue: CustomElementStyleProps[Key],
    newValue: CustomElementStyleProps[Key],
  ): void;

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

  private handleAttributeChanged<Key extends keyof CustomElementStyleProps>(
    name: Key,
    oldValue: CustomElementStyleProps[Key],
    value: CustomElementStyleProps[Key],
  ) {
    this.attributeChangedCallback(name, oldValue, value);
  }

  abstract render(): DisplayObject;
}
