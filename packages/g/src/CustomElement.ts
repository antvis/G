import type { DisplayObjectConfig } from './DisplayObject';
import { DisplayObject } from './DisplayObject';
import { DISPLAY_OBJECT_EVENT } from './dom/Element';

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
  private shadowNodes: DisplayObject[] = [];

  constructor(config: DisplayObjectConfig<CustomElementStyleProps>) {
    super(config);

    this.on(DISPLAY_OBJECT_EVENT.ChildInserted, this.handleChildInserted);
    this.on(DISPLAY_OBJECT_EVENT.ChildRemoved, this.handleChildRemoved);
    if (this.attributeChangedCallback) {
      this.on(DISPLAY_OBJECT_EVENT.AttributeChanged, this.handleAttributeChanged);
    }
    if (this.connectedCallback) {
      this.on(DISPLAY_OBJECT_EVENT.Inserted, this.handleMounted);
    }
    if (this.disconnectedCallback) {
      this.on(DISPLAY_OBJECT_EVENT.Removed, this.disconnectedCallback.bind(this));
    }
  }

  private handleMounted = () => {
    this.shadowNodes.forEach((node) => {
      // every child and its children should turn into a shadow node
      // a shadow node doesn't mean to be unrenderable, it's just unsearchable in scenegraph
      node.shadow = true;
    });

    if (this.connectedCallback) {
      this.connectedCallback();
    }
  };

  private handleChildInserted = (child: DisplayObject) => {
    child.forEach((node) => {
      // append children like other shapes after mounted
      if (!this.isConnected) {
        this.shadowNodes.push(node);
      }
    });
  };

  private handleChildRemoved = (child: DisplayObject) => {
    child.forEach((node) => {
      node.shadow = false;
    });
  };

  private handleAttributeChanged = <Key extends keyof CustomElementStyleProps>(
    name: Key,
    oldValue: CustomElementStyleProps[Key],
    value: CustomElementStyleProps[Key],
  ) => {
    this.attributeChangedCallback && this.attributeChangedCallback(name, oldValue, value);
  };
}
