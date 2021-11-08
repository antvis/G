import { Module, Syringe } from 'mana-syringe';
import { RendererPlugin, SHAPE, world } from '@antv/g';
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

world.registerComponent(ElementSVG);

export { ElementSVG };
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
    useFactory: (ctx) => (tagName: SHAPE) => {
      if (tagName === SHAPE.Rect) {
        return ctx.container.get(RectRenderer);
      } else if (tagName === SHAPE.Image) {
        return ctx.container.get(ImageRenderer);
      } else if (tagName === SHAPE.Line) {
        return ctx.container.get(LineRenderer);
      } else if (tagName === SHAPE.Polyline || tagName === SHAPE.Polygon) {
        return ctx.container.get(PolylineRenderer);
      } else if (tagName === SHAPE.Text) {
        return ctx.container.get(TextRenderer);
      } else if (tagName === SHAPE.Path) {
        return ctx.container.get(PathRenderer);
      }
      return null;
    },
  });

  register(SVGRendererPlugin);
});

export class Plugin implements RendererPlugin {
  init(container: Syringe.Container): void {
    container.load(containerModule);
  }
  destroy(container: Syringe.Container): void {
    // @ts-ignore
    // container.container.unload(containerModule);
    // container.unload(containerModule);
  }
}
