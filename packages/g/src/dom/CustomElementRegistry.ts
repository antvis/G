import { SHAPE } from '../types';
import type { DisplayObject } from '../display-objects';
import {
  Ellipse,
  Circle,
  Rect,
  Image,
  Line,
  Path,
  Group,
  Polygon,
  Polyline,
  Text,
  HTML,
} from '../display-objects';

/**
 * compatible with SVG's naming rules like D3
 */
const ALIAS_2_TAGNAME_MAP = {
  g: SHAPE.Group,
};

/**
 * canvas.customElements
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/CustomElementRegistry
 */
export class CustomElementRegistry {
  private registry: Record<string, new (...args: any[]) => DisplayObject> = {};

  constructor() {
    this.define(SHAPE.Circle, Circle);
    this.define(SHAPE.Ellipse, Ellipse);
    this.define(SHAPE.Rect, Rect);
    this.define(SHAPE.Image, Image);
    this.define(SHAPE.Line, Line);
    this.define(SHAPE.Group, Group);
    this.define(SHAPE.Path, Path);
    this.define(SHAPE.Polygon, Polygon);
    this.define(SHAPE.Polyline, Polyline);
    this.define(SHAPE.Text, Text);
    this.define(SHAPE.HTML, HTML);
  }

  define<T extends DisplayObject>(name: string, constructor: new (...args: any[]) => T) {
    this.registry[name] = constructor;
  }

  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/CustomElementRegistry/get
   */
  get<T extends DisplayObject>(name: string): new (...args: any[]) => T {
    const mappedTagName = ALIAS_2_TAGNAME_MAP[name] || name;
    return this.registry[mappedTagName] as new (...args: any[]) => T;
  }
}
