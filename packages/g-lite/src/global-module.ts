import { container } from 'tsyringe';
import {
  CSSPropertySyntaxFactory,
  DefaultStyleValueRegistry,
  PropertySyntax,
  StyleValueRegistry,
} from './css';
import {
  CSSPropertyAngle,
  CSSPropertyClipPath,
  CSSPropertyColor,
  CSSPropertyFilter,
  CSSPropertyLengthOrPercentage,
  CSSPropertyLengthOrPercentage12,
  CSSPropertyLengthOrPercentage14,
  CSSPropertyLocalPosition,
  CSSPropertyMarker,
  CSSPropertyNumber,
  CSSPropertyOffsetDistance,
  CSSPropertyOffsetPath,
  CSSPropertyOpacity,
  CSSPropertyPath,
  CSSPropertyPoints,
  CSSPropertyShadowBlur,
  CSSPropertyText,
  CSSPropertyTextTransform,
  CSSPropertyTransform,
  CSSPropertyTransformOrigin,
  CSSPropertyZIndex,
} from './css/properties';
// import { DisplayObjectPool } from './display-objects/DisplayObjectPool';
import {
  CircleUpdater,
  DefaultSceneGraphSelector,
  DefaultSceneGraphService,
  EllipseUpdater,
  GeometryAABBUpdater,
  GeometryUpdaterFactory,
  LineUpdater,
  OffscreenCanvasCreator,
  PathUpdater,
  PolylineUpdater,
  RectUpdater,
  SceneGraphSelector,
  SceneGraphSelectorFactory,
  SceneGraphService,
  TextService,
  TextUpdater,
} from './services';
import { Shape } from './types';

// container.register(DisplayObjectPool, { useClass: DisplayObjectPool });
container.registerSingleton(SceneGraphSelector, DefaultSceneGraphSelector);
container.register(SceneGraphSelectorFactory, {
  useFactory: (c) => c.resolve(SceneGraphSelector),
});
container.registerSingleton(SceneGraphService, DefaultSceneGraphService);

container.registerSingleton(OffscreenCanvasCreator);
container.registerSingleton(TextService);

container.registerSingleton(CircleUpdater);
container.registerSingleton(EllipseUpdater);
container.registerSingleton(RectUpdater);
container.registerSingleton(TextUpdater);
container.registerSingleton(LineUpdater);
container.registerSingleton(PolylineUpdater);
container.registerSingleton(PathUpdater);
container.register(GeometryUpdaterFactory, {
  useValue: (nodeName: string): GeometryAABBUpdater => {
    if (nodeName === Shape.CIRCLE) {
      return container.resolve(CircleUpdater);
    } else if (nodeName === Shape.ELLIPSE) {
      return container.resolve(EllipseUpdater);
    } else if (nodeName === Shape.RECT || nodeName === Shape.IMAGE || nodeName === Shape.GROUP) {
      return container.resolve(RectUpdater);
    } else if (nodeName === Shape.TEXT) {
      return container.resolve(TextUpdater);
    } else if (nodeName === Shape.LINE) {
      return container.resolve(LineUpdater);
    } else if (nodeName === Shape.POLYLINE || nodeName === Shape.POLYGON) {
      return container.resolve(PolylineUpdater);
    } else if (nodeName === Shape.PATH) {
      return container.resolve(PathUpdater);
    }
  },
});

container.registerSingleton(CSSPropertyNumber);
container.registerSingleton(CSSPropertyAngle);
container.registerSingleton(CSSPropertyClipPath);
container.registerSingleton(CSSPropertyColor);
container.registerSingleton(CSSPropertyFilter);
container.registerSingleton(CSSPropertyLengthOrPercentage);
container.registerSingleton(CSSPropertyLengthOrPercentage12);
container.registerSingleton(CSSPropertyLengthOrPercentage14);
container.registerSingleton(CSSPropertyLocalPosition);
container.registerSingleton(CSSPropertyOffsetDistance);
container.registerSingleton(CSSPropertyOffsetPath);
container.registerSingleton(CSSPropertyOpacity);
container.registerSingleton(CSSPropertyPath);
container.registerSingleton(CSSPropertyPoints);
container.registerSingleton(CSSPropertyShadowBlur);
container.registerSingleton(CSSPropertyText);
container.registerSingleton(CSSPropertyTextTransform);
container.registerSingleton(CSSPropertyTransform);
container.registerSingleton(CSSPropertyTransformOrigin);
container.registerSingleton(CSSPropertyZIndex);
container.registerSingleton(CSSPropertyMarker);

container.register(CSSPropertySyntaxFactory, {
  useValue: (syntax: string): any => {
    if (syntax === PropertySyntax.NUMBER) {
      return container.resolve(CSSPropertyNumber);
    } else if (syntax === PropertySyntax.ANGLE) {
      return container.resolve(CSSPropertyAngle);
    } else if (syntax === PropertySyntax.CLIP_PATH) {
      return container.resolve(CSSPropertyClipPath);
    } else if (syntax === PropertySyntax.PAINT || syntax === PropertySyntax.COLOR) {
      return container.resolve(CSSPropertyColor);
    } else if (syntax === PropertySyntax.FILTER) {
      return container.resolve(CSSPropertyFilter);
    } else if (syntax === PropertySyntax.LENGTH_PERCENTAGE || syntax === PropertySyntax.LENGTH) {
      return container.resolve(CSSPropertyLengthOrPercentage);
    } else if (syntax === PropertySyntax.LENGTH_PERCENTAGE_12) {
      return container.resolve(CSSPropertyLengthOrPercentage12);
    } else if (syntax === PropertySyntax.LENGTH_PERCENTAGE_14) {
      return container.resolve(CSSPropertyLengthOrPercentage14);
    } else if (syntax === PropertySyntax.COORDINATE) {
      return container.resolve(CSSPropertyLocalPosition);
    } else if (syntax === PropertySyntax.OFFSET_DISTANCE) {
      return container.resolve(CSSPropertyOffsetDistance);
    } else if (syntax === PropertySyntax.OFFSET_PATH) {
      return container.resolve(CSSPropertyOffsetPath);
    } else if (syntax === PropertySyntax.OPACITY_VALUE) {
      return container.resolve(CSSPropertyOpacity);
    } else if (syntax === PropertySyntax.PATH) {
      return container.resolve(CSSPropertyPath);
    } else if (syntax === PropertySyntax.LIST_OF_POINTS) {
      return container.resolve(CSSPropertyPoints);
    } else if (syntax === PropertySyntax.SHADOW_BLUR) {
      return container.resolve(CSSPropertyShadowBlur);
    } else if (syntax === PropertySyntax.TEXT) {
      return container.resolve(CSSPropertyText);
    } else if (syntax === PropertySyntax.TEXT_TRANSFORM) {
      return container.resolve(CSSPropertyTextTransform);
    } else if (syntax === PropertySyntax.TRANSFORM) {
      return container.resolve(CSSPropertyTransform);
    } else if (syntax === PropertySyntax.TRANSFORM_ORIGIN) {
      return container.resolve(CSSPropertyTransformOrigin);
    } else if (syntax === PropertySyntax.Z_INDEX) {
      return container.resolve(CSSPropertyZIndex);
    } else if (syntax === PropertySyntax.MARKER) {
      return container.resolve(CSSPropertyMarker);
    }
  },
});

container.register(StyleValueRegistry, DefaultStyleValueRegistry);

export const styleValueRegistry = container.resolve<StyleValueRegistry>(StyleValueRegistry);

// export const containerModule = Module((register) => {
// decorate(injectable(), EventEmitter);

// bind DisplayObject pool
// register(DisplayObjectPool);

// bind Selector
// register(DefaultSceneGraphSelector);
// register({
//   token: SceneGraphSelectorFactory,
//   useFactory: (context) => {
//     return () => context.container.get(SceneGraphSelector);
//   },
// });

// bind scenegraph service
// register(DefaultSceneGraphService);

// bind text service
// register(OffscreenCanvasCreator);
// register(TextService);

// bind aabb updater
// register(CircleUpdater);
// register(EllipseUpdater);
// register(RectUpdater);
// register(TextUpdater);
// register(LineUpdater);
// register(PolylineUpdater);
// register(PathUpdater);
// register({
//   token: GeometryUpdaterFactory,
//   useFactory: (context) => {
//     const cache = {};
//     return (tagName: Shape) => {
//       if (!cache[tagName]) {
//         if (context.container.isBoundNamed(GeometryAABBUpdater, tagName)) {
//           cache[tagName] = context.container.getNamed(GeometryAABBUpdater, tagName);
//         }
//       }
//       return cache[tagName];
//     };
//   },
// });

// bind CSS property handlers
// register(CSSPropertyNumber);
// register(CSSPropertyAngle);
// register(CSSPropertyClipPath);
// register(CSSPropertyColor);
// register(CSSPropertyFilter);
// register(CSSPropertyLengthOrPercentage);
// register(CSSPropertyLengthOrPercentage12);
// register(CSSPropertyLengthOrPercentage14);
// register(CSSPropertyLocalPosition);
// register(CSSPropertyOffsetDistance);
// register(CSSPropertyOffsetPath);
// register(CSSPropertyOpacity);
// register(CSSPropertyPath);
// register(CSSPropertyPoints);
// register(CSSPropertyShadowBlur);
// register(CSSPropertyText);
// register(CSSPropertyTextTransform);
// register(CSSPropertyTransform);
// register(CSSPropertyTransformOrigin);
// register(CSSPropertyZIndex);
// register(CSSPropertyMarker);
// register({
//   token: CSSPropertySyntaxFactory,
//   useFactory: (context) => {
//     const cache = {};
//     return (propertySyntax: string) => {
//       if (!cache[propertySyntax]) {
//         if (context.container.isBoundNamed(CSSProperty, propertySyntax)) {
//           cache[propertySyntax] = context.container.getNamed(CSSProperty, propertySyntax);
//         }
//       }
//       return cache[propertySyntax];
//     };
//   },
// });
// register(DefaultStyleValueRegistry);
// });
