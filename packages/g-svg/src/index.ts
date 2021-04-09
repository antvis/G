import {
  container,
  ContextService,
  EventService,
  RenderingPluginContribution,
  SHAPE,
  ShapeRenderer,
  CanvasContainerModule,
  RENDERER,
} from '@antv/g-core';
import { ContainerModule } from 'inversify';
import { SVGContextService } from './services/SVGContextService';
import { SVGEventService } from './services/SVGEventService';
import { SVGRendererPlugin } from './plugins/SVGRendererPlugin';
import { CircleRenderer } from './shapes/Circle';

container
  .bind(CanvasContainerModule)
  .toConstantValue(
    new ContainerModule((bind, unbind, isBound, rebind) => {
      /**
       * implements context service
       */
      bind(SVGContextService).toSelf().inSingletonScope();
      bind(ContextService).toService(SVGContextService);

      /**
       * implements event service
       */
      bind(SVGEventService).toSelf().inSingletonScope();
      bind(EventService).toService(SVGEventService);

      /**
       * register rendering plugins
       */
      bind(SVGRendererPlugin).toSelf().inSingletonScope();
      bind(RenderingPluginContribution).toService(SVGRendererPlugin);

      /**
       * register shape renderers
       */
      bind(ShapeRenderer).to(CircleRenderer).inSingletonScope().whenTargetNamed(SHAPE.Circle);
      // bind(ShapeRenderer).to(EllipseRenderer).inSingletonScope().whenTargetNamed(SHAPE.Ellipse);
      // bind(ShapeRenderer).to(ImageRenderer).inSingletonScope().whenTargetNamed(SHAPE.Image);
      // bind(ShapeRenderer).to(RectRenderer).inSingletonScope().whenTargetNamed(SHAPE.Rect);
    })
  )
  .whenTargetNamed(RENDERER.SVG);
