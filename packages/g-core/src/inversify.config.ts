import 'reflect-metadata';
import { Container, interfaces } from 'inversify';
import getDecorators from 'inversify-inject-decorators';
import { containerModule as ecsModule, World } from '@antv/g-ecs';
import {
  AABBCalculator,
  Timeline,
  Culling,
  DefaultAttributeAnimationUpdater,
  ColorAttributeAnimationUpdater,
  AttributeAnimationUpdaters,
  CullingStrategy,
  DefaultCullingStrategy,
  ShapeRendererFactory,
  ShapeRenderer,
} from './systems';
import { Animator, Sortable, Cullable, Geometry, SceneGraphNode, Renderable, Transform, Visible } from './components';
import { GroupPool } from './GroupPool';
import { SceneGraphAdapter, SceneGraphService } from './services';
import { bindContributionProvider } from './contribution-provider';
import { InitShapePlugin } from './plugins/InitShapePlugin';

export const ShapePluginContribution = Symbol('ShapePluginContribution');

const container = new Container();
// bind ECS
container.load(ecsModule);

// bind rendering plugins
bindContributionProvider(container, ShapePluginContribution);
container.bind(InitShapePlugin).toSelf().inSingletonScope();
container.bind(ShapePluginContribution).toService(InitShapePlugin);

// bind Shape & Group
container.bind(GroupPool).toSelf().inSingletonScope();

// shape renderer factory
container
  .bind<interfaces.Factory<ShapeRenderer<unknown>>>(ShapeRendererFactory)
  .toFactory<ShapeRenderer<unknown> | null>((context: interfaces.Context) => {
    return (shapeType: string) => {
      try {
        const isShapeRendererBound = context.container.isBoundNamed(ShapeRenderer, shapeType);
        if (!isShapeRendererBound) {
          console.error(`Missing renderer for ${shapeType} shape, please bind one first.`);
          return null;
        }
      } catch (e) {
        //
      }

      return context.container.getNamed<ShapeRenderer<unknown>>(ShapeRenderer, shapeType);
    };
  });

// bind css-select adapter
container.bind(SceneGraphAdapter).toSelf().inSingletonScope();
container.bind(SceneGraphService).toSelf().inSingletonScope();

// bind animation updaters
container.bind(DefaultAttributeAnimationUpdater).toSelf().inSingletonScope();
container.bind(ColorAttributeAnimationUpdater).toSelf().inSingletonScope();
container.bind(AttributeAnimationUpdaters).toService(DefaultAttributeAnimationUpdater);
container.bind(AttributeAnimationUpdaters).toService(ColorAttributeAnimationUpdater);

// culling strategies
bindContributionProvider(container, CullingStrategy);
container.bind(DefaultCullingStrategy).toSelf().inSingletonScope();
container.bind(CullingStrategy).toService(DefaultCullingStrategy);

// register components & systems
const world = container.get(World);
world
  .registerComponent(Transform)
  .registerComponent(SceneGraphNode)
  .registerComponent(Sortable)
  .registerComponent(Visible)
  .registerComponent(Cullable)
  .registerComponent(Geometry)
  .registerComponent(Animator)
  .registerComponent(Renderable);
world.registerSystem(Timeline).registerSystem(AABBCalculator).registerSystem(Culling);

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
