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
});

export class Plugin implements RendererPlugin {
  init(container: Syringe.Container): void {
    container.load(containerModule, true);

    // unregister default renderer in `g-plugin-canvas-renderer`suoyi
    container.remove(CircleRenderer);
    container.remove(EllipseRenderer);
    container.remove(RectRenderer);
    container.remove(LineRenderer);
    container.remove(PolylineRenderer);
    container.remove(PolygonRenderer);
    container.remove(PathRenderer);

    // replace them with our 'rough' styled renderer
    container.register(CircleRoughRenderer);
    container.register(EllipseRoughRenderer);
    container.register(RectRoughRenderer);
    container.register(LineRoughRenderer);
    container.register(PolylineRoughRenderer);
    container.register(PolygonRoughRenderer);
    container.register(PathRoughRenderer);
  }
  destroy(container: Syringe.Container): void {
    container.unload(containerModule);
  }
}
