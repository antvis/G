import { SHAPE, RenderingPluginContribution } from '@antv/g';
import { ContainerModule } from 'inversify';
import { CanvasPickerPlugin, PointInPathPickerFactory, PointInPathPicker } from './CanvasPickerPlugin';
import { isPointInPath as CirclePicker } from './Circle';
import { isPointInPath as EllipsePicker } from './Ellipse';

export const containerModule = new ContainerModule((bind, unbind, isBound, rebind) => {
  bind(PointInPathPickerFactory).toFactory<PointInPathPicker | null>((ctx) => (tagName: SHAPE) => {
    if (tagName === SHAPE.Circle) {
      return CirclePicker;
    } else if (tagName === SHAPE.Ellipse) {
      return EllipsePicker;
    }
    return null;
  });

  bind(CanvasPickerPlugin).toSelf().inSingletonScope();
  bind(RenderingPluginContribution).toService(CanvasPickerPlugin);
});
