import 'reflect-metadata';
import { expect } from 'chai';
import { Entity } from '../Entity';
import { Component } from '../Component';
import { World } from '../World';
import { Container, inject, injectable } from 'inversify';
import { containerModule } from '..';
import { System } from '../System';
import { Matcher } from '../Matcher';

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

@injectable()
class S1 implements System {
  static tag = 's1';
  static trigger = new Matcher().allOf(C1);
  static priority = 0;
  public initialized = false;

  initialize() {
    this.initialized = true;
  }

  execute(entities: Entity[]) {
    entities.forEach((entity) => {
      const c1 = entity.getComponent(C1);
      c1.p1++;
    });
  }
}

@injectable()
class S2 implements System {
  static tag = 's2';
  static trigger = new Matcher().allOf(C2);

  public counter = 0;
  static priority = 0;

  getCounter() {
    return this.counter;
  }

  reset() {
    this.counter = 0;
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

@injectable()
class S3 implements System {
  static tag = 's3';
  static priority = 0;

  execute(entities: Entity[]) {
    entities.forEach((entity) => {
      //
    });
  }
}

describe('System', () => {
  const container = new Container();
  container.load(containerModule);

  const world = container.get(World);
  world.registerComponent(C1).registerComponent(C2).registerComponent(C3).registerComponent(C4);
  world.registerSystem(S1).registerSystem(S2).registerSystem(S3);
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
    expect(e.getComponent(C1).getId()).to.not.null;
    const cloned = e.getComponent(C1).clone() as C1;
    expect(cloned.p1).to.eq(1);
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

  it('should inform system S2 when component removed', () => {
    const s2 = container.getNamed(System, S2.tag) as S2;
    s2.reset();

    const e1 = world.createEntity();
    const e2 = world.createEntity();

    e1.addComponent(C1, { p1: 0 });
    e1.addComponent(C2, { p2: 1 });

    expect(e1.getComponent(C1).p1).to.eq(1);

    e2.addComponent(C1, { p1: 0 });
    e2.addComponent(C2, { p2: 1 });

    expect(e2.getComponent(C1).p1).to.eq(2);

    world.execute();

    e2.removeComponent(C2, true);
    world.execute();

    expect(s2.getCounter()).to.eq(1);

    world.destroy();
  });
});
