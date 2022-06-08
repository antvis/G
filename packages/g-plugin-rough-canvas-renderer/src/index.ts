import type { RendererPlugin, Syringe } from '@antv/g';
import { Module } from '@antv/g';
import { CanvasRenderer } from '@antv/g-canvas';
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

export class Plugin implements RendererPlugin {
  name = 'rough-canvas-renderer';
  init(container: Syringe.Container): void {
    // unregister default renderer in `g-plugin-canvas-renderer`
    container.remove(CircleRenderer);
    container.remove(EllipseRenderer);
    container.remove(RectRenderer);
    container.remove(LineRenderer);
    container.remove(PolylineRenderer);
    container.remove(PolygonRenderer);
    container.remove(PathRenderer);

    container.load(containerModule, true);
  }
  destroy(container: Syringe.Container): void {
    container.unload(containerModule);

    container.register(CircleRenderer);
    container.register(EllipseRenderer);
    container.register(RectRenderer);
    container.register(LineRenderer);
    container.register(PolylineRenderer);
    container.register(PolygonRenderer);
    container.register(PathRenderer);
  }
}
