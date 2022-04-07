import type { RendererPlugin } from '@antv/g';
import type { Syringe } from 'mana-syringe';
import { Module } from 'mana-syringe';
import RBush from 'rbush';
import { RBushNode } from './RBushNode';
import type { RBushNodeAABB } from './RBushNode';

const RBushRoot = 'RBushRoot';
export { RBushNode, RBushRoot, RBush };

export type { RBushNodeAABB };

const containerModule = Module((register) => {
  register({ token: RBushRoot, useValue: new RBush<RBushNodeAABB>() });
  // register(JsonRendererPlugin);
});

export class Plugin implements RendererPlugin {
  init(container: Syringe.Container): void {
    container.load(containerModule, true);
  }
  destroy(container: Syringe.Container): void {
    container.unload(containerModule);
  }
}
