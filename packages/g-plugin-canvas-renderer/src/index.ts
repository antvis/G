import { RenderingPluginContribution, SHAPE, container, world } from '@antv/g';
import { ContainerModule } from 'inversify';
import RBush from 'rbush';
import type { StyleRenderer } from './shapes/styles';
import { DefaultRenderer, StyleRendererFactory } from './shapes/styles';
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
import { CanvasRendererPlugin, RBushRoot } from './CanvasRendererPlugin';
import { LoadImagePlugin } from './LoadImagePlugin';
import { RBushNode, RBushNodeAABB } from './components/RBushNode';

export { PathGeneratorFactory, PathGenerator, RBushNode, RBushNodeAABB, RBushRoot, RBush };

world.registerComponent(RBushNode);

/**
 * register shape renderers
 */
container
  .bind(PathGeneratorFactory)
  .toFactory<PathGenerator<any> | null>((ctx) => (tagName: SHAPE) => {
    if (tagName === SHAPE.Circle) {
      return CirclePath;
    }
    if (tagName === SHAPE.Ellipse) {
      return EllipsePath;
    }
    if (tagName === SHAPE.Rect) {
      return RectPath;
    }
    if (tagName === SHAPE.Line) {
      return LinePath;
    }
    if (tagName === SHAPE.Polyline) {
      return PolylinePath;
    }
    if (tagName === SHAPE.Polygon) {
      return PolygonPath;
    }
    if (tagName === SHAPE.Path) {
      return PathPath;
    }

    return null;
  });

export const containerModule = new ContainerModule((bind, unbind, isBound, rebind) => {
  bind(ImagePool).toSelf().inSingletonScope();
  bind(RBushRoot).toConstantValue(new RBush<RBushNodeAABB>());

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
    }
    if (tagName === SHAPE.Image) {
      return ctx.container.get(ImageRenderer);
    }
    if (tagName === SHAPE.Text) {
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
