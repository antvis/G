import { AbstractRendererPlugin, RenderingPluginContribution, Shape } from '@antv/g-lite';
import { CanvasPickerPlugin, PointInPathPickerFactory } from './CanvasPickerPlugin';
import { isPointInPath as CirclePicker } from './Circle';
import { isPointInPath as EllipsePicker } from './Ellipse';
import { isPointInPath as LinePicker } from './Line';
import { isPointInPath as PathPicker } from './Path';
import { isPointInPath as PolygonPicker } from './Polygon';
import { isPointInPath as PolylinePicker } from './Polyline';
import { isPointInPath as RectPicker } from './Rect';

export class Plugin extends AbstractRendererPlugin {
  name = 'canvas-picker';
  init(): void {
    const map = {
      [Shape.CIRCLE]: CirclePicker,
      [Shape.ELLIPSE]: EllipsePicker,
      [Shape.RECT]: RectPicker,
      [Shape.LINE]: LinePicker,
      [Shape.POLYGON]: PolygonPicker,
      [Shape.POLYLINE]: PolylinePicker,
      [Shape.PATH]: PathPicker,
      [Shape.IMAGE]: () => true,
      [Shape.TEXT]: () => true,
    };
    this.container.register(PointInPathPickerFactory, {
      useValue: (nodeName: string) => map[nodeName] || null,
    });

    this.container.registerSingleton(RenderingPluginContribution, CanvasPickerPlugin);
    // this.container.register(CanvasPickerPlugin);
  }
  destroy(): void {
    // this.container.unload(containerModule);
  }
}
