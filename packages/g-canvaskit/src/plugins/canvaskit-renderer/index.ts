import type { DataURLOptions } from '@antv/g-lite';
import { AbstractRendererPlugin, Shape } from '@antv/g-lite';
import type { Canvas, InputRect } from 'canvaskit-wasm';
import { CanvaskitRendererPlugin } from './CanvaskitRendererPlugin';
import { FontLoader } from './FontLoader';
import type {
  RendererContribution,
  CanvaskitRendererPluginOptions,
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

export class Plugin extends AbstractRendererPlugin {
  name = 'canvaskit-renderer';

  constructor(private options: Partial<CanvaskitRendererPluginOptions> = {}) {
    super();
  }

  init(): void {
    const canvaskitRendererPluginOptions = {
      fonts: [],
      ...this.options,
    };

    const fontLoader = new FontLoader();

    const rendererContributionFactory: Record<Shape, RendererContribution> = {
      [Shape.CIRCLE]: new CircleRenderer(),
      [Shape.ELLIPSE]: new EllipseRenderer(),
      [Shape.RECT]: new RectRenderer(),
      [Shape.IMAGE]: new ImageRenderer(this.context),
      [Shape.TEXT]: new TextRenderer(this.context, fontLoader),
      [Shape.LINE]: new LineRenderer(),
      [Shape.POLYLINE]: new PolylineRenderer(this.context),
      [Shape.POLYGON]: new PolygonRenderer(this.context),
      [Shape.PATH]: new PathRenderer(this.context),
      [Shape.GROUP]: undefined,
      [Shape.HTML]: undefined,
      [Shape.MESH]: undefined,
    };

    this.addRenderingPlugin(
      new CanvaskitRendererPlugin(
        canvaskitRendererPluginOptions,
        rendererContributionFactory,
        fontLoader,
      ),
    );
  }

  destroy(): void {
    this.removeAllRenderingPlugins();
  }

  playAnimation(
    name: string,
    jsonStr: string,
    bounds?: InputRect,
    assets?: any,
  ) {
    return this.plugins[0].playAnimation(name, jsonStr, bounds, assets);
  }

  createParticles(
    jsonStr: string,
    onFrame?: (canvas: Canvas) => void,
    assets?: any,
  ) {
    return this.plugins[0].createParticles(jsonStr, onFrame, assets);
  }

  toDataURL(options: Partial<DataURLOptions>) {
    return this.plugins[0].toDataURL(options);
  }
}
