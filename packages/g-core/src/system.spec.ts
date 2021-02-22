import 'reflect-metadata';
import { expect } from 'chai';
import { Entity, Component, World, System, Matcher, containerModule } from '@antv/g-ecs';
import { Container } from 'inversify';

class C1 extends Component {
  static tag = 'c1';
  p1: number;
}
class C2 extends Component {
  static tag = 'c2';
  p2: number;
}
class C3 extends Component {
  static tag = 'c3';
}
class C4 extends Component {
  static tag = 'c4';
}

class S1 extends System {
  static tag = 's1';

  trigger() {
    return new Matcher().allOf(C1);
  }

  execute(entities: Entity[]) {
    entities.forEach((entity) => {
      const c1 = entity.getComponent(C1);
      c1.p1++;
    });
  }
}

class S2 extends System {
  static tag = 's2';

  counter = 0;

  trigger() {
    return new Matcher().allOf(C2);
  }

  execute(entities: Entity[]) {
    entities.forEach((entity) => {
      const c1 = entity.getComponent(C1);
      c1.p1++;
    });
  }

  onEntityAdded(entity: Entity) {
    this.counter++;
    const c1 = entity.getComponent(C1);
    c1.p1 = this.counter;
  }

  onEntityRemoved(entity: Entity) {
    this.counter--;
  }
}

describe('System', () => {
  const container = new Container();
  container.load(containerModule);

  const world = container.get(World);
  world.registerComponent(C1).registerComponent(C2).registerComponent(C3).registerComponent(C4);
  world.registerSystem(S1).registerSystem(S2);
  let e: Entity;

  beforeEach(() => {
    e = world.createEntity();
  });

  it('should execute system S1 correctly', () => {
    const components = e.getComponents();
    expect(Object.keys(components).length).to.eq(0);
    e.addComponent(C1, { p1: 0 });

    world.execute();

    expect(e.getComponent(C1).p1).to.eq(1);
  });

  it('should execute system S2 correctly', () => {
    const e1 = world.createEntity();
    const e2 = world.createEntity();

    e1.addComponent(C1, { p1: 0 });
    e1.addComponent(C2, { p2: 1 });

    expect(e1.getComponent(C1).p1).to.eq(1);

    e2.addComponent(C1, { p1: 0 });
    e2.addComponent(C2, { p2: 1 });

    expect(e2.getComponent(C1).p1).to.eq(2);

    world.execute();
  });
});
