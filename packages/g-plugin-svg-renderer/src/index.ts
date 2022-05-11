import type { Syringe } from 'mana-syringe';
import { Module } from 'mana-syringe';
import type { RendererPlugin } from '@antv/g';
import { Shape } from '@antv/g';
import { ElementSVG } from './components/ElementSVG';
import {
  ElementRendererFactory,
  ImageRenderer,
  LineRenderer,
  PathRenderer,
  PolylineRenderer,
  RectRenderer,
  TextRenderer,
} from './shapes/paths';
import { SVGRendererPlugin } from './SVGRendererPlugin';

export { ElementSVG };
export * from './SVGRendererPlugin';
export * from './utils/dom';

export const containerModule = Module((register) => {
  /**
   * register shape renderers
   */
  register(RectRenderer);
  register(ImageRenderer);
  register(LineRenderer);
  register(PolylineRenderer);
  register(TextRenderer);
  register(PathRenderer);
  register({
    token: ElementRendererFactory,
    useFactory: (ctx) => (tagName: Shape) => {
      if (tagName === Shape.RECT) {
        return ctx.container.get(RectRenderer);
      } else if (tagName === Shape.IMAGE) {
        return ctx.container.get(ImageRenderer);
      } else if (tagName === Shape.LINE) {
        return ctx.container.get(LineRenderer);
      } else if (tagName === Shape.POLYLINE || tagName === Shape.POLYGON) {
        return ctx.container.get(PolylineRenderer);
      } else if (tagName === Shape.TEXT) {
        return ctx.container.get(TextRenderer);
      } else if (tagName === Shape.PATH) {
        return ctx.container.get(PathRenderer);
      }
      return null;
    },
  });

  register(SVGRendererPlugin);
});

export class Plugin implements RendererPlugin {
  name = 'svg-renderer';
  init(container: Syringe.Container): void {
    container.load(containerModule, true);
  }
  destroy(container: Syringe.Container): void {
    container.unload(containerModule);
  }
}
