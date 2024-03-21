import type { DisplayObjectConfig } from '../dom';
import { runtime } from '../global-runtime';
import type { BaseStyleProps } from '../types';
import { DisplayObject } from './DisplayObject';
export interface BaseCustomElementStyleProps extends BaseStyleProps {}

/**
 * shadow root
 * @see https://yuque.antfin-inc.com/antv/czqvg5/pgqipg
 */
export abstract class CustomElement<
  CustomElementStyleProps,
> extends DisplayObject<CustomElementStyleProps & BaseCustomElementStyleProps> {
  // static get observedAttributes(): string[] {
  //   return [];
  // }

  isCustomElement = true;

  // private shadowNodes: DisplayObject[] = [];

  constructor({
    style,
    ...rest
  }: DisplayObjectConfig<CustomElementStyleProps> = {}) {
    super({
      style: runtime.enableCSSParsing
        ? {
            ...style,
          }
        : {
            ...style,
          },
      ...rest,
    });
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
    oldParsedValue?: any,
    newParsedValue?: any,
  ): void;

  // private handleMounted = (e: FederatedEvent) => {
  //   if (e.target === this) {
  //     // this.shadowNodes.forEach((node) => {
  //     //   // every child and its children should turn into a shadow node
  //     //   // a shadow node doesn't mean to be unrenderable, it's just unsearchable in scenegraph
  //     //   node.shadow = true;
  //     // });

  //     if (this.connectedCallback) {
  //       this.connectedCallback();
  //     }
  //   }
  // };

  // private handleUnmounted = (e: FederatedEvent) => {
  //   if (e.target === this) {

  //   }
  // };

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

  // private handleAttributeChanged = <Key extends keyof CustomElementStyleProps>(
  //   e: MutationEvent,
  // ) => {
  //   // only listen itself
  //   // RangeError: Maximum call stack size exceeded
  //   if (e.target !== this) {
  //     return;
  //   }

  //   const { attrName, prevValue, newValue } = e;
  //   if (this.attributeChangedCallback) {
  //     this.attributeChangedCallback(attrName as Key, prevValue, newValue);
  //   }
  // };
}
