import 'reflect-metadata';
import { expect } from 'chai';
import { Entity } from '../Entity';
import { Component } from '../Component';
import { World } from '../World';
import { Container } from 'inversify';
import { containerModule } from '..';

class C1 extends Component {
  static tag = 'c1';
  p1: number;
}
class C2 extends Component {
  static tag = 'c2';
}
class C3 extends Component {
  static tag = 'c3';
}
class C4 extends Component {
  static tag = 'c4';
}
class C4Copy extends Component {
  static tag = 'c4';
}
class C4NotRegistered extends Component {
  static tag = 'c4';
}

describe('Entity', () => {
  const container = new Container();
  container.load(containerModule);

  const world = container.get(World);
  world
    .registerComponent(C1)
    .registerComponent(C2)
    .registerComponent(C3)
    .registerComponent(C4)
    .registerComponent(C4Copy);
  let e: Entity;

  beforeEach(() => {
    e = world.createEntity();
  });

  it('should create entity with name correctly', () => {
    e = world.createEntity('test entity');
    expect(e.getName()).to.eq('test entity');
    expect(e.getId()).to.not.null;
  });

  it('should add and remove components correctly', () => {
    const components = e.getComponents();
    expect(Object.keys(components).length).to.eq(0);
    e.addComponent(C1, { p1: 2 });
    e.addComponent(C2);
    e.addComponent(C3);

    expect(Object.keys(components).length).to.eq(3);
    expect(e.hasComponent(C1)).to.true;
    expect(e.hasComponent(C2)).to.true;
    expect(e.hasComponent(C3)).to.true;
    expect(e.hasComponent(C4)).to.false;

    e.removeComponent(C2, true);
    expect(Object.keys(components).length).to.eq(2);
    expect(e.hasComponent(C1)).to.true;
    expect(e.hasComponent(C2)).to.false;
    expect(e.hasComponent(C3)).to.true;

    e.removeComponent(C4, true);
    expect(Object.keys(components).length).to.eq(2);
  });

  it('should allow adding the same component twice', () => {
    const components = e.getComponents();
    e.addComponent(C1, { p1: 2 });
    e.addComponent(C2);

    // add the same component twice
    e.addComponent(C3);
    e.addComponent(C3);
    expect(Object.keys(components).length).to.eq(3);
  });

  it('should create many entities correctly', () => {
    for (let i = 0; i < 100; i++) {
      world.createEntity(`${i}`);
    }

    const entity = world.getEntityByName('0');
    expect(entity.getName()).to.eq('0');
  });

  it('should throw error when component is not registered', () => {
    expect(() => {
      e.addComponent(C4NotRegistered);
    }).to.throw();
  });

  it('should throw error when entity already existed', () => {
    expect(() => {
      world.createEntity('0');
    }).to.throw();
  });

  it('should throw error when component already existed', () => {
    expect(() => {
      e.addComponent(C4);
      e.addComponent(C4Copy);
    }).to.throw();
  });
});
