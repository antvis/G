import type { interfaces } from 'inversify';
import { ContainerModule } from 'inversify';
import {
  DefaultAttributeAnimationUpdater,
  ColorAttributeAnimationUpdater,
  AttributeAnimationUpdaters,
} from './systems';
import { DisplayObjectPool } from './DisplayObjectPool';
import { SceneGraphService } from './services/SceneGraphService';
import {
  CircleUpdater,
  EllipseUpdater,
  GeometryAABBUpdater,
  GeometryUpdaterFactory,
  LineUpdater,
  PathUpdater,
  PolylineUpdater,
  RectUpdater,
} from './services/aabb';
import { SHAPE } from './types';
import { TextService } from './services/text';
import { TextUpdater } from './services/aabb/TextUpdater';
import { OffscreenCanvasCreator } from './services/text/OffscreenCanvasCreator';
import {
  DefaultSceneGraphSelector,
  SceneGraphSelector,
  SceneGraphSelectorFactory,
} from './services/SceneGraphSelector';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const containerModule = new ContainerModule((bind, unbind, isBound, rebind) => {
  // bind DisplayObject pool
  bind(DisplayObjectPool).toSelf().inSingletonScope();

  // bind Selector
  bind(DefaultSceneGraphSelector).toSelf().inSingletonScope();
  bind(SceneGraphSelector).toService(DefaultSceneGraphSelector);
  bind<interfaces.Factory<SceneGraphSelector>>(SceneGraphSelectorFactory).toFactory(
    (context: interfaces.Context) => {
      // resolve selector implementation at runtime
      return () => context.container.get(SceneGraphSelector);
    },
  );
  bind(SceneGraphService).toSelf().inSingletonScope();

  // bind text service
  bind(OffscreenCanvasCreator).toSelf().inSingletonScope();
  bind(TextService).toSelf().inSingletonScope();

  // bind aabb updater
  bind(GeometryAABBUpdater).to(CircleUpdater).inSingletonScope().whenTargetNamed(SHAPE.Circle);
  bind(GeometryAABBUpdater).to(EllipseUpdater).inSingletonScope().whenTargetNamed(SHAPE.Ellipse);
  bind(GeometryAABBUpdater).to(RectUpdater).inSingletonScope().whenTargetNamed(SHAPE.Rect);
  bind(GeometryAABBUpdater).to(RectUpdater).inSingletonScope().whenTargetNamed(SHAPE.Image);
  bind(GeometryAABBUpdater).to(TextUpdater).inSingletonScope().whenTargetNamed(SHAPE.Text);
  bind(GeometryAABBUpdater).to(LineUpdater).inSingletonScope().whenTargetNamed(SHAPE.Line);
  bind(GeometryAABBUpdater).to(PolylineUpdater).inSingletonScope().whenTargetNamed(SHAPE.Polyline);
  bind(GeometryAABBUpdater).to(PolylineUpdater).inSingletonScope().whenTargetNamed(SHAPE.Polygon);
  bind(GeometryAABBUpdater).to(PathUpdater).inSingletonScope().whenTargetNamed(SHAPE.Path);
  bind<interfaces.Factory<GeometryAABBUpdater | null>>(
    GeometryUpdaterFactory,
  ).toFactory<GeometryAABBUpdater | null>((context: interfaces.Context) => {
    return (tagName: SHAPE) => {
      if (context.container.isBoundNamed(GeometryAABBUpdater, tagName)) {
        return context.container.getNamed(GeometryAABBUpdater, tagName);
      }
      return null;
    };
  });

  // bind animation updaters
  bind(DefaultAttributeAnimationUpdater).toSelf().inSingletonScope();
  bind(ColorAttributeAnimationUpdater).toSelf().inSingletonScope();
  bind(AttributeAnimationUpdaters).toService(DefaultAttributeAnimationUpdater);
  bind(AttributeAnimationUpdaters).toService(ColorAttributeAnimationUpdater);
});
