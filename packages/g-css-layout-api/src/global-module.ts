import { Module } from '@antv/g-lite';
import {
  ContextNode,
  FragmentResult,
  FragmentResultFactory,
  FragmentResultOptions,
} from './FragmentResult';
import { LayoutChildren, LayoutChildrenFactory, LayoutChildrenOptions } from './LayoutChildren';
import { LayoutContext, LayoutContextFactory, LayoutContextOptions } from './LayoutContext';
import { LayoutEdges, LayoutEdgesFactory, LayoutEdgesOptions } from './LayoutEdges';
import { LayoutEngine } from './LayoutEngine';
import { LayoutFragment, LayoutFragmentFactory, LayoutFragmentOptions } from './LayoutFragment';
import { DefaultLayoutRegistry } from './LayoutRegistry';

export const containerModule = Module((register) => {
  // bind layout engine
  register(DefaultLayoutRegistry);
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
