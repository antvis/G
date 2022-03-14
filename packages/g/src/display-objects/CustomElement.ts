import { DisplayObject } from './DisplayObject';
import type { DisplayObjectConfig } from '../dom/interfaces';
import { ElementEvent } from '../dom/interfaces';
import type { FederatedEvent } from '../dom/FederatedEvent';
import type { BaseStyleProps } from '../types';
import type { MutationEvent } from '../dom/MutationEvent';

/**
 * shadow root
 * @see https://yuque.antfin-inc.com/antv/czqvg5/pgqipg
 */
export abstract class CustomElement<
  CustomElementStyleProps extends BaseStyleProps,
> extends DisplayObject<CustomElementStyleProps> {
  // private shadowNodes: DisplayObject[] = [];

  constructor(config: DisplayObjectConfig<CustomElementStyleProps> = {}) {
    super(config);

    // this.addEventListener(ElementEvent.CHILD_INSERTED, this.handleChildInserted);
    // this.addEventListener(ElementEvent.CHILD_REMOVED, this.handleChildRemoved);
    if (this.attributeChangedCallback) {
      this.addEventListener(ElementEvent.ATTR_MODIFIED, this.handleAttributeChanged);
    }
    if (this.connectedCallback) {
      this.addEventListener(ElementEvent.MOUNTED, this.handleMounted);
    }
    if (this.disconnectedCallback) {
      this.addEventListener(ElementEvent.UNMOUNTED, this.handleUnmounted);
    }
  }

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

  private handleMounted = (e: FederatedEvent) => {
    if (e.target === e.currentTarget) {
      // this.shadowNodes.forEach((node) => {
      //   // every child and its children should turn into a shadow node
      //   // a shadow node doesn't mean to be unrenderable, it's just unsearchable in scenegraph
      //   node.shadow = true;
      // });

      if (this.connectedCallback) {
        this.connectedCallback();
      }
    }
  };

  private handleUnmounted = (e: FederatedEvent) => {
    if (e.target === e.currentTarget) {
      if (this.disconnectedCallback) {
        this.disconnectedCallback();
      }
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
    e: MutationEvent,
  ) => {
    // only listen itself
    // RangeError: Maximum call stack size exceeded
    if (e.target !== this) {
      return;
    }

    const { attrName, prevValue, newValue } = e;
    if (this.attributeChangedCallback) {
      this.attributeChangedCallback(attrName as Key, prevValue, newValue);
    }
  };
}
