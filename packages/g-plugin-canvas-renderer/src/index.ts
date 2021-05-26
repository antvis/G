import { RenderingPluginContribution, SHAPE, container } from '@antv/g';
import { ContainerModule } from 'inversify';
import { DefaultRenderer, StyleRenderer, StyleRendererFactory } from './shapes/styles';
import { ImageRenderer } from './shapes/styles/Image';
import { StyleParser } from './shapes/StyleParser';
import { ImagePool } from './shapes/ImagePool';
import {
  PathGeneratorFactory,
  PathGenerator,
  CirclePath,
  EllipsePath,
  RectPath,
  LinePath,
  PolylinePath,
  PolygonPath,
  PathPath,
} from './shapes/paths';
import { TextRenderer } from './shapes/styles/Text';
import { CanvasRendererPlugin } from './CanvasRendererPlugin';
import { LoadImagePlugin } from './LoadImagePlugin';

export { PathGeneratorFactory, PathGenerator };

/**
 * register shape renderers
 */
container.bind(PathGeneratorFactory).toFactory<PathGenerator | null>((ctx) => (tagName: SHAPE) => {
  if (tagName === SHAPE.Circle) {
    return CirclePath;
  } else if (tagName === SHAPE.Ellipse) {
    return EllipsePath;
  } else if (tagName === SHAPE.Rect) {
    return RectPath;
  } else if (tagName === SHAPE.Line) {
    return LinePath;
  } else if (tagName === SHAPE.Polyline) {
    return PolylinePath;
  } else if (tagName === SHAPE.Polygon) {
    return PolygonPath;
  } else if (tagName === SHAPE.Path) {
    return PathPath;
  }

  return null;
});

export const containerModule = new ContainerModule((bind, unbind, isBound, rebind) => {
  bind(ImagePool).toSelf().inSingletonScope();

  bind(DefaultRenderer).toSelf().inSingletonScope();
  bind(ImageRenderer).toSelf().inSingletonScope();
  bind(TextRenderer).toSelf().inSingletonScope();
  bind(StyleRendererFactory).toFactory<StyleRenderer | null>((ctx) => (tagName: SHAPE) => {
    if (
      tagName === SHAPE.Circle ||
      tagName === SHAPE.Ellipse ||
      tagName === SHAPE.Rect ||
      tagName === SHAPE.Line ||
      tagName === SHAPE.Polyline ||
      tagName === SHAPE.Polygon ||
      tagName === SHAPE.Path
    ) {
      return ctx.container.get(DefaultRenderer);
    } else if (tagName === SHAPE.Image) {
      return ctx.container.get(ImageRenderer);
    } else if (tagName === SHAPE.Text) {
      return ctx.container.get(TextRenderer);
    }

    return null;
  });

  bind(StyleParser).toSelf().inSingletonScope();

  bind(CanvasRendererPlugin).toSelf().inSingletonScope();
  bind(RenderingPluginContribution).toService(CanvasRendererPlugin);

  bind(LoadImagePlugin).toSelf().inSingletonScope();
  bind(RenderingPluginContribution).toService(LoadImagePlugin);
});
