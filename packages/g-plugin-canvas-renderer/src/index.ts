import { AbstractRendererPlugin, RenderingPluginContribution, Shape } from '@antv/g-lite';
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

export class Plugin extends AbstractRendererPlugin {
  name = 'canvas-renderer';

  constructor(private options: Partial<CanvasRendererPluginOptions> = {}) {
    super();
  }

  init(): void {
    this.container.registerSingleton(CircleRendererContribution, CircleRenderer);
    this.container.registerSingleton(EllipseRendererContribution, EllipseRenderer);
    this.container.registerSingleton(RectRendererContribution, RectRenderer);
    this.container.registerSingleton(ImageRendererContribution, ImageRenderer);
    this.container.registerSingleton(TextRendererContribution, TextRenderer);
    this.container.registerSingleton(LineRendererContribution, LineRenderer);
    this.container.registerSingleton(PolylineRendererContribution, PolylineRenderer);
    this.container.registerSingleton(PolygonRendererContribution, PolygonRenderer);
    this.container.registerSingleton(PathRendererContribution, PathRenderer);

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

    this.container.register(StyleRendererFactory, {
      useValue: (nodeName: string): StyleRenderer => {
        return this.container.resolve(shape2Token[nodeName]);
      },
    });

    this.container.register(CanvasRendererPluginOptions, {
      useValue: {
        dirtyObjectNumThreshold: 500,
        dirtyObjectRatioThreshold: 0.8,
        ...this.options,
      },
    });

    this.container.registerSingleton(RenderingPluginContribution, CanvasRendererPlugin);
    // this.container.load(containerModule, true);
  }
  destroy(): void {
    // this.container.unload(containerModule);
    // this.container.remove(CanvasRendererPluginOptions);
  }
}
