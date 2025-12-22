import { AbstractRendererPlugin, Shape } from '@antv/g-lite';
import type { PointInPathPicker } from './CanvasPickerPlugin';
import { CanvasPickerPlugin } from './CanvasPickerPlugin';
import { isPointInPath as CirclePicker } from './Circle';
import { isPointInPath as EllipsePicker } from './Ellipse';
import { isPointInPath as LinePicker } from './Line';
import { isPointInPath as PathPicker } from './Path';
import { isPointInPath as PolygonPicker } from './Polygon';
import { isPointInPath as PolylinePicker } from './Polyline';
import { isPointInPath as RectPicker } from './Rect';
import { isPointInPath as ImagePicker } from './Image';
import { isPointInPath as TextPicker } from './Text';

export class Plugin extends AbstractRendererPlugin {
  name = 'canvas-picker';
  init(): void {
    const pointInPathPickerFactory: Record<Shape, PointInPathPicker<any>> = {
      [Shape.CIRCLE]: CirclePicker,
      [Shape.ELLIPSE]: EllipsePicker,
      [Shape.RECT]: RectPicker,
      [Shape.LINE]: LinePicker,
      [Shape.POLYLINE]: PolylinePicker,
      [Shape.POLYGON]: PolygonPicker,
      [Shape.PATH]: PathPicker,
      [Shape.TEXT]: TextPicker,
      [Shape.GROUP]: null,
      [Shape.IMAGE]: ImagePicker,
      [Shape.HTML]: null,
      [Shape.MESH]: null,
    };

    // @ts-ignore
    this.context.pointInPathPickerFactory = pointInPathPickerFactory;

    this.addRenderingPlugin(new CanvasPickerPlugin());
  }
  destroy(): void {
    // @ts-ignore
    delete this.context.pointInPathPickerFactory;
    this.removeAllRenderingPlugins();
  }
}
