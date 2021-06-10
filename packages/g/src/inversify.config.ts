import 'reflect-metadata';
import { Container } from 'inversify';
import { containerModule as ecsModule, World } from '@antv/g-ecs';
import { containerModule as globalModule } from './global-module';
import { Timeline } from './systems';
import {
  Animator,
  Sortable,
  Cullable,
  Geometry,
  SceneGraphNode,
  Renderable,
  Transform,
} from './components';

export const CanvasContainerModuleFactory = Symbol('CanvasContainerModuleFactory');

const container = new Container();
// bind ECS
container.load(ecsModule);
container.load(globalModule);

// register components & systems
const world = container.get<World>(World);
world
  .registerComponent(Transform)
  .registerComponent(SceneGraphNode)
  .registerComponent(Sortable)
  .registerComponent(Cullable)
  .registerComponent(Geometry)
  .registerComponent(Animator)
  .registerComponent(Renderable);
world.registerSystem(Timeline);

let lastTime = new Date().getTime();
const tick = () => {
  const time = new Date().getTime();
  const delta = time - lastTime;
  world.execute(delta, time);
  lastTime = time;
  window.requestAnimationFrame(tick);
};
tick();

export { world, container };
