import { Module } from '@alipay/mana-syringe';
import { Camera } from './camera';
import { CSSProperty, CSSPropertySyntaxFactory, DefaultStyleValueRegistry } from './css';
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
import { DisplayObjectPool } from './display-objects/DisplayObjectPool';
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
  TextService,
  TextUpdater,
} from './services';
import type { Shape } from './types';

export const containerModule = Module((register) => {
  // bind DisplayObject pool
  register(DisplayObjectPool);

  register(Camera);

  // bind Selector
  register(DefaultSceneGraphSelector);
  register({
    token: SceneGraphSelectorFactory,
    useFactory: (context) => {
      return () => context.container.get(SceneGraphSelector);
    },
  });

  // bind scenegraph service
  register(DefaultSceneGraphService);

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
      const cache = {};
      return (tagName: Shape) => {
        if (!cache[tagName]) {
          if (context.container.isBoundNamed(GeometryAABBUpdater, tagName)) {
            cache[tagName] = context.container.getNamed(GeometryAABBUpdater, tagName);
          }
        }
        return cache[tagName];
      };
    },
  });

  // bind CSS property handlers
  register(CSSPropertyNumber);
  register(CSSPropertyAngle);
  register(CSSPropertyClipPath);
  register(CSSPropertyColor);
  register(CSSPropertyFilter);
  register(CSSPropertyLengthOrPercentage);
  register(CSSPropertyLengthOrPercentage12);
  register(CSSPropertyLengthOrPercentage14);
  register(CSSPropertyLocalPosition);
  register(CSSPropertyOffsetDistance);
  register(CSSPropertyOffsetPath);
  register(CSSPropertyOpacity);
  register(CSSPropertyPath);
  register(CSSPropertyPoints);
  register(CSSPropertyShadowBlur);
  register(CSSPropertyText);
  register(CSSPropertyTextTransform);
  register(CSSPropertyTransform);
  register(CSSPropertyTransformOrigin);
  register(CSSPropertyZIndex);
  register(CSSPropertyMarker);
  register({
    token: CSSPropertySyntaxFactory,
    useFactory: (context) => {
      const cache = {};
      return (propertySyntax: string) => {
        if (!cache[propertySyntax]) {
          if (context.container.isBoundNamed(CSSProperty, propertySyntax)) {
            cache[propertySyntax] = context.container.getNamed(CSSProperty, propertySyntax);
          }
        }
        return cache[propertySyntax];
      };
    },
  });
  register(DefaultStyleValueRegistry);
});
