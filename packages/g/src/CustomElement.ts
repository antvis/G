import { SceneGraphNode } from './components';
import type { DisplayObjectConfig } from './DisplayObject';
import { DisplayObject, DISPLAY_OBJECT_EVENT } from './DisplayObject';

// @see https://stackoverflow.com/questions/44153378/typescript-abstract-optional-method
export interface CustomElement<CustomElementStyleProps> {
  /**
   * fired after element insert into DOM tree
   */
  connectedCallback?(): void;

  /**
   * fired before element removed from DOM tree
   */
  disconnectedCallback?(): void;

  attributeChangedCallback?<Key extends keyof CustomElementStyleProps>(
    name: Key,
    oldValue: CustomElementStyleProps[Key],
    newValue: CustomElementStyleProps[Key],
  ): void;
}

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
    if (this.attributeChangedCallback) {
      this.on(DISPLAY_OBJECT_EVENT.AttributeChanged, this.handleAttributeChanged);
    }
    if (this.connectedCallback) {
      this.on(DISPLAY_OBJECT_EVENT.Inserted, this.connectedCallback.bind(this));
    }
    if (this.disconnectedCallback) {
      this.on(DISPLAY_OBJECT_EVENT.Removed, this.disconnectedCallback.bind(this));
    }
  }

  private handleChildInserted = (child: DisplayObject) => {
    child.forEach((node) => {
      // append children like other shapes after mounted
      if (!this.isConnected) {
        // every child and its children should turn into a shadow node
        // a shadow node doesn't mean to be unrenderable, it's just unsearchable in scenegraph
        node.getEntity().getComponent(SceneGraphNode).shadow = true;
      }
    });
  };

  private handleChildRemoved = (child: DisplayObject) => {
    child.forEach((node) => {
      node.getEntity().getComponent(SceneGraphNode).shadow = false;
    });
  };

  private handleAttributeChanged = <Key extends keyof CustomElementStyleProps>(
    name: Key,
    oldValue: CustomElementStyleProps[Key],
    value: CustomElementStyleProps[Key],
  ) => {
    this.attributeChangedCallback
      && this.attributeChangedCallback(name, oldValue, value);
  };
}
