import 'reflect-metadata';
import { Container, interfaces } from 'inversify';
import getDecorators from 'inversify-inject-decorators';
import { containerModule as ecsModule, World } from '@antv/g-ecs';
import { containerModule as globalModule } from './global-module';
import { Timeline } from './systems';
import { Animator, Sortable, Cullable, Geometry, SceneGraphNode, Renderable, Transform } from './components';
import { InitShapePlugin } from './plugins/shape/InitShapePlugin';
import { UpdateAttributePlugin } from './plugins/shape/UpdateAttributePlugin';
import { registerDisplayObjectPlugin } from './hooks';

export const CanvasContainerModuleFactory = Symbol('CanvasContainerModuleFactory');

const container = new Container();
// bind ECS
container.load(ecsModule);

container.load(globalModule);

// container.bind(CanvasContainerModuleFactory).toFactory(context => (config: CanvasConfig) => {
//   const childContainer = context.container.createChild();
//   const { renderer, ...rest } = config;
//   const mergedConfig = {
//     renderer: {
//       type: '', // set renderer's type later
//       enableAutoRendering: true,
//       enableDirtyRectangleRendering: true,
//       ...(isString(config.renderer) ? { type: config.renderer } : config.renderer),
//     },
//     cursor: 'default',
//     ...rest,
//   };
//   childContainer.bind(CanvasConfig).toConstantValue(mergedConfig);
//   childContainer.bind(RenderingContext).toConstantValue({
//     /**
//      * the root node in scene graph
//      */
//     root: new DisplayObject({
//       id: '_root',
//       attrs: {},
//     }),

//     /**
//      * spatial index with RTree which can speed up the search for AABBs
//      */
//     rBush: new RBush<RBushNode>(),

//     /**
//      * all the entities
//      */
//     entities: [],

//     dirtyRectangle: undefined,
//     dirtyEntities: [],
//   });
//   // childContainer.bind(CanvasManager).toSelf().inSingletonScope();
//   // const manager = childContainer.get(CanvasManager);
//   // manager.setContainer(childContainer);
//   return new CanvasManager(childContainer);
// });

// register components & systems
const world = container.get(World);
world
  .registerComponent(Transform)
  .registerComponent(SceneGraphNode)
  .registerComponent(Sortable)
  .registerComponent(Cullable)
  .registerComponent(Geometry)
  .registerComponent(Animator)
  .registerComponent(Renderable);
world.registerSystem(Timeline);

registerDisplayObjectPlugin(InitShapePlugin);
registerDisplayObjectPlugin(UpdateAttributePlugin);

let lastTime = new Date().getTime();
const tick = async () => {
  const time = new Date().getTime();
  const delta = time - lastTime;
  await world.execute(delta, time);
  lastTime = time;
  window.requestAnimationFrame(tick);
};
tick();

// 支持使用 new 而非容器实例化的场景，同时禁止 lazyInject cache
// @see https://github.com/inversify/inversify-inject-decorators#caching-vs-non-caching-behaviour
const DECORATORS = getDecorators(container, false);

interface IBabelPropertyDescriptor extends PropertyDescriptor {
  initializer(): any;
}
// Add babel legacy decorators support
// @see https://github.com/inversify/InversifyJS/issues/1050
// @see https://github.com/inversify/InversifyJS/issues/1026#issuecomment-504936034
const lazyInject = (serviceIdentifier: interfaces.ServiceIdentifier<any>) => {
  const original = DECORATORS.lazyInject(serviceIdentifier);
  // the 'descriptor' parameter is actually always defined for class fields for Babel, but is considered undefined for TSC
  // so we just hack it with ?/! combination to avoid "TS1240: Unable to resolve signature of property decorator when called as an expression"
  return function (this: any, proto: any, key: string, descriptor?: IBabelPropertyDescriptor): void {
    // make it work as usual
    original.call(this, proto, key);
    // return link to proto, so own value wont be 'undefined' after component's creation
    if (descriptor) {
      descriptor.initializer = () => {
        return proto[key];
      };
    }
  };
};
const lazyMultiInject = (serviceIdentifier: interfaces.ServiceIdentifier<any>) => {
  const original = DECORATORS.lazyMultiInject(serviceIdentifier);
  // the 'descriptor' parameter is actually always defined for class fields for Babel, but is considered undefined for TSC
  // so we just hack it with ?/! combination to avoid "TS1240: Unable to resolve signature of property decorator when called as an expression"
  return function (this: any, proto: any, key: string, descriptor?: IBabelPropertyDescriptor): void {
    // make it work as usual
    original.call(this, proto, key);
    if (descriptor) {
      // return link to proto, so own value wont be 'undefined' after component's creation
      descriptor!.initializer = () => {
        return proto[key];
      };
    }
  };
};
const lazyInjectNamed = (serviceIdentifier: interfaces.ServiceIdentifier<any>, named: string | symbol) => {
  // @ts-ignore
  const original = DECORATORS.lazyInjectNamed(serviceIdentifier, named);
  // the 'descriptor' parameter is actually always defined for class fields for Babel, but is considered undefined for TSC
  // so we just hack it with ?/! combination to avoid "TS1240: Unable to resolve signature of property decorator when called as an expression"
  return function (this: any, proto: any, key: string, descriptor?: IBabelPropertyDescriptor): void {
    // make it work as usual
    original.call(this, proto, key);
    if (descriptor) {
      // return link to proto, so own value wont be 'undefined' after component's creation
      descriptor!.initializer = () => {
        return proto[key];
      };
    }
  };
};

export { world, container, lazyInject, lazyMultiInject, lazyInjectNamed };
