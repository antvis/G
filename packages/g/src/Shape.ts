// import { Entity, System } from '@antv/g-ecs';
// import { SyncHook, AsyncSeriesHook } from 'tapable';
// import { Renderable, SceneGraphNode } from './components';
// import { IShape, OnFrame, AnimateCfg, ElementAttrs, ShapeCfg } from './types';

// import { Group } from './Group';
// import { ShapePluginContribution, lazyInjectNamed } from './inversify.config';
// import { ContributionProvider } from './contribution-provider';
// import { AABB } from './shapes';

// export interface ShapePlugin {
//   apply(shape: Shape): void;
// }

// export function isShape(shape: any): shape is Shape {
//   return !!(shape && shape.isGroup);
// }

// export class Shape extends Group implements IShape {

//   // @lazyInjectNamed(ContributionProvider, ShapePluginContribution)
//   // private shapePluginContribution: ContributionProvider<ShapePlugin>;

//   // hooks = {
//   //   init: new SyncHook<[Entity]>(['entity']),
//   //   changeAttribute: new AsyncSeriesHook<[Entity, string, any]>(['entity', 'name', 'value']),
//   //   // hit: new SyncHook<[Entity]>(['entity']),
//   //   destroy: new SyncHook<[Entity]>(['entity']),
//   //   mounted: new AsyncSeriesHook<[any, Entity]>(['context', 'entity']),
//   //   render: new SyncHook<[any, Entity]>(['context', 'entity']),
//   //   unmounted: new AsyncSeriesHook<[any, Entity]>(['context', 'entity']),
//   // };

//   constructor(config: ShapeCfg) {
//     super({
//       zIndex: 0,
//       // visible: true,
//       capture: true,
//       ...config,
//     });
//   }

//   isGroup() {
//     return false;
//   }

//   /**
//    * create a instance of current shape
//    *
//    * @see https://doc.babylonjs.com/divingDeeper/mesh/copies/instances
//    */
//   createInstance(config?: ShapeCfg) {
//     // make itself invisible first
//     this.hide();

//     const shape = new Shape({
//       zIndex: 0,
//       visible: true,
//       capture: true,
//       type: this.entity.getComponent(SceneGraphNode).tagName,
//       ...this.config,
//       attrs: {
//         ...this.config.attrs, // copy attributes from root shape
//         ...config?.attrs,
//         instanceEntity: this.entity,
//       },
//     });

//     return shape;
//   }

//   removeInstance(shape: Shape) {
//     // TODO:
//   }
// }
