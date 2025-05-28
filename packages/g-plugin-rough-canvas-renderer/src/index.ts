import { AbstractRendererPlugin, Shape } from '@antv/g-lite';
import {
  CircleRenderer as CircleRoughRenderer,
  EllipseRenderer as EllipseRoughRenderer,
  LineRenderer as LineRoughRenderer,
  PathRenderer as PathRoughRenderer,
  PolygonRenderer as PolygonRoughRenderer,
  PolylineRenderer as PolylineRoughRenderer,
  RectRenderer as RectRoughRenderer,
} from './renderers';
import { RoughRendererPlugin } from './RoughRendererPlugin';
import { type RoughCanvasRendererPluginOptions } from './util';

export class Plugin extends AbstractRendererPlugin {
  name = 'rough-canvas-renderer';

  constructor(private options?: Partial<RoughCanvasRendererPluginOptions>) {
    super();
  }

  init(): void {
    // @ts-ignore
    const { defaultStyleRendererFactory } = this.context;
    const options = this.options || {};

    // @ts-ignore
    this.context.styleRendererFactory = {
      [Shape.CIRCLE]: new CircleRoughRenderer({
        defaultStyleRendererFactory: defaultStyleRendererFactory[Shape.CIRCLE],
        ...options,
      }),
      [Shape.ELLIPSE]: new EllipseRoughRenderer({
        defaultStyleRendererFactory: defaultStyleRendererFactory[Shape.ELLIPSE],
        ...options,
      }),
      [Shape.RECT]: new RectRoughRenderer({
        defaultStyleRendererFactory: defaultStyleRendererFactory[Shape.RECT],
        ...options,
      }),
      [Shape.IMAGE]: defaultStyleRendererFactory[Shape.IMAGE],
      [Shape.TEXT]: defaultStyleRendererFactory[Shape.TEXT],
      [Shape.LINE]: new LineRoughRenderer({
        defaultStyleRendererFactory: defaultStyleRendererFactory[Shape.LINE],
        ...options,
      }),
      [Shape.POLYLINE]: new PolylineRoughRenderer({
        defaultStyleRendererFactory:
          defaultStyleRendererFactory[Shape.POLYLINE],
        ...options,
      }),
      [Shape.POLYGON]: new PolygonRoughRenderer({
        defaultStyleRendererFactory: defaultStyleRendererFactory[Shape.POLYGON],
        ...options,
      }),
      [Shape.PATH]: new PathRoughRenderer({
        defaultStyleRendererFactory: defaultStyleRendererFactory[Shape.PATH],
        ...options,
      }),
      [Shape.GROUP]: undefined,
      [Shape.HTML]: undefined,
      [Shape.MESH]: undefined,
    };

    this.addRenderingPlugin(new RoughRendererPlugin());
  }
  destroy(): void {
    // @ts-ignore
    this.context.styleRendererFactory =
      this.context.defaultStyleRendererFactory;

    this.removeAllRenderingPlugins();
  }
}
