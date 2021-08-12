import { RenderingPluginContribution, RendererPlugin, SHAPE, container, world } from '@antv/g';
import { ContainerModule, Container } from 'inversify';
import RBush from 'rbush';
import { DefaultRenderer, StyleRenderer, StyleRendererFactory } from './shapes/styles';
import { ImageRenderer } from './shapes/styles/Image';
import { GradientPool } from './shapes/GradientPool';
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
container.bind(PathGeneratorFactory).toFactory<PathGenerator<any> | null>((ctx) => (tagName: SHAPE) => {
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

const containerModule = new ContainerModule((bind, unbind, isBound, rebind) => {
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
    } else if (tagName === SHAPE.Image) {
      return ctx.container.get(ImageRenderer);
    } else if (tagName === SHAPE.Text) {
      return ctx.container.get(TextRenderer);
    }

    return null;
  });

  bind(GradientPool).toSelf().inSingletonScope();

  bind(CanvasRendererPlugin).toSelf().inSingletonScope();
  bind(RenderingPluginContribution).toService(CanvasRendererPlugin);

  bind(LoadImagePlugin).toSelf().inSingletonScope();
  bind(RenderingPluginContribution).toService(LoadImagePlugin);
});

export class Plugin implements RendererPlugin {
  init(container: Container): void {
    container.load(containerModule);
  }
  destroy(container: Container): void {
    container.unload(containerModule);
  }
}