import {
  bindContributionProvider,
  ContextService,
  EventService,
  RendererFrameContribution,
  SHAPE,
  ShapeRenderer,
} from '@antv/g-core';
import { ContainerModule } from 'inversify';
import { Canvas } from './Canvas';
import { CircleRenderer, EllipseRenderer, ImageRenderer, RectRenderer } from './shapes';
import { BaseRenderer, StyleRendererContribution } from './shapes/Base';
import { FillRenderer } from './shapes/contributions/Fill';
import { StrokeRenderer } from './shapes/contributions/Stroke';
import { AlphaRenderer } from './shapes/contributions/Alpha';
import { Canvas2DContextService } from './services/Canvas2DContextService';
import { LineDashRenderer } from './shapes/contributions/LineDash';
import { RestRenderer } from './shapes/contributions/Rest';
import { StyleParser } from './shapes/StyleParser';
import { CanvasFrameRenderer } from './CanvasFrameRenderer';
import { ImagePool } from './shapes/ImagePool';
import { CanvasEventService } from './services/CanvasEventService';

export const module = new ContainerModule((bind) => {
  bind(Canvas2DContextService).toSelf().inSingletonScope();
  bind(ContextService).toService(Canvas2DContextService);

  bind(CanvasEventService).toSelf().inSingletonScope();
  bind(EventService).toService(CanvasEventService);

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
  bind(BaseRenderer).toSelf().inSingletonScope();
  bind(StyleParser).toSelf().inSingletonScope();

  /**
   * register shape renderers
   */
  bind(ShapeRenderer).to(CircleRenderer).inSingletonScope().whenTargetNamed(SHAPE.Circle);
  bind(ShapeRenderer).to(EllipseRenderer).inSingletonScope().whenTargetNamed(SHAPE.Ellipse);
  bind(ShapeRenderer).to(ImageRenderer).inSingletonScope().whenTargetNamed(SHAPE.Image);
  bind(ShapeRenderer).to(RectRenderer).inSingletonScope().whenTargetNamed(SHAPE.Rect);

  /**
   * bind frame renderer
   */
  bind(CanvasFrameRenderer).toSelf().inSingletonScope();
  bind(RendererFrameContribution).toService(CanvasFrameRenderer);
  bind(ImagePool).toSelf().inSingletonScope();
});

export { Canvas };
