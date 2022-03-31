import type { RendererPlugin } from '@antv/g';
import { Shape } from '@antv/g';
import type { Syringe } from 'mana-syringe';
import { Module } from 'mana-syringe';
import { CanvasPickerPlugin, PointInPathPickerFactory } from './CanvasPickerPlugin';
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
      return (tagName: Shape) => {
        if (tagName === Shape.CIRCLE) {
          return CirclePicker;
        } else if (tagName === Shape.ELLIPSE) {
          return EllipsePicker;
        } else if (tagName === Shape.RECT) {
          return RectPicker;
        } else if (tagName === Shape.LINE) {
          return LinePicker;
        } else if (tagName === Shape.POLYLINE) {
          return PolylinePicker;
        } else if (tagName === Shape.POLYGON) {
          return PolygonPicker;
        } else if (tagName === Shape.PATH) {
          return PathPicker;
        } else if (
          tagName === Shape.IMAGE ||
          tagName === Shape.TEXT
          // tagName === Shape.GROUP
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
    container.load(containerModule, true);
  }
  destroy(container: Syringe.Container): void {
    container.unload(containerModule);
  }
}
