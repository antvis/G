import { DisplayObject } from './DisplayObject';
import type { DisplayObjectConfig } from '../dom/interfaces';
import { ElementEvent } from '../dom/interfaces';
import type { FederatedEvent } from '../dom/FederatedEvent';

// @see https://stackoverflow.com/questions/44153378/typescript-abstract-optional-method
export interface CustomElement<CustomElementStyleProps> {
  /**
   * fired after element insert into DOM tree
   */
  connectedCallback?: () => void;

  /**
   * fired before element removed from DOM tree
   */
  disconnectedCallback?: () => void;

  attributeChangedCallback?: <Key extends keyof CustomElementStyleProps>(
    name: Key,
    oldValue: CustomElementStyleProps[Key],
    newValue: CustomElementStyleProps[Key],
  ) => void;
}

/**
 * shadow root
 * @see https://yuque.antfin-inc.com/antv/czqvg5/pgqipg
 */
export abstract class CustomElement<
  CustomElementStyleProps,
> extends DisplayObject<CustomElementStyleProps> {
  // private shadowNodes: DisplayObject[] = [];

  constructor(config: DisplayObjectConfig<CustomElementStyleProps>) {
    super(config);

    // this.addEventListener(ElementEvent.CHILD_INSERTED, this.handleChildInserted);
    // this.addEventListener(ElementEvent.CHILD_REMOVED, this.handleChildRemoved);
    if (this.attributeChangedCallback) {
      this.addEventListener(ElementEvent.ATTRIBUTE_CHANGED, this.handleAttributeChanged);
    }
    if (this.connectedCallback) {
      this.addEventListener(ElementEvent.INSERTED, this.handleMounted);
    }
    if (this.disconnectedCallback) {
      this.addEventListener(ElementEvent.REMOVED, this.disconnectedCallback.bind(this));
    }
  }

  private handleMounted = () => {
    // this.shadowNodes.forEach((node) => {
    //   // every child and its children should turn into a shadow node
    //   // a shadow node doesn't mean to be unrenderable, it's just unsearchable in scenegraph
    //   node.shadow = true;
    // });

    if (this.connectedCallback) {
      this.connectedCallback();
    }
  };

  // private handleChildInserted = (e: FederatedEvent) => {
  //   (e.target as DisplayObject).forEach((node) => {
  //     // append children like other shapes after mounted
  //     if (!this.isConnected) {
  //       this.shadowNodes.push(node as DisplayObject);
  //     }
  //   });
  // };

  // private handleChildRemoved = (e: FederatedEvent) => {
  //   (e.target as DisplayObject).forEach((node) => {
  //     node.shadow = false;
  //   });
  // };

  private handleAttributeChanged = <Key extends keyof CustomElementStyleProps>(
    e: FederatedEvent<
      Event,
      {
        attributeName: Key;
        oldValue: CustomElementStyleProps[Key];
        newValue: CustomElementStyleProps[Key];
      }
    >,
  ) => {
    // only listen itself
    // RangeError: Maximum call stack size exceeded
    if (e.target !== this) {
      return;
    }

    const { attributeName, oldValue, newValue } = e.detail;
    if (this.attributeChangedCallback) {
      this.attributeChangedCallback(attributeName, oldValue, newValue);
    }
  };
}
