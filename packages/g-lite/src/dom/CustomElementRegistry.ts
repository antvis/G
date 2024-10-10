import type { DisplayObject } from '../display-objects';
import {
  Circle,
  Ellipse,
  Group,
  HTML,
  Image,
  Line,
  Path,
  Polygon,
  Polyline,
  Rect,
  Text,
} from '../display-objects';
import { Shape } from '../types';

/**
 * canvas.customElements
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/CustomElementRegistry
 */
export class CustomElementRegistry {
  private registry: Record<string, new (...args: any[]) => DisplayObject> = {};

  constructor() {
    this.define(Shape.CIRCLE, Circle);
    this.define(Shape.ELLIPSE, Ellipse);
    this.define(Shape.RECT, Rect);
    this.define(Shape.IMAGE, Image);
    this.define(Shape.LINE, Line);
    this.define(Shape.GROUP, Group);
    this.define(Shape.PATH, Path);
    this.define(Shape.POLYGON, Polygon);
    this.define(Shape.POLYLINE, Polyline);
    this.define(Shape.TEXT, Text);
    this.define(Shape.HTML, HTML);
  }

  define<T extends DisplayObject>(
    name: string,
    constructor: new (...args: any[]) => T,
  ) {
    this.registry[name] = constructor;
  }

  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/CustomElementRegistry/get
   */
  get<T extends DisplayObject>(name: string): new (...args: any[]) => T {
    return this.registry[name] as new (...args: any[]) => T;
  }
}
