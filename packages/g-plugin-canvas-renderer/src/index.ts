import type { RendererPlugin } from '@antv/g';
import { Shape } from '@antv/g';
import type { Syringe } from 'mana-syringe';
import { Module } from 'mana-syringe';
import { CanvasRendererPlugin } from './CanvasRendererPlugin';
import { GradientPool } from './shapes/GradientPool';
import type { StyleRenderer } from './shapes/styles';
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
import { TextRenderer } from './shapes/styles/Text';

export * from './shapes/styles';

const containerModule = Module((register) => {
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
    useFactory:
      (ctx) =>
      (tagName: Shape): StyleRenderer => {
        const token = shape2Token[tagName];
        if (token && ctx.container.isBound(token)) {
          return ctx.container.get<StyleRenderer>(token);
        }
        return null;
      },
  });

  register(GradientPool);

  register(CanvasRendererPlugin);
});

export class Plugin implements RendererPlugin {
  name = 'canvas-renderer';
  init(container: Syringe.Container): void {
    container.load(containerModule, true);
  }
  destroy(container: Syringe.Container): void {
    container.unload(containerModule);
  }
}
