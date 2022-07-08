import { AbstractRendererPlugin, Module, Shape } from '@antv/g';
import { CanvasRendererPlugin } from './CanvasRendererPlugin';
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
import { CanvasRendererPluginOptions } from './tokens';

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

  register(CanvasRendererPlugin);
});

export class Plugin extends AbstractRendererPlugin {
  name = 'canvas-renderer';

  constructor(private options: Partial<CanvasRendererPluginOptions> = {}) {
    super();
  }

  init(): void {
    this.container.register(CanvasRendererPluginOptions, {
      useValue: {
        dirtyObjectNumThreshold: 500,
        dirtyObjectRatioThreshold: 0.8,
        ...this.options,
      },
    });
    this.container.load(containerModule, true);
  }
  destroy(): void {
    this.container.unload(containerModule);
    this.container.remove(CanvasRendererPluginOptions);
  }
}
