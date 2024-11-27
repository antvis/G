import type { DisplayObjectConfig } from '../dom';
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
  static PARSED_STYLE_LIST: Set<string> = new Set([
    'class',
    'className',
    'clipPath',
    'cursor',
    'draggable',
    'droppable',
    'opacity',
    'pointerEvents',
    'transform',
    'transformOrigin',
    'zIndex',
    'visibility',
  ]);

  isCustomElement = true;

  // private shadowNodes: DisplayObject[] = [];

  constructor({
    style,
    ...rest
  }: DisplayObjectConfig<CustomElementStyleProps> = {}) {
    super({
      style,
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
}
