import { CanvasRenderer } from '@antv/g-canvas';
import { AbstractRendererPlugin, Module } from '@antv/g-lite';
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

const {
  CircleRenderer,
  EllipseRenderer,
  LineRenderer,
  PathRenderer,
  PolygonRenderer,
  PolylineRenderer,
  RectRenderer,
} = CanvasRenderer;

const containerModule = Module((register) => {
  register(RoughRendererPlugin);

  // replace them with our 'rough' styled renderer
  register(CircleRoughRenderer);
  register(EllipseRoughRenderer);
  register(RectRoughRenderer);
  register(LineRoughRenderer);
  register(PolylineRoughRenderer);
  register(PolygonRoughRenderer);
  register(PathRoughRenderer);
});

export class Plugin extends AbstractRendererPlugin {
  name = 'rough-canvas-renderer';
  init(): void {
    // unregister default renderer in `g-plugin-canvas-renderer`
    this.container.remove(CircleRenderer);
    this.container.remove(EllipseRenderer);
    this.container.remove(RectRenderer);
    this.container.remove(LineRenderer);
    this.container.remove(PolylineRenderer);
    this.container.remove(PolygonRenderer);
    this.container.remove(PathRenderer);

    this.container.load(containerModule, true);
  }
  destroy(): void {
    this.container.unload(containerModule);

    this.container.register(CircleRenderer);
    this.container.register(EllipseRenderer);
    this.container.register(RectRenderer);
    this.container.register(LineRenderer);
    this.container.register(PolylineRenderer);
    this.container.register(PolygonRenderer);
    this.container.register(PathRenderer);
  }
}
