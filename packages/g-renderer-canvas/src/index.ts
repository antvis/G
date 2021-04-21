import { ContainerModule } from 'inversify';
import {
  container,
  RENDERER,
  CanvasContainerModule,
  bindContributionProvider,
  ContextService,
  EventService,
  RenderingPluginContribution,
  SHAPE,
  registerDisplayObjectPlugin,
} from '@antv/g';
import { DefaultRenderer, StyleRenderer } from './shapes/styles';
import { Canvas2DContextService } from './services/Canvas2DContextService';
import { ImageRenderer } from './shapes/styles/Image';
import { StyleParser } from './shapes/StyleParser';
import { CanvasEventService } from './services/CanvasEventService';
import { DirtyRectanglePlugin } from './plugins/DirtyRectanglePlugin';
import { ImagePool } from './shapes/ImagePool';
import { RenderShapePlugin } from './plugins/RenderShapePlugin';
import { LoadImagePlugin } from './plugins/LoadImagePlugin';
import { PathGenerator, CirclePath, EllipsePath, RectPath, LinePath, PolylinePath, PolygonPath } from './shapes/paths';
import { PointInPathPicker, CirclePicker, EllipsePicker } from './shapes/picking';
import { TextRenderer } from './shapes/styles/Text';

container.bind(ImagePool).toSelf().inSingletonScope();

/**
 * register shape renderers
 */
container.bind(PathGenerator).toFunction(CirclePath).whenTargetNamed(SHAPE.Circle);
container.bind(PathGenerator).toFunction(EllipsePath).whenTargetNamed(SHAPE.Ellipse);
container.bind(PathGenerator).toFunction(RectPath).whenTargetNamed(SHAPE.Rect);
container.bind(PathGenerator).toFunction(LinePath).whenTargetNamed(SHAPE.Line);
container.bind(PathGenerator).toFunction(PolylinePath).whenTargetNamed(SHAPE.Polyline);
container.bind(PathGenerator).toFunction(PolygonPath).whenTargetNamed(SHAPE.Polygon);

container.bind(PointInPathPicker).toFunction(CirclePicker).whenTargetNamed(SHAPE.Circle);
container.bind(PointInPathPicker).toFunction(EllipsePicker).whenTargetNamed(SHAPE.Ellipse);

container.bind(StyleRenderer).to(DefaultRenderer).inSingletonScope().whenTargetNamed(SHAPE.Circle);
container.bind(StyleRenderer).to(DefaultRenderer).inSingletonScope().whenTargetNamed(SHAPE.Ellipse);
container.bind(StyleRenderer).to(DefaultRenderer).inSingletonScope().whenTargetNamed(SHAPE.Rect);
container.bind(StyleRenderer).to(DefaultRenderer).inSingletonScope().whenTargetNamed(SHAPE.Line);
container.bind(StyleRenderer).to(DefaultRenderer).inSingletonScope().whenTargetNamed(SHAPE.Polyline);
container.bind(StyleRenderer).to(DefaultRenderer).inSingletonScope().whenTargetNamed(SHAPE.Polygon);
container.bind(StyleRenderer).to(ImageRenderer).inSingletonScope().whenTargetNamed(SHAPE.Image);
container.bind(StyleRenderer).to(TextRenderer).inSingletonScope().whenTargetNamed(SHAPE.Text);

container.bind(StyleParser).toSelf().inSingletonScope();

registerDisplayObjectPlugin(RenderShapePlugin);
registerDisplayObjectPlugin(LoadImagePlugin);

container
  .bind(CanvasContainerModule)
  .toConstantValue(
    new ContainerModule((bind, unbind, isBound, rebind) => {
      /**
       * implements ContextService
       */
      bind(Canvas2DContextService).toSelf().inSingletonScope();
      bind(ContextService).toService(Canvas2DContextService);

      /**
       * implements EventService
       */
      bind(CanvasEventService).toSelf().inSingletonScope();
      bind(EventService).toService(CanvasEventService);

      /**
       * register rendering plugins
       */
      bind(DirtyRectanglePlugin).toSelf().inSingletonScope();
      bind(RenderingPluginContribution).toService(DirtyRectanglePlugin);
    })
  )
  .whenTargetNamed(RENDERER.Canvas);
