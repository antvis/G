import 'reflect-metadata';
import { expect } from 'chai';
import { Entity } from '../Entity';
import { Component } from '../Component';
import { World } from '../World';
import { Container } from 'mana-syringe';
import { containerModule } from '..';
import { Matcher } from '../Matcher';

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
class C5 extends Component {
  static tag = 'c5';
}

describe('Group', () => {
  const container = new Container();
  container.load(containerModule);

  const world = container.get(World);
  world
    .registerComponent(C1)
    .registerComponent(C2)
    .registerComponent(C3)
    .registerComponent(C4)
    .registerComponent(C5);
  let e: Entity;

  beforeEach(() => {
    e = world.createEntity();
  });

  it('should match allof C1, C2 and C3', () => {
    e.addComponent(C1, { p1: 2 });
    e.addComponent(C2);
    e.addComponent(C3);

    const matcher = new Matcher();
    matcher.allOf(C1, C2, C3);
    expect(matcher.matches(e)).to.true;
  });

  it('should not match allof C1, C2, C3 and C4', () => {
    e.addComponent(C1, { p1: 2 });
    e.addComponent(C2);
    e.addComponent(C3);

    const matcher = new Matcher();
    matcher.allOf(C1, C2, C3, C4);
    expect(matcher.matches(e)).to.false;
  });

  it('should match anyof C1 and C4', () => {
    e.addComponent(C1, { p1: 2 });
    e.addComponent(C2);
    e.addComponent(C3);

    const matcher = new Matcher();
    matcher.anyOf(C1, C4);
    expect(matcher.matches(e)).to.true;
  });

  it('should not match anyof C4 and C5', () => {
    e.addComponent(C1, { p1: 2 });
    e.addComponent(C2);
    e.addComponent(C3);

    const matcher = new Matcher();
    matcher.anyOf(C4, C5);
    expect(matcher.matches(e)).to.false;
  });

  it('should match noneof C4 and C5', () => {
    e.addComponent(C1, { p1: 2 });
    e.addComponent(C2);
    e.addComponent(C3);

    const matcher = new Matcher();
    matcher.noneOf(C4, C5);
    expect(matcher.matches(e)).to.true;
  });

  it('should not match noneof C1 and C5', () => {
    e.addComponent(C1, { p1: 2 });
    e.addComponent(C2);
    e.addComponent(C3);

    const matcher = new Matcher();
    matcher.noneOf(C1, C5);
    expect(matcher.matches(e)).to.false;
  });

  it('should match anyof C1, C2 and noneof C5', () => {
    e.addComponent(C1, { p1: 2 });
    e.addComponent(C2);
    e.addComponent(C3);

    const matcher = new Matcher();
    matcher.anyOf(C1, C2).noneOf(C5);
    expect(matcher.matches(e)).to.true;
  });
});
