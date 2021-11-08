import { SHAPE, RenderingPluginContribution, RendererPlugin } from '@antv/g';
import { Module, Syringe } from 'mana-syringe';
import {
  CanvasPickerPlugin,
  PointInPathPickerFactory,
  PointInPathPicker,
} from './CanvasPickerPlugin';
import { isPointInPath as CirclePicker } from './Circle';
import { isPointInPath as EllipsePicker } from './Ellipse';
import { isPointInPath as LinePicker } from './Line';
import { isPointInPath as PolylinePicker } from './Polyline';
import { isPointInPath as PathPicker } from './Path';
import { isPointInPath as RectPicker } from './Rect';
import { isPointInPath as PolygonPicker } from './Polygon';

const containerModule = Module((register) => {
  register({
    token: PointInPathPickerFactory,
    useFactory: (context) => {
      return (tagName: SHAPE) => {
        if (tagName === SHAPE.Circle) {
          return CirclePicker;
        } else if (tagName === SHAPE.Ellipse) {
          return EllipsePicker;
        } else if (tagName === SHAPE.Rect) {
          return RectPicker;
        } else if (tagName === SHAPE.Line) {
          return LinePicker;
        } else if (tagName === SHAPE.Polyline) {
          return PolylinePicker;
        } else if (tagName === SHAPE.Polygon) {
          return PolygonPicker;
        } else if (tagName === SHAPE.Path) {
          return PathPicker;
        } else if (
          tagName === SHAPE.Image ||
          tagName === SHAPE.Text
          // tagName === SHAPE.Group
        ) {
          return () => true;
        }
        return null;
      };
    },
  });

  register(CanvasPickerPlugin);
});

export class Plugin implements RendererPlugin {
  init(container: Syringe.Container): void {
    container.load(containerModule);
  }
  destroy(container: Syringe.Container): void {
    // // container.unload(containerModule);
    // container.remove(PointInPathPickerFactory);
    // container.remove(CanvasPickerPlugin);
    // @ts-ignore
    // container.container.unload(containerModule);
  }
}
