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

export class Plugin extends AbstractRendererPlugin {
  name = 'rough-canvas-renderer';
  init(): void {
    // @ts-ignore
    const { defaultStyleRendererFactory } = this.context;

    // @ts-ignore
    this.context.styleRendererFactory = {
      [Shape.CIRCLE]: new CircleRoughRenderer(),
      [Shape.ELLIPSE]: new EllipseRoughRenderer(),
      [Shape.RECT]: new RectRoughRenderer(),
      [Shape.IMAGE]: defaultStyleRendererFactory[Shape.IMAGE],
      [Shape.TEXT]: defaultStyleRendererFactory[Shape.TEXT],
      [Shape.LINE]: new LineRoughRenderer(),
      [Shape.POLYLINE]: new PolylineRoughRenderer(),
      [Shape.POLYGON]: new PolygonRoughRenderer(),
      [Shape.PATH]: new PathRoughRenderer(),
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
