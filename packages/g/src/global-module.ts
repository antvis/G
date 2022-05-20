import { Module, injectable, decorate } from 'mana-syringe';
import { EventEmitter } from 'eventemitter3';
import { DisplayObjectPool } from './DisplayObjectPool';
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
  TextService,
  OffscreenCanvasCreator,
  DefaultSceneGraphService,
  DefaultSceneGraphSelector,
  SceneGraphSelector,
  SceneGraphSelectorFactory,
} from './services';
import type { Shape } from './types';
import { LayoutRegistry, DefaultStyleValueRegistry } from './css';
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
  register(LayoutRegistry);
  register(DefaultStyleValueRegistry);

  // bind layout engine
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
