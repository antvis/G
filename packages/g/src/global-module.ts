import type { interfaces } from 'inversify';
import { ContainerModule } from 'inversify';
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
import {
  StylePropertyParser,
  StylePropertyMerger,
  StylePropertyUpdater,
  StylePropertyParserFactory,
  StylePropertyUpdaterFactory,
  StylePropertyMergerFactory,
  clampedMergeNumbers,
  parseNumber,
  mergeColors,
  parseColor,
  updateOffsetPath,
  updateClipPath,
  updateZIndex,
  updateOffsetDistance,
  updateOrigin,
  updateTransform,
  updateTransformOrigin,
  parseTransform,
  mergeTransforms,
  ParsedColorStyleProperty,
  Interpolatable,
} from './property-handlers';
import { container } from './inversify.config';

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

  // bind style property handlers
  bind<interfaces.Factory<StylePropertyParser<any, any> | null>>(
    StylePropertyParserFactory,
  ).toFactory<StylePropertyParser<any, any> | null>((context: interfaces.Context) => {
    return (propertyName: string) => {
      if (context.container.isBoundNamed(StylePropertyParser, propertyName)) {
        return context.container.getNamed(StylePropertyParser, propertyName);
      }
      return null;
    };
  });
  bind<interfaces.Factory<StylePropertyUpdater<any> | null>>(
    StylePropertyUpdaterFactory,
  ).toFactory<StylePropertyUpdater<any> | null>((context: interfaces.Context) => {
    return (propertyName: string) => {
      if (context.container.isBoundNamed(StylePropertyUpdater, propertyName)) {
        return context.container.getNamed(StylePropertyUpdater, propertyName);
      }
      return null;
    };
  });
  bind<interfaces.Factory<StylePropertyMerger<any> | null>>(
    StylePropertyMergerFactory,
  ).toFactory<StylePropertyMerger<any> | null>((context: interfaces.Context) => {
    return (propertyName: string) => {
      if (context.container.isBoundNamed(StylePropertyMerger, propertyName)) {
        return context.container.getNamed(StylePropertyMerger, propertyName);
      }
      return null;
    };
  });

  // bind handlers for properties
  addPropertiesHandler<string | number, number>(
    ['opacity', 'fillOpacity', 'strokeOpacity', 'offsetDistance'],
    parseNumber,
    clampedMergeNumbers(0, 1),
    undefined,
  );
  addPropertiesHandler<string | number, number>(
    ['r', 'rx', 'ry', 'lineWidth', 'width', 'height'],
    parseNumber,
    clampedMergeNumbers(0, Infinity),
    undefined,
  );
  addPropertiesHandler<string, ParsedColorStyleProperty, number[]>(
    ['fill', 'stroke'],
    parseColor,
    mergeColors,
    undefined,
  );
  addPropertyHandler('clipPath', undefined, undefined, updateClipPath);
  addPropertyHandler('zIndex', undefined, undefined, updateZIndex);
  addPropertyHandler('offsetPath', undefined, undefined, updateOffsetPath);
  addPropertyHandler('offsetDistance', undefined, undefined, updateOffsetDistance);
  addPropertyHandler('origin', undefined, undefined, updateOrigin);
  addPropertyHandler('transformOrigin', undefined, undefined, updateTransformOrigin);
  addPropertyHandler('transform', parseTransform, mergeTransforms, updateTransform);
});

function addPropertyHandler<O, P, I extends Interpolatable = number>(
  property: string,
  parser: StylePropertyParser<O, P> | undefined,
  merger: StylePropertyMerger<P, I> | undefined,
  updater: StylePropertyUpdater<O> | undefined,
) {
  if (parser) {
    container.bind(StylePropertyParser).toConstantValue(parser).whenTargetNamed(property);
  }
  if (merger) {
    container.bind(StylePropertyMerger).toConstantValue(merger).whenTargetNamed(property);
  }
  if (updater) {
    container.bind(StylePropertyUpdater).toConstantValue(updater).whenTargetNamed(property);
  }
}
export function addPropertiesHandler<O, P, I extends Interpolatable = number>(
  properties: string[],
  parser: StylePropertyParser<O, P> | undefined,
  merger: StylePropertyMerger<P, I> | undefined,
  updater: StylePropertyUpdater<O> | undefined,
) {
  for (let i = 0; i < properties.length; i++) {
    addPropertyHandler<O, P, I>(properties[i], parser, merger, updater);
  }
}
