import { RenderingPluginContribution, RendererPlugin, SHAPE, container, world } from '@antv/g';
import { ContainerModule, Container, interfaces } from 'inversify';
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

export {
  PathGeneratorFactory,
  PathGenerator,
  StyleRenderer,
  RBushNode,
  RBushNodeAABB,
  RBushRoot,
  RBush,
};

world.registerComponent(RBushNode);

/**
 * register shape renderers
 */
container.bind(PathGenerator).toConstantValue(CirclePath).whenTargetNamed(SHAPE.Circle);
container.bind(PathGenerator).toConstantValue(EllipsePath).whenTargetNamed(SHAPE.Ellipse);
container.bind(PathGenerator).toConstantValue(RectPath).whenTargetNamed(SHAPE.Rect);
container.bind(PathGenerator).toConstantValue(LinePath).whenTargetNamed(SHAPE.Line);
container.bind(PathGenerator).toConstantValue(PolylinePath).whenTargetNamed(SHAPE.Polyline);
container.bind(PathGenerator).toConstantValue(PolygonPath).whenTargetNamed(SHAPE.Polygon);
container.bind(PathGenerator).toConstantValue(PathPath).whenTargetNamed(SHAPE.Path);
container
  .bind(PathGeneratorFactory)
  .toFactory<PathGenerator<any> | null>((ctx) => (tagName: SHAPE) => {
    if (ctx.container.isBoundNamed(PathGenerator, tagName)) {
      return ctx.container.getNamed(PathGenerator, tagName);
    }

    return null;
  });

let bindFunc: interfaces.Bind;
const containerModule = new ContainerModule((bind, unbind, isBound, rebind) => {
  bindFunc = bind;

  bind(ImagePool).toSelf().inSingletonScope();
  bind(RBushRoot).toConstantValue(new RBush<RBushNodeAABB>());

  bind(DefaultRenderer).toSelf().inSingletonScope();
  bind(ImageRenderer).toSelf().inSingletonScope();
  bind(TextRenderer).toSelf().inSingletonScope();

  bind(StyleRenderer).to(DefaultRenderer).inSingletonScope().whenTargetNamed(SHAPE.Circle);
  bind(StyleRenderer).to(DefaultRenderer).inSingletonScope().whenTargetNamed(SHAPE.Ellipse);
  bind(StyleRenderer).to(DefaultRenderer).inSingletonScope().whenTargetNamed(SHAPE.Rect);
  bind(StyleRenderer).to(DefaultRenderer).inSingletonScope().whenTargetNamed(SHAPE.Line);
  bind(StyleRenderer).to(DefaultRenderer).inSingletonScope().whenTargetNamed(SHAPE.Polyline);
  bind(StyleRenderer).to(DefaultRenderer).inSingletonScope().whenTargetNamed(SHAPE.Polygon);
  bind(StyleRenderer).to(DefaultRenderer).inSingletonScope().whenTargetNamed(SHAPE.Path);
  bind(StyleRenderer).to(ImageRenderer).inSingletonScope().whenTargetNamed(SHAPE.Image);
  bind(StyleRenderer).to(TextRenderer).inSingletonScope().whenTargetNamed(SHAPE.Text);
  bind(StyleRendererFactory).toFactory<StyleRenderer | null>((ctx) => (tagName: SHAPE) => {
    if (ctx.container.isBoundNamed(StyleRenderer, tagName)) {
      return ctx.container.getNamed(StyleRenderer, tagName);
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

export function registerStyleRenderer(
  tagName: string,
  RendererClazz: new (...args: any[]) => StyleRenderer,
) {
  bindFunc(StyleRenderer).to(RendererClazz).inSingletonScope().whenTargetNamed(tagName);
}
