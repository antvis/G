import { AbstractRendererPlugin, Shape } from '@antv/g-lite';
import {
  CircleRenderer as CircleZdogRenderer,
  // EllipseRenderer as EllipseZdogRenderer,
  // LineRenderer as LineZdogRenderer,
  // PathRenderer as PathZdogRenderer,
  // PolygonRenderer as PolygonZdogRenderer,
  // PolylineRenderer as PolylineZdogRenderer,
  // RectRenderer as RectZdogRenderer,
} from './renderers';
import { ZdogRendererPlugin } from './ZdogRendererPlugin';

export class Plugin extends AbstractRendererPlugin {
  name = 'rough-canvas-renderer';
  init(): void {
    // @ts-ignore
    const { defaultStyleRendererFactory } = this.context;

    // @ts-ignore
    this.context.styleRendererFactory = {
      [Shape.CIRCLE]: new CircleZdogRenderer(),
      // [Shape.ELLIPSE]: new EllipseZdogRenderer(),
      // [Shape.RECT]: new RectZdogRenderer(),
      [Shape.IMAGE]: defaultStyleRendererFactory[Shape.IMAGE],
      // @see https://github.com/jaames/zfont#installation
      [Shape.TEXT]: defaultStyleRendererFactory[Shape.TEXT],
      // [Shape.LINE]: new LineZdogRenderer(),
      // [Shape.POLYLINE]: new PolylineZdogRenderer(),
      // [Shape.POLYGON]: new PolygonZdogRenderer(),
      // [Shape.PATH]: new PathZdogRenderer(),
      // @see https://zzz.dog/api#anchor
      [Shape.GROUP]: undefined,
      [Shape.HTML]: undefined,
      [Shape.MESH]: undefined,
    };

    this.addRenderingPlugin(new ZdogRendererPlugin());
  }
  destroy(): void {
    // @ts-ignore
    this.context.styleRendererFactory =
      this.context.defaultStyleRendererFactory;

    this.removeAllRenderingPlugins();
  }
}
