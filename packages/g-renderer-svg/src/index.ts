import {
  container,
  ContextService,
  EventService,
  RenderingPluginContribution,
  SHAPE,
  CanvasContainerModule,
  RENDERER,
  world,
  registerDisplayObjectPlugin,
} from '@antv/g';
import { ContainerModule } from 'inversify';
import { SVGContextService } from './services/SVGContextService';
import { SVGEventService } from './services/SVGEventService';
import { RenderShapePlugin } from './plugins/RenderShapePlugin';
import { ElementSVG } from './components/ElementSVG';
import { RectRenderer, ElementRenderer, ImageRenderer, TextRenderer, PolylineRenderer } from './shapes/paths';

world.registerComponent(ElementSVG);

/**
 * register shape renderers
 */
container.bind(ElementRenderer).to(RectRenderer).inSingletonScope().whenTargetNamed(SHAPE.Rect);
container.bind(ElementRenderer).to(ImageRenderer).inSingletonScope().whenTargetNamed(SHAPE.Image);
container.bind(ElementRenderer).to(PolylineRenderer).inSingletonScope().whenTargetNamed(SHAPE.Polyline);
container.bind(ElementRenderer).to(PolylineRenderer).inSingletonScope().whenTargetNamed(SHAPE.Polygon);
container.bind(ElementRenderer).to(TextRenderer).inSingletonScope().whenTargetNamed(SHAPE.Text);

/**
 * register rendering plugins
 */
// container.bind(RenderShapePlugin).toSelf().inSingletonScope();
// container.bind(DisplayObjectPluginContribution).toService(RenderShapePlugin);
registerDisplayObjectPlugin(RenderShapePlugin);

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
    })
  )
  .whenTargetNamed(RENDERER.SVG);
