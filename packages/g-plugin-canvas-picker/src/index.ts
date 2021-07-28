import { SHAPE, RenderingPluginContribution } from '@antv/g';
import { ContainerModule } from 'inversify';
import type { PointInPathPicker } from './CanvasPickerPlugin';
import { CanvasPickerPlugin, PointInPathPickerFactory } from './CanvasPickerPlugin';
import { isPointInPath as CirclePicker } from './Circle';
import { isPointInPath as EllipsePicker } from './Ellipse';
import { isPointInPath as LinePicker } from './Line';
import { isPointInPath as PolylinePicker } from './Polyline';
import { isPointInPath as PathPicker } from './Path';
import { isPointInPath as RectPicker } from './Rect';
import { isPointInPath as PolygonPicker } from './Polygon';

export const containerModule = new ContainerModule((bind, unbind, isBound, rebind) => {
  bind(PointInPathPickerFactory).toFactory<PointInPathPicker<any> | null>(
    (ctx) => (tagName: SHAPE) => {
      if (tagName === SHAPE.Circle) {
        return CirclePicker;
      }
      if (tagName === SHAPE.Ellipse) {
        return EllipsePicker;
      }
      if (tagName === SHAPE.Rect) {
        return RectPicker;
      }
      if (tagName === SHAPE.Line) {
        return LinePicker;
      }
      if (tagName === SHAPE.Polyline) {
        return PolylinePicker;
      }
      if (tagName === SHAPE.Polygon) {
        return PolygonPicker;
      }
      if (tagName === SHAPE.Path) {
        return PathPicker;
      }
      return null;
    },
  );

  bind(CanvasPickerPlugin).toSelf().inSingletonScope();
  bind(RenderingPluginContribution).toService(CanvasPickerPlugin);
});
