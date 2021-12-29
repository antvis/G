import type { RendererPlugin } from '@antv/g';
import { SHAPE, globalContainer } from '@antv/g';
import type { Syringe } from 'mana-syringe';
import { Module } from 'mana-syringe';
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
import { RBushNode } from './components/RBushNode';
import type { RBushNodeAABB } from './components/RBushNode';

export { PathGeneratorFactory, PathGenerator, StyleRenderer, RBushNode, RBushRoot, RBush };

export type { RBushNodeAABB };

/**
 * register shape renderers
 */
globalContainer.register({
  token: { token: PathGenerator, named: SHAPE.Circle },
  useValue: CirclePath,
});
globalContainer.register({
  token: { token: PathGenerator, named: SHAPE.Ellipse },
  useValue: EllipsePath,
});
globalContainer.register({
  token: { token: PathGenerator, named: SHAPE.Rect },
  useValue: RectPath,
});
globalContainer.register({
  token: { token: PathGenerator, named: SHAPE.Line },
  useValue: LinePath,
});
globalContainer.register({
  token: { token: PathGenerator, named: SHAPE.Polyline },
  useValue: PolylinePath,
});
globalContainer.register({
  token: { token: PathGenerator, named: SHAPE.Polygon },
  useValue: PolygonPath,
});
globalContainer.register({
  token: { token: PathGenerator, named: SHAPE.Path },
  useValue: PathPath,
});

globalContainer.register({
  token: PathGeneratorFactory,
  useFactory: (ctx) => {
    const cache = {};
    return (tagName: SHAPE) => {
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

  register(DefaultRenderer);
  register(ImageRenderer);
  register(TextRenderer);
  register({
    token: StyleRendererFactory,
    useFactory: (ctx) => {
      const cache = {};
      return (tagName: SHAPE) => {
        if (!cache[tagName]) {
          if (ctx.container.isBoundNamed(StyleRenderer, tagName)) {
            cache[tagName] = ctx.container.getNamed(StyleRenderer, tagName);
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
    // @ts-ignore
    // container.unload(containerModule);
    container.remove(ImagePool);
    container.remove(RBushRoot);
    container.remove(DefaultRenderer);
    container.remove(ImageRenderer);
    container.remove(TextRenderer);
    container.remove(StyleRenderer);
    container.remove(StyleRendererFactory);
    container.remove(GradientPool);
    container.remove(CanvasRendererPlugin);
    container.remove(LoadImagePlugin);
  }
}
