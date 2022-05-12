import type { Syringe } from 'mana-syringe';
import { Module } from 'mana-syringe';
import type { RendererPlugin } from '@antv/g';
import {
  CircleRenderer,
  EllipseRenderer,
  RectRenderer,
  LineRenderer,
  PolylineRenderer,
  PolygonRenderer,
  PathRenderer,
} from '@antv/g-plugin-canvas-renderer';
import {
  CircleRenderer as CircleRoughRenderer,
  EllipseRenderer as EllipseRoughRenderer,
  RectRenderer as RectRoughRenderer,
  LineRenderer as LineRoughRenderer,
  PolylineRenderer as PolylineRoughRenderer,
  PolygonRenderer as PolygonRoughRenderer,
  PathRenderer as PathRoughRenderer,
} from './renderers';
import { RoughRendererPlugin } from './RoughRendererPlugin';

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
