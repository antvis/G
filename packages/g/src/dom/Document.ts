import { Node } from './Node';
import { AnimationTimeline } from './AnimationTimeline';
import { Group, Text } from '../display-objects';
import type { DisplayObject } from '../display-objects/DisplayObject';
import type { IDocument, IElement, INode, ICanvas, DisplayObjectConfig } from './interfaces';
import type { BaseStyleProps } from '../types';
import { BUILT_IN_PROPERTIES } from '../css';

/**
 * the entry of DOM tree
 * Document -> Node -> EventTarget
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Document
 */
export class Document extends Node implements IDocument {
  constructor() {
    super();

    this.nodeName = 'document';

    // create timeline
    this.timeline = new AnimationTimeline();

    /**
     * for inherited properties, the initial value is used on the root element only,
     * as long as no specified value is supplied.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/initial_value
     */
    const initialStyle = {};
    BUILT_IN_PROPERTIES.forEach(({ name, inherited, defaultValue }) => {
      if (inherited && defaultValue) {
        initialStyle[name] = defaultValue;
      }
    });

    // like <html> in DOM tree
    this.documentElement = new Group({
      id: 'g-root',
      style: initialStyle,
      // style: {
      //   visibility: 'visible',
      //   textAlign: TextAlign.START,
      //   fontSize: '16px',
      //   fontFamily: 'sans-serif',
      //   // fontStyle: 'normal',
      //   // fontWeight: 'normal',
      //   // fontVariant: 'normal',
      // },
    });
    this.documentElement.ownerDocument = this;
    this.documentElement.parentNode = this;
    this.childNodes = [this.documentElement];
  }

  get children(): IElement[] {
    return this.childNodes as IElement[];
  }
  get childElementCount(): number {
    return this.childNodes.length;
  }
  get firstElementChild(): IElement | null {
    return this.firstChild as IElement;
  }
  get lastElementChild(): IElement | null {
    return this.lastChild as IElement;
  }

  /**
   * only document has defaultView, points to canvas,
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Document/defaultView
   */
  defaultView: ICanvas | null = null;

  /**
   * the root element of document, eg. <html>
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Document/documentElement
   */
  readonly documentElement: Group;

  /**
   * document.timeline in WAAPI
   */
  readonly timeline: AnimationTimeline;

  readonly ownerDocument = null;

  /**
   * @example const circle = document.createElement('circle', { style: { r: 10 } });
   */
  createElement<T extends DisplayObject<StyleProps>, StyleProps extends BaseStyleProps>(
    tagName: string,
    options: DisplayObjectConfig<StyleProps>,
  ): T {
    // d3 will use <tspan>
    let clazz = this.defaultView.customElements.get(tagName);

    if (!clazz) {
      console.warn('Unsupported tagName: ', tagName);
      clazz = tagName === 'tspan' ? Text : Group;
    }

    return new clazz(options) as unknown as T;
  }

  createElementNS<T extends DisplayObject<StyleProps>, StyleProps extends BaseStyleProps>(
    namespaceURI: string,
    tagName: string,
    options: DisplayObjectConfig<StyleProps>,
  ): T {
    return this.createElement(tagName, options);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  cloneNode(deep?: boolean): this {
    throw new Error('Method not implemented.');
  }
  destroy(): void {
    try {
      this.documentElement.destroy();
    } catch (e) {}
    this.timeline.destroy();
  }

  /**
   * eg. Uncaught DOMException: Failed to execute 'appendChild' on 'Node': Only one element on document allowed.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  appendChild<T extends INode>(newChild: T, index?: number): T {
    throw new Error('Use document.documentElement instead.');
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  insertBefore<T extends INode>(newChild: T, refChild: INode | null): T {
    throw new Error('Use document.documentElement instead.');
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  removeChild<T extends INode>(oldChild: T, destroy?: boolean): T {
    throw new Error('Use document.documentElement instead.');
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  replaceChild<T extends INode>(newChild: INode, oldChild: T, destroy?: boolean): T {
    throw new Error('Use document.documentElement instead.');
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  append(...nodes: INode[]): void {
    throw new Error('Use document.documentElement instead.');
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  prepend(...nodes: INode[]): void {
    throw new Error('Use document.documentElement instead.');
  }

  /**
   * Execute query on documentElement.
   */
  getElementById<E extends IElement = IElement>(id: string): E | null {
    return this.documentElement.getElementById(id);
  }
  getElementsByName<E extends IElement = IElement>(name: string): E[] {
    return this.documentElement.getElementsByName(name);
  }
  getElementsByTagName<E extends IElement = IElement>(tagName: string): E[] {
    return this.documentElement.getElementsByTagName(tagName);
  }
  getElementsByClassName<E extends IElement = IElement>(className: string): E[] {
    return this.documentElement.getElementsByClassName(className);
  }
  querySelector<E extends IElement = IElement>(selectors: string): E | null {
    return this.documentElement.querySelector(selectors);
  }
  querySelectorAll<E extends IElement = IElement>(selectors: string): E[] {
    return this.documentElement.querySelectorAll(selectors);
  }
  find<E extends IElement = IElement>(filter: (node: E) => boolean): E | null {
    return this.documentElement.find(filter);
  }
  findAll<E extends IElement = IElement>(filter: (node: E) => boolean): E[] {
    return this.documentElement.findAll(filter);
  }
}
