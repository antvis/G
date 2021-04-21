import 'reflect-metadata';
import { Container, interfaces } from 'inversify';
import getDecorators from 'inversify-inject-decorators';
import { containerModule as ecsModule, World } from '@antv/g-ecs';
import {
  Timeline,
  DefaultAttributeAnimationUpdater,
  ColorAttributeAnimationUpdater,
  AttributeAnimationUpdaters,
} from './systems';
import { Animator, Sortable, Cullable, Geometry, SceneGraphNode, Renderable, Transform } from './components';
import { DisplayObject } from './DisplayObject';
import { DisplayObjectPool } from './DisplayObjectPool';
import { SceneGraphAdapter, SceneGraphService } from './services';
import { bindContributionProvider, ContributionProvider } from './contribution-provider';
import { InitShapePlugin } from './plugins/shape/InitShapePlugin';
import { UpdateAttributePlugin } from './plugins/shape/UpdateAttributePlugin';
import { CircleUpdater, EllipseUpdater, GeometryAABBUpdater, RectUpdater } from './services/aabb';
import { SHAPE } from './types';
import { TextService } from './services/text';
import { TextUpdater } from './services/aabb/TextUpdater';
import { OffscreenCanvasCreator } from './services/text/OffscreenCanvasCreator';
import { Camera } from './Camera';
import { registerDisplayObjectPlugin } from './hooks';

const container = new Container();
// bind ECS
container.load(ecsModule);

// bind camera
container.bind(Camera).toSelf().inSingletonScope();

// bind global DisplayObject plugins
// bindContributionProvider(container, DisplayObjectPluginContribution);
// container.bind(InitShapePlugin).toSelf().inSingletonScope();
// container.bind(DisplayObjectPluginContribution).toService(InitShapePlugin);
// container.bind(UpdateAttributePlugin).toSelf().inSingletonScope();
// container.bind(DisplayObjectPluginContribution).toService(UpdateAttributePlugin);

// bind DisplayObject pool
container.bind(DisplayObjectPool).toSelf().inSingletonScope();

// bind css-select adapter
container.bind(SceneGraphAdapter).toSelf().inSingletonScope();
container.bind(SceneGraphService).toSelf().inSingletonScope();

// bind text service
container.bind(OffscreenCanvasCreator).toSelf().inSingletonScope();
container.bind(TextService).toSelf().inSingletonScope();

// bind aabb updater
container.bind(GeometryAABBUpdater).to(CircleUpdater).inSingletonScope().whenTargetNamed(SHAPE.Circle);
container.bind(GeometryAABBUpdater).to(EllipseUpdater).inSingletonScope().whenTargetNamed(SHAPE.Ellipse);
container.bind(GeometryAABBUpdater).to(RectUpdater).inSingletonScope().whenTargetNamed(SHAPE.Rect);
container.bind(GeometryAABBUpdater).to(RectUpdater).inSingletonScope().whenTargetNamed(SHAPE.Image);
container.bind(GeometryAABBUpdater).to(TextUpdater).inSingletonScope().whenTargetNamed(SHAPE.Text);

// bind animation updaters
container.bind(DefaultAttributeAnimationUpdater).toSelf().inSingletonScope();
container.bind(ColorAttributeAnimationUpdater).toSelf().inSingletonScope();
container.bind(AttributeAnimationUpdaters).toService(DefaultAttributeAnimationUpdater);
container.bind(AttributeAnimationUpdaters).toService(ColorAttributeAnimationUpdater);

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
