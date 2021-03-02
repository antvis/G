import {
  bindContributionProvider,
  ContextService,
  RendererFrameContribution,
  SHAPE,
  ShapeRenderer,
} from '@antv/g-core';
import { ContainerModule } from 'inversify';
import { Canvas } from './Canvas';
import { CircleRenderer, EllipseRenderer } from './shapes';
import { BaseRenderer, StyleRendererContribution } from './shapes/Base';
import { FillRenderer } from './shapes/contributions/Fill';
import { StrokeRenderer } from './shapes/contributions/Stroke';
import { AlphaRenderer } from './shapes/contributions/Alpha';
import { Canvas2DContext as Canvas2DContextService } from './Canvas2DContext';
import { LineDashRenderer } from './shapes/contributions/LineDash';
import { RestRenderer } from './shapes/contributions/Rest';
import { StyleParser } from './shapes/StyleParser';
import { CanvasFrameRenderer } from './contributions/CanvasFrameRenderer';

export const module = new ContainerModule((bind) => {
  bind(Canvas2DContextService).toSelf().inSingletonScope();
  bind(ContextService).toService(Canvas2DContextService);

  // register attribute renderer
  bindContributionProvider(bind, StyleRendererContribution);
  bind(FillRenderer).toSelf().inSingletonScope();
  bind(StrokeRenderer).toSelf().inSingletonScope();
  bind(AlphaRenderer).toSelf().inSingletonScope();
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
  bind(CircleRenderer).toSelf().inSingletonScope();
  bind(EllipseRenderer).toSelf().inSingletonScope();
  bind(ShapeRenderer).to(CircleRenderer).whenTargetNamed(SHAPE.Circle);
  bind(ShapeRenderer).to(EllipseRenderer).whenTargetNamed(SHAPE.Ellipse);

  /**
   * bind frame renderer
   */
  bind(CanvasFrameRenderer).toSelf().inSingletonScope();
  bind(RendererFrameContribution).toService(CanvasFrameRenderer);
});

export { Canvas };
