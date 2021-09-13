import { Canvas } from '../Canvas';
import { Node } from './Node';
import { AnimationTimeline } from '../Timeline';
import { Group } from '../display-objects';
import { DisplayObject } from '../DisplayObject';

/**
 * the entry of DOM tree
 * Document -> Node -> EventTarget
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Document
 */
export class Document extends Node {
  constructor() {
    super();

    // like <html> in DOM tree
    this.documentElement = new Group({ id: 'g-root' });
    this.nodeName = 'document';

    (this.documentElement as Node).parentNode = this;
    (this.childNodes as Node[]) = [this.documentElement];
  }

  /**
   * only document has defaultView, points to canvas,
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Document/defaultView
   */
  defaultView: Canvas | null = null;

  /**
   * the root element of document, eg. <html>
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Document/documentElement
   */
  documentElement: Group;

  /**
   * document.timeline in WAAPI
   */
  timeline = new AnimationTimeline();

  /**
   * eg. Uncaught DOMException: Failed to execute 'appendChild' on 'Node': Only one element on document allowed.
   */
  appendChild(child: this, index?: number): this {
    throw new Error('Use document.documentElement instead.');
  }

  insertBefore(child: this, reference?: this): this {
    throw new Error('Use document.documentElement instead.');
  }

  removeChild(child: this, destroy?: boolean): this {
    throw new Error('Use document.documentElement instead.');
  }

  getElementById(id: string): DisplayObject | null {
    return this.documentElement.getElementById(id);
  }
  getElementsByName(name: string): DisplayObject[] {
    return this.documentElement.getElementsByName(name);
  }
  getElementsByClassName(className: string): DisplayObject[] {
    return this.documentElement.getElementsByClassName(className);
  }
  getElementsByTagName(tagName: string): DisplayObject[] {
    return this.documentElement.getElementsByTagName(tagName);
  }
  querySelector(selector: string): DisplayObject | null {
    return this.documentElement.querySelector(selector);
  }
  querySelectorAll(selector: string): DisplayObject[] {
    return this.documentElement.querySelectorAll(selector);
  }
}
