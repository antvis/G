import { RendererPlugin, Shape } from '@antv/g';
import type { Syringe } from 'mana-syringe';
import { Module } from 'mana-syringe';
import { CanvaskitRendererPlugin } from './CanvaskitRendererPlugin';
import { FontLoader } from './FontLoader';
import {
  CanvaskitRendererPluginOptions,
  CircleRendererContribution,
  EllipseRendererContribution,
  ImageRendererContribution,
  LineRendererContribution,
  PathRendererContribution,
  PolygonRendererContribution,
  PolylineRendererContribution,
  RectRendererContribution,
  RendererContribution,
  RendererContributionFactory,
  TextRendererContribution,
} from './interfaces';
import {
  CircleRenderer,
  EllipseRenderer,
  ImageRenderer,
  LineRenderer,
  PathRenderer,
  PolygonRenderer,
  PolylineRenderer,
  RectRenderer,
  TextRenderer,
} from './renderers';

export * from './interfaces';

const containerModule = Module((register) => {
  register(FontLoader);

  register(CircleRenderer);
  register(EllipseRenderer);
  register(RectRenderer);
  register(LineRenderer);
  register(ImageRenderer);
  register(PolylineRenderer);
  register(PolygonRenderer);
  register(PathRenderer);
  register(TextRenderer);

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
    token: RendererContributionFactory,
    useFactory: (ctx) => {
      const cache = {};
      return (tagName: Shape): RendererContribution => {
        const token = shape2Token[tagName];
        if (token && !cache[tagName]) {
          if (ctx.container.isBound(token)) {
            cache[tagName] = ctx.container.get<RendererContribution>(token);
          }
        }

        return cache[tagName];
      };
    },
  });

  register(CanvaskitRendererPlugin);
});

export class Plugin implements RendererPlugin {
  name = 'canvaskit-renderer';

  constructor(private options: Partial<CanvaskitRendererPluginOptions> = {}) {}

  init(container: Syringe.Container): void {
    container.register(CanvaskitRendererPluginOptions, {
      useValue: {
        fonts: [],
        ...this.options,
      },
    });
    container.load(containerModule, true);
  }
  destroy(container: Syringe.Container): void {
    container.remove(CanvaskitRendererPluginOptions);
    container.unload(containerModule);
  }
}
