// import { LayoutEdges, LayoutEdgesOptions } from './LayoutEdges';
// import { LayoutEngine } from './LayoutEngine';
// import { DefaultLayoutRegistry } from './LayoutRegistry';
// import { LayoutChildren, LayoutChildrenOptions } from './LayoutChildren';
// import { LayoutContext } from './LayoutContext';

export * from './FragmentResult';
export * from './LayoutChildren';
export * from './LayoutContext';
export * from './LayoutDefinition';
export * from './LayoutEdges';
export * from './LayoutEngine';
export * from './LayoutFragment';
export * from './LayoutObject';
export * from './LayoutRegistry';
export * from './LayoutWorkTask';
export * from './types';

// const layoutRegistry = new DefaultLayoutRegistry();
// const layoutEdgesFactory = (options: LayoutEdgesOptions) => {
//   return new LayoutEdges(options);
// };
// const layoutContextFactory = (options: LayoutEdgesOptions) => {
//   // const layoutChildrenFactory = (childOptions: LayoutChildrenOptions) => {
//   //   return new LayoutChildren(childOptions);
//   // };

//   // container.register({
//   //   token: LayoutChildrenFactory,
//   //   useFactory: (childContext) => {
//   //     return (childOptions: LayoutChildrenOptions) => {
//   //       const childContainer = childContext.container.createChild();
//   //       childContainer.register({
//   //         token: LayoutChildrenOptions,
//   //         useValue: childOptions,
//   //       });
//   //       return childContainer.get(LayoutChildren);
//   //     };
//   //   },
//   // });

//   // container.register(FragmentResult);
//   // container.register({
//   //   token: FragmentResultFactory,
//   //   useFactory: (childContext) => {
//   //     return (childOptions, node) => {
//   //       const childContainer = childContext.container.createChild();
//   //       childContainer.register({
//   //         token: FragmentResultOptions,
//   //         useValue: childOptions,
//   //       });
//   //       childContainer.register({
//   //         token: ContextNode,
//   //         useValue: node,
//   //       });
//   //       return childContainer.get(FragmentResult);
//   //     };
//   //   },
//   // });

//   // container.register(LayoutFragment);
//   // container.register({
//   //   token: LayoutFragmentFactory,
//   //   useFactory: (childContext) => {
//   //     return (childOptions) => {
//   //       const childContainer = childContext.container.createChild();
//   //       childContainer.register({
//   //         token: LayoutFragmentOptions,
//   //         useValue: childOptions,
//   //       });
//   //       return childContainer.get(LayoutFragment);
//   //     };
//   //   },
//   // });

//   // const layoutChildrenFactory = container.get(LayoutChildrenFactory);
//   // const layoutFragmentFactory = (childContext) => {
//   //   return (childOptions) => {
//   //     return new LayoutFragment(childOptions);
//   //   };
//   // };
//   // const fragmentResultFactory = container.get(FragmentResultFactory);

//   // const layoutContext = new LayoutContext({
//   //   ...options,
//   //   layoutChildrenFactory,
//   //   layoutFragmentFactory,
//   //   fragmentResultFactory,
//   // });

//   // return layoutContext;
// }

// export const layoutEngine = new LayoutEngine(layoutRegistry);
export const layoutEngine = null;
