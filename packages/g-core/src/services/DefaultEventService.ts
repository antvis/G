import { System } from '@antv/g-ecs';
import { inject, injectable, named } from 'inversify';
import { Group } from '../Group';
import { GroupPool } from '../GroupPool';
import { Shape } from '../Shape';
import { SceneGraph } from '../systems';
import { AABB as AABBSystem } from '../systems/AABB';

export const EventService = Symbol('EventService');
export interface EventService {
  init(): Promise<void> | void;
  destroy(): Promise<void> | void;
}

@injectable()
export abstract class DefaultEventService implements EventService {
  @inject(System)
  @named(AABBSystem.tag)
  private aabbSystem: AABBSystem;

  @inject(System)
  @named(SceneGraph.tag)
  private sceneGraph: SceneGraph;

  @inject(GroupPool)
  private groupPool: GroupPool;

  init() {}

  destroy() {}

  protected pick({ clientX, clientY, x, y }: { clientX: number; clientY: number; x: number; y: number }): Group | null {
    // query by AABB first with spatial index(r-tree)
    const rBushNodes = this.aabbSystem.search({
      minX: x,
      minY: y,
      maxX: x,
      maxY: y,
    });

    const groups: Group[] = [];
    rBushNodes.filter(({ name }) => {
      const group = this.groupPool.getByName(name);
      const groupConfig = group.getConfig();

      if (groupConfig.visible && groupConfig.capture) {
        // need to pick by shape, called `isHit` in G 3.0
        if (group.isGroup() || (!group.isGroup() && (group as Shape).isHit({ x, y }))) {
          groups.push(group);
        }
      }
    });

    // TODO: find group with max z-index
    const ids = this.sceneGraph.sort();
    groups.sort((a, b) => ids.indexOf(b.getEntity()) - ids.indexOf(a.getEntity()));

    return groups[0];
  }
}
