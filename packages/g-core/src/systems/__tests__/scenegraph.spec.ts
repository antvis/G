import 'reflect-metadata';
import { expect } from 'chai';
import { container, Group, Circle, Transform, SceneGraph, SHAPE } from '@antv/g-core';
import { mat4, vec3 } from 'gl-matrix';
import { System } from '@antv/g-ecs';

describe('SceneGraph System', () => {
  const sceneGraph = container.getNamed(System, SceneGraph.tag);

  it('should update transform with its parent group', () => {
    const group1 = new Group();
    const groupEntity1 = group1.getEntity();
    const group2 = new Group();
    const groupEntity2 = group2.getEntity();

    const transform1 = groupEntity1.getComponent(Transform);
    expect(sceneGraph.getWorldTransform(groupEntity1, transform1)).to.eqls(mat4.create());

    const transform2 = groupEntity2.getComponent(Transform);
    expect(sceneGraph.getWorldTransform(groupEntity2, transform2)).to.eqls(mat4.create());

    // group1 -> group2
    group1.add(group2);

    // translate group1
    group1.translate([10, 0, 0]);

    // group2's world transform should be the same with group1
    expect(sceneGraph.getWorldTransform(groupEntity1, transform1)).to.eqls(
      mat4.fromTranslation(mat4.create(), vec3.fromValues(10, 0, 0))
    );
    expect(sceneGraph.getWorldTransform(groupEntity2, transform2)).to.eqls(
      mat4.fromTranslation(mat4.create(), vec3.fromValues(10, 0, 0))
    );

    // now move group2 to (20, 0, 0) in local space
    group2.translateLocal([10, 0, 0]);

    // group1's position (10, 0, 0)
    // group2's position (20, 0, 0)
    expect(sceneGraph.getWorldTransform(groupEntity1, transform1)).to.eqls(
      mat4.fromTranslation(mat4.create(), vec3.fromValues(10, 0, 0))
    );
    expect(sceneGraph.getWorldTransform(groupEntity2, transform2)).to.eqls(
      mat4.fromTranslation(mat4.create(), vec3.fromValues(20, 0, 0))
    );

    // move group1 to (10, 10, 10)
    group1.move(10, 10, 10);
    group1.move([10, 10, 10]);
    group1.moveTo(10, 10, 10);
    group1.moveTo([10, 10, 10]);
    group1.setPosition(10, 10, 10);
    group1.setPosition([10, 10, 10]);
    // set group2 to origin in local space
    group2.setLocalPosition(0, 0, 0);
    group2.setLocalPosition([0, 0, 0]);

    expect(sceneGraph.getWorldTransform(groupEntity1, transform1)).to.eqls(
      mat4.fromTranslation(mat4.create(), vec3.fromValues(10, 10, 10))
    );
    expect(sceneGraph.getWorldTransform(groupEntity2, transform2)).to.eqls(
      mat4.fromTranslation(mat4.create(), vec3.fromValues(10, 10, 10))
    );
  });

  it('should update scaling with its parent group', () => {
    const group1 = new Group();
    const groupEntity1 = group1.getEntity();
    const group2 = new Group();
    const groupEntity2 = group2.getEntity();

    const transform1 = groupEntity1.getComponent(Transform);
    expect(sceneGraph.getWorldTransform(groupEntity1, transform1)).to.eqls(mat4.create());

    const transform2 = groupEntity2.getComponent(Transform);
    expect(sceneGraph.getWorldTransform(groupEntity2, transform2)).to.eqls(mat4.create());

    // group1 -> group2
    group1.add(group2);

    // scale group1
    group1.scale(10);
    group1.scale([1, 1, 1]);

    // group2's world transform should be the same with group1
    expect(sceneGraph.getWorldTransform(groupEntity1, transform1)).to.eqls(
      mat4.fromScaling(mat4.create(), vec3.fromValues(10, 10, 10))
    );
    expect(sceneGraph.getWorldTransform(groupEntity2, transform2)).to.eqls(
      mat4.fromScaling(mat4.create(), vec3.fromValues(10, 10, 10))
    );

    // now scale group2 in local space
    group2.setLocalScale(2);
    group2.setLocalScale([2, 2, 2]);

    // group1's scaling (10, 0, 0)
    // group2's scaling (20, 0, 0)
    expect(sceneGraph.getWorldTransform(groupEntity1, transform1)).to.eqls(
      mat4.fromScaling(mat4.create(), vec3.fromValues(10, 10, 10))
    );
    expect(sceneGraph.getWorldTransform(groupEntity2, transform2)).to.eqls(
      mat4.fromScaling(mat4.create(), vec3.fromValues(20, 20, 20))
    );

    // remove group2 from group1
    group1.remove(group2);
    group1.removeChildren();

    expect(sceneGraph.getWorldTransform(groupEntity1, transform1)).to.eqls(
      mat4.fromScaling(mat4.create(), vec3.fromValues(10, 10, 10))
    );
    expect(sceneGraph.getWorldTransform(groupEntity2, transform2)).to.eqls(
      mat4.fromScaling(mat4.create(), vec3.fromValues(2, 2, 2))
    );
  });

  it('should update rotation with its parent group', () => {
    const group1 = new Group();
    const groupEntity1 = group1.getEntity();
    const group2 = new Group();
    const groupEntity2 = group2.getEntity();

    const transform1 = groupEntity1.getComponent(Transform);
    expect(sceneGraph.getWorldTransform(groupEntity1, transform1)).to.eqls(mat4.create());

    const transform2 = groupEntity2.getComponent(Transform);
    expect(sceneGraph.getWorldTransform(groupEntity2, transform2)).to.eqls(mat4.create());

    // group1 -> group2
    group1.add(group2);
  });

  it('should getElementById correctly', () => {
    const group1 = new Group({ id: 'group1' });
    const group2 = new Group({ id: 'group2' });
    const group3 = new Group({ id: 'group3' });

    // group1 -> group2 -> group3
    group1.add(group2);
    group2.add(group3);

    expect(group1.getElementById('group2')).to.eql(group2);
    expect(group1.getElementById('group3')).to.eql(group3);
    expect(group2.getElementById('group3')).to.eql(group3);

    group1.destroy();
    group2.destroy();
    group3.destroy();
  });

  it('should getElementsByName correctly', () => {
    const group1 = new Group({ id: 'group1', name: 'g1' });
    const group2 = new Group({ id: 'group2', name: 'g' });
    const group3 = new Group({ id: 'group3', name: 'g' });
    const group4 = new Group({ id: 'group4', name: 'g' });

    // group1 -> group2 -> group3
    // group1 -> group4
    group1.add(group2);
    group1.add(group4);
    group2.add(group3);

    const groups = group1.getElementsByName('g');

    expect(groups.length).to.eql(3);
    expect(groups).to.eql([group2, group3, group4]);

    group1.destroy();
    group2.destroy();
    group3.destroy();
    group4.destroy();
  });

  it('should getElementsByClassName correctly', () => {
    const group1 = new Group({ id: 'group1', className: 'c1' });
    const group2 = new Group({ id: 'group2', className: 'c1' });
    const group3 = new Group({ id: 'group3', className: 'c1' });
    const group4 = new Group({ id: 'group4', className: 'c1' });

    // group1 -> group2 -> group3
    // group1 -> group4
    group1.add(group2);
    group1.add(group4);
    group2.add(group3);

    const groups = group1.getElementsByClassName('c1');

    expect(groups.length).to.eql(3);
    expect(groups).to.eql([group2, group3, group4]);

    group1.destroy();
    group2.destroy();
    group3.destroy();
    group4.destroy();
  });

  it('should getElementsByTagName correctly', () => {
    const group1 = new Group({ id: 'group1', className: 'c1' });
    const group2 = new Circle({ id: 'group2', className: 'c1' });
    const group3 = new Circle({ id: 'group3', className: 'c1' });
    const group4 = new Circle({ id: 'group4', className: 'c1' });

    // group1 -> group2 -> group3
    // group1 -> group4
    group1.add(group2);
    group1.add(group4);
    group2.add(group3);

    const groups = group1.getElementsByTagName(SHAPE.Circle);

    expect(groups.length).to.eql(3);
    expect(groups).to.eql([group2, group3, group4]);

    group1.destroy();
    group2.destroy();
    group3.destroy();
    group4.destroy();
  });

  it('should querySelectorAll correctly', () => {
    const group1 = new Group({ id: 'group1', className: 'c1' });
    const group2 = new Circle({ id: 'group2', attrs: { r: 10 } });
    const group3 = new Circle({ id: 'group3', attrs: { r: 10 } });
    const group4 = new Circle({ id: 'group4', attrs: { r: 20 } });
    const group5 = new Circle({ id: 'group5', attrs: { r: 40 } });

    // group1 -> group2 -> group3
    // group1 -> group2 -> group5
    // group1 -> group4
    group1.add(group2);
    group1.add(group4);
    group2.add(group3);
    group2.add(group5);

    const groups = group1.querySelectorAll('[r=10]');
    const groups2 = group1.querySelectorAll('[r=20]');
    const groups3 = group1.querySelectorAll('[r=30]');

    expect(groups.length).to.eql(2);
    expect(groups).to.eql([group2, group3]);

    expect(groups2.length).to.eql(1);
    expect(groups2).to.eql([group4]);

    expect(groups3.length).to.eql(0);
    expect(groups3).to.eql([]);

    // attribute selector
    expect(group1.querySelector('[r=10]')).to.eql(group2);

    // nth-child
    expect(group2.querySelector('circle:first-child')).to.eql(group3);
    expect(group2.querySelector('circle:last-child')).to.eql(group5);

    group1.destroy();
    group2.destroy();
    group3.destroy();
    group4.destroy();
    group5.destroy();
  });

  it('should implement Node & Element interfaces correctly', () => {
    const group1 = new Group({ id: 'group1', className: 'c1', attrs: { x: 0 } });
    const group2 = new Circle({ id: 'group2', className: 'c1' });
    const group3 = new Circle({ id: 'group3', className: 'c1' });
    const group4 = new Circle({ id: 'group4', className: 'c1' });

    expect(group1.nodeType).to.eql(SHAPE.Group);
    expect(group1.nodeName).to.eql(SHAPE.Group);
    expect(group1.parentNode).to.null;
    expect(group1.parentElement).to.null;
    expect(group1.nextSibling).to.null;
    expect(group1.previousSibling).to.null;
    expect(group1.firstChild).to.null;
    expect(group1.lastChild).to.null;
    expect(group1.children).to.eqls([]);
    expect(group1.childElementCount).to.eqls(0);
    expect(group1.firstElementChild).to.null;
    expect(group1.lastElementChild).to.null;

    expect(group1.getAttribute('x')).to.eqls(0);
    expect(group1.getAttribute('y')).to.null;

    group1.setAttribute('x', 20);
    expect(group1.getAttribute('x')).to.eqls(20);

    group1.removeAttribute('x');
    expect(group1.getAttribute('x')).to.null;

    // group1 -> group2 -> group3
    // group1 -> group4
    group1.appendChild(group2);
    group1.appendChild(group4);
    group2.appendChild(group3);

    expect(group1.contains(group1)).to.true;
    expect(group1.contains(group2)).to.true;
    expect(group1.contains(group3)).to.true;
    expect(group1.contains(group4)).to.true;
    expect(group2.contains(group3)).to.true;
    expect(group2.contains(group4)).to.false;

    expect(group1.firstChild).to.eqls(group2);
    expect(group1.lastChild).to.eqls(group4);
    expect(group1.children).to.eqls([group2, group4]);
    expect(group1.childElementCount).to.eqls(2);
    expect(group1.firstElementChild).to.eqls(group2);
    expect(group1.lastElementChild).to.eqls(group4);
    expect(group2.parentNode).to.eqls(group1);
    expect(group2.parentElement).to.eqls(group1);
    expect(group2.previousSibling).to.eqls(null);
    expect(group2.nextSibling).to.eqls(group4);
    expect(group4.previousSibling).to.eqls(group2);
    expect(group4.nextSibling).to.eqls(null);

    // change the order of group1's children
    group1.insertBefore(group4, group2);
    expect(group1.firstChild).to.eqls(group4);
    expect(group1.lastChild).to.eqls(group2);
    expect(group1.children).to.eqls([group4, group2]);
    expect(group1.childElementCount).to.eqls(2);
    expect(group1.firstElementChild).to.eqls(group4);
    expect(group1.lastElementChild).to.eqls(group2);
    expect(group2.parentNode).to.eqls(group1);
    expect(group2.parentElement).to.eqls(group1);
    expect(group2.previousSibling).to.eqls(group4);
    expect(group2.nextSibling).to.eqls(null);
    expect(group4.previousSibling).to.eqls(null);
    expect(group4.nextSibling).to.eqls(group2);

    group1.destroy();
    group2.destroy();
    group3.destroy();
    group4.destroy();
  });

  // it('should query child correctly', async () => {
  //   const group1 = canvas.addGroup({
  //     id: 'id1',
  //     name: 'group1',
  //   });
  //   const group2 = canvas.addGroup({
  //     id: 'id2',
  //     name: 'group2',
  //   });
  //   const group3 = canvas.addGroup({
  //     id: 'id3',
  //     name: 'group3',
  //   });
  //   const group4 = canvas.addGroup({
  //     id: 'id4',
  //     name: 'group4',
  //     className: 'className4',
  //   });

  //   // 1 -> 2 -> 3
  //   // 1 -> 4
  //   group1.add(group2);
  //   group2.add(group3);
  //   group1.add(group4);

  //   // query children & parent
  //   expect(group1.contain(group2)).to.true;
  //   expect(group1.contains(group3)).to.false;
  //   expect(group1.getCount()).to.eqls(2);
  //   expect(group1.getChildren().length).to.eqls(2);
  //   expect(group1.getFirst()).to.eqls(group2);
  //   expect(group1.getLast()).to.eqls(group4);
  //   expect(group1.getChildByIndex(1)).to.eqls(group4);
  //   expect(group2.getParent()).to.eqls(group1);
  //   expect(group1.getParent()).to.null;
  //   expect(group3.getParent()).to.eqls(group2);
  //   expect(group4.getFirst()).to.null;
  //   expect(group4.getLast()).to.null;

  //   // search in scene graph
  //   expect(
  //     group1.find((group) => {
  //       return group.get('name') === 'group4';
  //     })
  //   ).to.eqls(group4);
  //   expect(
  //     group1.find((group) => {
  //       return group.get('name') === 'group5';
  //     })
  //   ).to.null;
  //   expect(
  //     group1.find(() => {
  //       return true;
  //     })
  //   ).to.eqls(group4);

  //   expect(
  //     group1.findAll(() => {
  //       return true;
  //     }).length
  //   ).to.eqls(3);

  //   expect(group1.findAllByName('group4').length).to.eqls(1);
  //   expect(group1.findAllByName('group4')[0]).to.eqls(group4);

  //   expect(group1.findById('id4')).to.eqls(group4);
  //   expect(group1.findById('id10')).to.null;

  //   expect(group1.findByClassName('className4')).to.eqls(group4);
  //   expect(group1.findByClassName('className10')).to.null;
  // });
});
