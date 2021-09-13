import { Container } from 'inversify';
import { containerModule as ecsModule, World } from '@antv/g-ecs';
import { containerModule as globalModule } from './global-module';
import { Sortable, Cullable, Geometry, Renderable, Transform } from './components';

export const CanvasContainerModuleFactory = 'CanvasContainerModuleFactory';

const container = new Container();
// bind ECS
container.load(ecsModule);
container.load(globalModule);

// register components & systems
const world = container.get<World>(World);
world
  .registerComponent(Transform)
  .registerComponent(Sortable)
  .registerComponent(Cullable)
  .registerComponent(Geometry)
  .registerComponent(Renderable);

export { world, container };
