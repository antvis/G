import type { RendererPlugin } from '@antv/g';
import { Shape } from '@antv/g';
import type { Syringe } from 'mana-syringe';
import { Module, GlobalContainer } from 'mana-syringe';
import RBush from 'rbush';
import type {
  StyleRenderer} from './shapes/styles';
import {
  CircleRenderer,
  CircleRendererContribution,
  EllipseRenderer,
  EllipseRendererContribution,
  ImageRendererContribution,
  LineRenderer,
  LineRendererContribution,
  PathRenderer,
  PathRendererContribution,
  PolygonRenderer,
  PolygonRendererContribution,
  PolylineRenderer,
  PolylineRendererContribution,
  RectRenderer,
  RectRendererContribution,
  StyleRendererFactory,
  TextRendererContribution,
} from './shapes/styles';
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
import { RBushNode } from './components/RBushNode';
import type { RBushNodeAABB } from './components/RBushNode';

export { PathGeneratorFactory, PathGenerator, RBushNode, RBushRoot, RBush };

export * from './shapes/styles';

export type { RBushNodeAABB };

/**
 * register shape renderers
 */
GlobalContainer.register({
  token: { token: PathGenerator, named: Shape.CIRCLE },
  useValue: CirclePath,
});
GlobalContainer.register({
  token: { token: PathGenerator, named: Shape.ELLIPSE },
  useValue: EllipsePath,
});
GlobalContainer.register({
  token: { token: PathGenerator, named: Shape.RECT },
  useValue: RectPath,
});
GlobalContainer.register({
  token: { token: PathGenerator, named: Shape.LINE },
  useValue: LinePath,
});
GlobalContainer.register({
  token: { token: PathGenerator, named: Shape.POLYLINE },
  useValue: PolylinePath,
});
GlobalContainer.register({
  token: { token: PathGenerator, named: Shape.POLYGON },
  useValue: PolygonPath,
});
GlobalContainer.register({
  token: { token: PathGenerator, named: Shape.PATH },
  useValue: PathPath,
});

GlobalContainer.register({
  token: PathGeneratorFactory,
  useFactory: (ctx) => {
    const cache = {};
    return (tagName: Shape) => {
      if (!cache[tagName]) {
        if (ctx.container.isBoundNamed(PathGenerator, tagName)) {
          cache[tagName] = ctx.container.getNamed(PathGenerator, tagName);
        }
      }

      return cache[tagName];
    };
  },
});

const containerModule = Module((register) => {
  register(ImagePool);
  register({ token: RBushRoot, useValue: new RBush<RBushNodeAABB>() });

  register(CircleRenderer);
  register(EllipseRenderer);
  register(RectRenderer);
  register(ImageRenderer);
  register(TextRenderer);
  register(LineRenderer);
  register(PolylineRenderer);
  register(PolygonRenderer);
  register(PathRenderer);

  const shape2Token = {
    [Shape.CIRCLE]: CircleRendererContribution,
    [Shape.ELLIPSE]: EllipseRendererContribution,
    [Shape.RECT]: RectRendererContribution,
    [Shape.IMAGE]: ImageRendererContribution,
    [Shape.TEXT]: TextRendererContribution,
    [Shape.LINE]: LineRendererContribution,
    [Shape.POLYLINE]: PolylineRendererContribution,
    [Shape.POLYGON]: PolygonRendererContribution,
    [Shape.PATH]: PathRendererContribution,
  };
  register({
    token: StyleRendererFactory,
    useFactory: (ctx) => {
      const cache = {};
      return (tagName: Shape): StyleRenderer => {
        const token = shape2Token[tagName];
        if (token && !cache[tagName]) {
          if (ctx.container.isBound(token)) {
            cache[tagName] = ctx.container.get<StyleRenderer>(token);
          }
        }

        return cache[tagName];
      };
    },
  });

  register(GradientPool);

  register(CanvasRendererPlugin);
  register(LoadImagePlugin);
});

export class Plugin implements RendererPlugin {
  init(container: Syringe.Container): void {
    container.load(containerModule, true);
  }
  destroy(container: Syringe.Container): void {
    container.unload(containerModule);
  }
}
