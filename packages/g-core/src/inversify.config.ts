import 'reflect-metadata';
import { Container } from 'inversify';
import { containerModule, World } from '@antv/g-ecs';
import { Transform as CTransform } from './components/Transform';
import { Hierarchy as CHierarchy } from './components/Hierarchy';
import { Geometry as CGeometry } from './components/Geometry';
import { Material as CMaterial } from './components/Material';
import { Mesh as CMesh } from './components/Mesh';
import { Transform as STransform } from './systems/Transform';
import { Hierarchy as SHierarchy } from './systems/Hierarchy';

// @see https://github.com/inversify/InversifyJS/blob/master/wiki/container_api.md#defaultscope
export const container = new Container();
container.load(containerModule);

// create a world
const world = container.get(World);

/**
 * register components
 */
world
  .registerComponent(CTransform)
  .registerComponent(CHierarchy)
  .registerComponent(CGeometry)
  .registerComponent(CMaterial)
  .registerComponent(CMesh);

/**
 * register systems
 */
world.registerSystem(STransform).registerSystem(SHierarchy);
