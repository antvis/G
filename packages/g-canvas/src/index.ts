import { container, RENDERER, CanvasContainerModule } from '@antv/g-core';
import { ContainerModule } from 'inversify';
import {
  bindContributionProvider,
  ContextService,
  EventService,
  RenderingPluginContribution,
  SHAPE,
  ShapeRenderer,
} from '@antv/g-core';
import { CircleRenderer, EllipseRenderer, ImageRenderer, RectRenderer } from './shapes';
import { StyleRendererContribution } from './shapes/Base';
import { FillRenderer } from './shapes/contributions/Fill';
import { StrokeRenderer } from './shapes/contributions/Stroke';
import { AlphaRenderer } from './shapes/contributions/Alpha';
import { Canvas2DContextService } from './services/Canvas2DContextService';
import { LineDashRenderer } from './shapes/contributions/LineDash';
import { RestRenderer } from './shapes/contributions/Rest';
import { StyleParser } from './shapes/StyleParser';
import { CanvasEventService } from './services/CanvasEventService';
import { DirtyRectanglePlugin } from './plugins/DirtyRectanglePlugin';
import { ImagePool } from './shapes/ImagePool';

container.bind(ImagePool).toSelf().inSingletonScope();
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

      // register attribute renderer
      bindContributionProvider(bind, StyleRendererContribution);
      bind(AlphaRenderer).toSelf().inSingletonScope();
      bind(FillRenderer).toSelf().inSingletonScope();
      bind(StrokeRenderer).toSelf().inSingletonScope();
      bind(LineDashRenderer).toSelf().inSingletonScope();
      bind(RestRenderer).toSelf().inSingletonScope();
      bind(StyleRendererContribution).toService(FillRenderer);
      bind(StyleRendererContribution).toService(StrokeRenderer);
      bind(StyleRendererContribution).toService(AlphaRenderer);
      bind(StyleRendererContribution).toService(LineDashRenderer);
      bind(StyleRendererContribution).toService(RestRenderer);
      bind(StyleParser).toSelf().inSingletonScope();

      /**
       * register shape renderers
       */
      bind(ShapeRenderer).to(CircleRenderer).inSingletonScope().whenTargetNamed(SHAPE.Circle);
      bind(ShapeRenderer).to(EllipseRenderer).inSingletonScope().whenTargetNamed(SHAPE.Ellipse);
      bind(ShapeRenderer).to(ImageRenderer).inSingletonScope().whenTargetNamed(SHAPE.Image);
      bind(ShapeRenderer).to(RectRenderer).inSingletonScope().whenTargetNamed(SHAPE.Rect);
    })
  )
  .whenTargetNamed(RENDERER.Canvas);
