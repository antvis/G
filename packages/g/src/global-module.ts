import { EventEmitter } from 'eventemitter3';
import { decorate, injectable, Module } from 'mana-syringe';
import {
  CSSProperty,
  CSSPropertySyntaxFactory,
  DefaultStyleValueRegistry,
  LayoutRegistry,
} from './css';
import {
  ContextNode,
  FragmentResult,
  FragmentResultFactory,
  FragmentResultOptions,
  LayoutChildren,
  LayoutChildrenFactory,
  LayoutChildrenOptions,
  LayoutContext,
  LayoutContextFactory,
  LayoutContextOptions,
  LayoutEdges,
  LayoutEdgesFactory,
  LayoutEdgesOptions,
  LayoutEngine,
  LayoutFragment,
  LayoutFragmentFactory,
  LayoutFragmentOptions,
} from './css/layout';
import {
  CSSPropertyAngle,
  CSSPropertyClipPath,
  CSSPropertyColor,
  CSSPropertyFilter,
  CSSPropertyLengthOrPercentage,
  CSSPropertyLengthOrPercentage12,
  CSSPropertyLengthOrPercentage14,
  CSSPropertyLocalPosition,
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
import { DisplayObjectPool } from './DisplayObjectPool';
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

  // bind layout engine
  register(LayoutRegistry);
  register(LayoutEngine);
  register(LayoutEdges);
  register({
    token: LayoutEdgesFactory,
    useFactory: (context) => {
      return (options: LayoutEdgesOptions) => {
        const container = context.container.createChild();
        container.register({
          token: LayoutEdgesOptions,
          useValue: options,
        });
        return container.get(LayoutEdges);
      };
    },
  });

  register({
    token: LayoutContextFactory,
    useFactory: (context) => {
      return (options: LayoutEdgesOptions) => {
        const container = context.container.createChild();
        container.register(LayoutContext);
        container.register(LayoutChildren);

        container.register({
          token: LayoutChildrenFactory,
          useFactory: (childContext) => {
            return (childOptions: LayoutChildrenOptions) => {
              const childContainer = childContext.container.createChild();
              childContainer.register({
                token: LayoutChildrenOptions,
                useValue: childOptions,
              });
              return childContainer.get(LayoutChildren);
            };
          },
        });

        container.register(FragmentResult);
        container.register({
          token: FragmentResultFactory,
          useFactory: (childContext) => {
            return (childOptions, node) => {
              const childContainer = childContext.container.createChild();
              childContainer.register({
                token: FragmentResultOptions,
                useValue: childOptions,
              });
              childContainer.register({
                token: ContextNode,
                useValue: node,
              });
              return childContainer.get(FragmentResult);
            };
          },
        });

        container.register(LayoutFragment);
        container.register({
          token: LayoutFragmentFactory,
          useFactory: (childContext) => {
            return (childOptions) => {
              const childContainer = childContext.container.createChild();
              childContainer.register({
                token: LayoutFragmentOptions,
                useValue: childOptions,
              });
              return childContainer.get(LayoutFragment);
            };
          },
        });

        const layoutChildrenFactory = container.get(LayoutChildrenFactory);
        const layoutFragmentFactory = container.get(LayoutFragmentFactory);
        const fragmentResultFactory = container.get(FragmentResultFactory);

        container.register({
          token: LayoutContextOptions,
          useValue: {
            ...options,
            layoutChildrenFactory,
            layoutFragmentFactory,
            fragmentResultFactory,
          },
        });
        const layoutContext = container.get(LayoutContext);

        return layoutContext;
      };
    },
  });
});
