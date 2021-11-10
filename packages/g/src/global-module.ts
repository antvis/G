import { Module, GlobalContainer } from 'mana-syringe';
import { DisplayObjectPool } from './DisplayObjectPool';
import { DefaultSceneGraphService, SceneGraphService } from './services/SceneGraphService';
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
  updateGeometry,
  updateLocalPosition,
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
  parsePath,
  parsePoints,
  mergePaths,
  mergeNumbers,
  mergeNumberLists,
  parseFilter,
  updateAnchor,
} from './property-handlers';

export const globalContainer = GlobalContainer;

export const containerModule = Module((register) => {
  // bind DisplayObject pool
  register(DisplayObjectPool);

  // bind Selector
  register({ token: SceneGraphSelector, useClass: DefaultSceneGraphSelector });
  register({
    token: SceneGraphSelectorFactory,
    useFactory: (context) => {
      return () => context.container.get(SceneGraphSelector);
    },
  });

  // bind scenegraph service
  register({ token: SceneGraphService, useClass: DefaultSceneGraphService });

  // bind text service
  register(OffscreenCanvasCreator);
  register(TextService);

  // bind aabb updater
  register(CircleUpdater);
  register(EllipseUpdater);
  register(RectUpdater);
  register(TextUpdater);
  register(LineUpdater);
  register(PolylineUpdater);
  register(PathUpdater);
  register({
    token: GeometryUpdaterFactory,
    useFactory: (context) => {
      return (tagName: SHAPE) => {
        if (context.container.isBoundNamed(GeometryAABBUpdater, tagName)) {
          return context.container.getNamed(GeometryAABBUpdater, tagName);
        }
        return null;
      };
    },
  });

  // bind style property handlers
  register({
    token: StylePropertyParserFactory,
    useFactory: (context) => {
      return (propertyName: string) => {
        if (context.container.isBoundNamed(StylePropertyParser, propertyName)) {
          return context.container.getNamed(StylePropertyParser, propertyName);
        }
        return null;
      };
    },
  });
  register({
    token: StylePropertyUpdaterFactory,
    useFactory: (context) => {
      return (propertyName: string) => {
        if (context.container.isBoundNamed(StylePropertyUpdater, propertyName)) {
          return context.container.getAllNamed(StylePropertyUpdater, propertyName);
        }
        return null;
      };
    },
  });
  register({
    token: StylePropertyMergerFactory,
    useFactory: (context) => {
      return (propertyName: string) => {
        if (context.container.isBoundNamed(StylePropertyMerger, propertyName)) {
          return context.container.getNamed(StylePropertyMerger, propertyName);
        }
        return null;
      };
    },
  });

  function addPropertyHandler<O, P, I extends Interpolatable = number>(
    property: string,
    parser: StylePropertyParser<O, P> | undefined,
    merger: StylePropertyMerger<P, I> | undefined,
    updater: StylePropertyUpdater<O> | undefined,
  ) {
    if (parser) {
      register({ token: { token: StylePropertyParser, named: property }, useValue: parser });
    }
    if (merger) {
      register({ token: { token: StylePropertyMerger, named: property }, useValue: merger });
    }
    if (updater) {
      register({ token: { token: StylePropertyUpdater, named: property }, useValue: updater });
    }
  }
  function addPropertiesHandler<O, P, I extends Interpolatable = number>(
    properties: string[],
    parser: StylePropertyParser<O, P> | undefined,
    merger: StylePropertyMerger<P, I> | undefined,
    updater: StylePropertyUpdater<O> | undefined,
  ) {
    for (let i = 0; i < properties.length; i++) {
      addPropertyHandler<O, P, I>(properties[i], parser, merger, updater);
    }
  }

  // bind handlers for properties
  addPropertiesHandler<number, number>(
    ['opacity', 'fillOpacity', 'strokeOpacity', 'offsetDistance'],
    parseNumber,
    clampedMergeNumbers(0, 1),
    undefined,
  );
  addPropertiesHandler<number, number>(
    ['r', 'rx', 'ry', 'lineWidth', 'width', 'height', 'shadowBlur'],
    parseNumber,
    clampedMergeNumbers(0, Infinity),
    undefined,
  );
  // @ts-ignore
  addPropertiesHandler<number[], number[]>(['lineDash'], undefined, mergeNumberLists, undefined);
  addPropertiesHandler<number, number>(
    ['x1', 'x2', 'y1', 'y2', 'lineDashOffset', 'shadowOffsetX', 'shadowOffsetY'],
    parseNumber,
    mergeNumbers,
    undefined,
  );

  addPropertiesHandler<number, number>(
    [
      'x1',
      'x2',
      'y1',
      'y2', // Line
      'r', // Circle
      'rx',
      'ry', // Ellipse
      'width',
      'height', // Image/Rect
      'path', // Path
      'points', // Polyline/Polygon
      'text', // Text
      'shadowBlur',
      'shadowOffsetX',
      'shadowOffsetY',
      'lineWidth',
      'filter',
      'font',
      'fontSize',
      'fontFamily',
      'fontStyle',
      'fontWeight',
      'fontVariant',
      'lineHeight',
      'letterSpacing',
      'padding',
      'wordWrap',
      'wordWrapWidth',
      'leading',
      'textBaseline',
      'textAlign',
      'whiteSpace',
    ],
    undefined,
    undefined,
    updateGeometry,
  );
  addPropertiesHandler<string, ParsedColorStyleProperty, number[]>(
    ['fill', 'stroke', 'shadowColor'],
    parseColor,
    mergeColors,
    undefined,
  );
  addPropertyHandler('clipPath', undefined, undefined, updateClipPath);
  addPropertyHandler('zIndex', undefined, undefined, updateZIndex);
  addPropertyHandler('offsetPath', undefined, undefined, updateOffsetPath);
  addPropertyHandler('offsetDistance', undefined, undefined, updateOffsetDistance);
  addPropertyHandler('origin', undefined, undefined, updateOrigin);
  // @ts-ignore
  addPropertyHandler('transformOrigin', undefined, undefined, updateTransformOrigin);
  // @ts-ignore
  addPropertyHandler('transform', parseTransform, mergeTransforms, updateTransform);

  // Path.path
  // @ts-ignore
  addPropertyHandler('path', parsePath, mergePaths, undefined);
  // Polyline.points Polygon.points
  // @ts-ignore
  addPropertyHandler('points', parsePoints, undefined, undefined);

  // update local position
  addPropertiesHandler<number, number>(
    ['x', 'y', 'points', 'path', 'x1', 'x2', 'y1', 'y2'],
    // ['x', 'y'],
    undefined,
    undefined,
    updateLocalPosition,
  );

  addPropertyHandler('filter', parseFilter, undefined, undefined);

  addPropertyHandler('anchor', undefined, undefined, updateAnchor);
});
