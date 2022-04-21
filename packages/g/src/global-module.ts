import { Module, injectable, decorate } from 'mana-syringe';
import { EventEmitter } from 'eventemitter3';
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
  TextUpdater,
} from './services/aabb';
import type { Shape } from './types';
import { TextService } from './services/text';
import { OffscreenCanvasCreator } from './services/text/OffscreenCanvasCreator';
import {
  DefaultSceneGraphSelector,
  SceneGraphSelector,
  SceneGraphSelectorFactory,
} from './services/SceneGraphSelector';
import {
  LayoutRegistry,
  StyleValueRegistry,
  CSSPropertyLocalPosition,
  CSSPropertyLengthOrPercentage,
  CSSPropertyAnchor,
  CSSPropertyClipPath,
  CSSPropertyColor,
  CSSPropertyFilter,
  CSSPropertyLineDash,
  CSSPropertyOffsetDistance,
  CSSPropertyOffsetPath,
  CSSPropertyOpacity,
  CSSPropertyPath,
  CSSPropertyPoints,
  CSSPropertyText,
  CSSPropertyTextTransform,
  CSSPropertyTransform,
  CSSPropertyTransformOrigin,
  CSSPropertyZIndex,
  CSSPropertyShadowBlur,
  CSSPropertyVisibility,
} from './css';

export const containerModule = Module((register) => {
  decorate(injectable(), EventEmitter);

  // bind DisplayObject pool
  register(DisplayObjectPool);

  // bind Selector
  register(DefaultSceneGraphSelector);
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
  register(LayoutRegistry);
  register(StyleValueRegistry);
  register(CSSPropertyLengthOrPercentage);
  register(CSSPropertyLocalPosition);
  register(CSSPropertyOpacity);
  register(CSSPropertyColor);
  register(CSSPropertyFilter);
  register(CSSPropertyLineDash);
  register(CSSPropertyShadowBlur);
  register(CSSPropertyOffsetPath);
  register(CSSPropertyOffsetDistance);
  register(CSSPropertyAnchor);
  register(CSSPropertyZIndex);
  register(CSSPropertyTransform);
  register(CSSPropertyTransformOrigin);
  register(CSSPropertyPath);
  register(CSSPropertyPoints);
  register(CSSPropertyClipPath);
  register(CSSPropertyText);
  register(CSSPropertyTextTransform);
  register(CSSPropertyVisibility);
});
