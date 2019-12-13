import { expect } from 'chai';
import Group from '../../src/group';
import * as Shape from '../../src/shape';
import getCanvas from '../get-canvas';

describe('SVG Group', () => {
  let canvas;
  let group;

  before(() => {
    canvas = getCanvas('svg-group');
    group = new Group({
      attrs: {},
    });
    canvas.add(group);
  });

  it('init', () => {
    expect(group.get('parent')).eql(canvas);
    expect(group.get('children').length).eql(0);
  });

  it('getShapeBase', () => {
    expect(group.getShapeBase()).eql(Shape);
  });

  it('getGroupBase', () => {
    expect(group.getGroupBase()).eql(Group);
  });

  it('add', () => {
    const subGroup = new Group({
      attrs: {},
      capture: false,
    });
    group.add(subGroup);
    expect(group.get('children').length).eql(1);
    expect(group.get('children')[0].cfg.capture).eql(false);
  });

  it('addGroup', () => {
    const subGroup = canvas.addGroup('group', {
      attrs: {},
    });
    group.add(subGroup);
    expect(group.get('children').length).eql(2);
  });

  it('clone', () => {
    const newGroup = group.clone();
    expect(newGroup.get('children').length).eqls(group.get('children').length);
    expect(newGroup.get('children')[0].get('capture')).eqls(false);
  });

  it('clear', () => {
    group.clear();
    expect(group.get('children').length).eql(0);
  });

  it('destroy', () => {
    expect(group.destroyed).eql(false);
    group.destroy();
    expect(group.destroyed).eql(true);
  });
});
