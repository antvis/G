import { AbstractRendererPlugin, Shape } from '@antv/g-lite';
import type { PathGenerator } from '@antv/g-plugin-canvas-path-generator';
import { CanvasRendererPlugin } from './CanvasRendererPlugin';
import {
  type StyleRenderer,
  DefaultRenderer,
  TextRenderer,
  ImageRenderer,
} from './shapes/styles';
import type { CanvasRendererPluginOptions } from './interfaces';

export * from './shapes/styles';

export class Plugin extends AbstractRendererPlugin<{
  defaultStyleRendererFactory: Record<Shape, StyleRenderer>;
  styleRendererFactory: Record<Shape, StyleRenderer>;
  pathGeneratorFactory: Record<Shape, PathGenerator<any>>;
}> {
  name = 'canvas-renderer';

  constructor(private options: Partial<CanvasRendererPluginOptions> = {}) {
    super();
  }

  init(): void {
    const canvasRendererPluginOptions: CanvasRendererPluginOptions = {
      dirtyObjectNumThreshold: 500,
      dirtyObjectRatioThreshold: 0.8,
      ...this.options,
    };

    // @ts-ignore
    const { imagePool } = this.context;

    const defaultRenderer = new DefaultRenderer(imagePool);

    const defaultStyleRendererFactory: Record<Shape, StyleRenderer> = {
      [Shape.CIRCLE]: defaultRenderer,
      [Shape.ELLIPSE]: defaultRenderer,
      [Shape.RECT]: defaultRenderer,
      [Shape.IMAGE]: new ImageRenderer(imagePool),
      [Shape.TEXT]: new TextRenderer(imagePool),
      [Shape.LINE]: defaultRenderer,
      [Shape.POLYLINE]: defaultRenderer,
      [Shape.POLYGON]: defaultRenderer,
      [Shape.PATH]: defaultRenderer,
      [Shape.GROUP]: undefined,
      [Shape.HTML]: undefined,
      [Shape.MESH]: undefined,
      [Shape.FRAGMENT]: undefined,
    };

    this.context.defaultStyleRendererFactory = defaultStyleRendererFactory;
    this.context.styleRendererFactory = defaultStyleRendererFactory;

    this.addRenderingPlugin(
      new CanvasRendererPlugin(canvasRendererPluginOptions),
    );
  }
  destroy(): void {
    this.removeAllRenderingPlugins();

    delete this.context.defaultStyleRendererFactory;
    delete this.context.styleRendererFactory;
  }
}
