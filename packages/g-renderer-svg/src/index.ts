import {
  container,
  ContextService,
  RenderingPluginContribution,
  SHAPE,
  world,
  registerDisplayObjectPlugin,
  registerCanvasContainerModule,
} from '@antv/g';
import { ContainerModule } from 'inversify';
import { SVGContextService } from './services/SVGContextService';
import { RenderShapePlugin } from './plugins/RenderShapePlugin';
import { ElementSVG } from './components/ElementSVG';
import {
  RectRenderer,
  ElementRenderer,
  ImageRenderer,
  TextRenderer,
  PolylineRenderer,
  LineRenderer,
} from './shapes/paths';
import { FrameRendererPlugin } from './plugins/FrameRendererPlugin';
import { PickingPlugin } from './plugins/PickingPlugin';

export const RENDERER = 'svg';

world.registerComponent(ElementSVG);

/**
 * register shape renderers
 */
container.bind(ElementRenderer).to(RectRenderer).inSingletonScope().whenTargetNamed(SHAPE.Rect);
container.bind(ElementRenderer).to(ImageRenderer).inSingletonScope().whenTargetNamed(SHAPE.Image);
container.bind(ElementRenderer).to(LineRenderer).inSingletonScope().whenTargetNamed(SHAPE.Line);
container.bind(ElementRenderer).to(PolylineRenderer).inSingletonScope().whenTargetNamed(SHAPE.Polyline);
container.bind(ElementRenderer).to(PolylineRenderer).inSingletonScope().whenTargetNamed(SHAPE.Polygon);
container.bind(ElementRenderer).to(TextRenderer).inSingletonScope().whenTargetNamed(SHAPE.Text);

/**
 * register rendering plugins
 */
registerDisplayObjectPlugin(RenderShapePlugin);

registerCanvasContainerModule(
  new ContainerModule((bind, unbind, isBound, rebind) => {
    /**
     * implements context service
     */
    bind(SVGContextService).toSelf().inSingletonScope();
    bind(ContextService).toService(SVGContextService);

    bind(PickingPlugin).toSelf().inSingletonScope();
    bind(RenderingPluginContribution).toService(PickingPlugin);

    bind(FrameRendererPlugin).toSelf().inSingletonScope();
    bind(RenderingPluginContribution).toService(FrameRendererPlugin);
  }),
  RENDERER
);
