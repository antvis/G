import { ContainerModule } from 'inversify';
import { RenderingPluginContribution, SHAPE, world } from '@antv/g';
import { ElementSVG } from './components/ElementSVG';
import {
  ElementRenderer,
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

export const containerModule = new ContainerModule((bind, unbind, isBound, rebind) => {
  /**
   * register shape renderers
   */
  bind(RectRenderer).toSelf().inSingletonScope();
  bind(ImageRenderer).toSelf().inSingletonScope();
  bind(LineRenderer).toSelf().inSingletonScope();
  bind(PolylineRenderer).toSelf().inSingletonScope();
  bind(TextRenderer).toSelf().inSingletonScope();
  bind(PathRenderer).toSelf().inSingletonScope();
  bind(ElementRendererFactory).toFactory<ElementRenderer | null>((ctx) => (tagName: SHAPE) => {
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
  });

  bind(SVGRendererPlugin).toSelf().inSingletonScope();
  bind(RenderingPluginContribution).toService(SVGRendererPlugin);
});
