import 'reflect-metadata';
import { expect } from 'chai';
import { Group } from '@antv/g';
import { mat4, vec3 } from 'gl-matrix';

describe('Group', () => {
  it('should update transform with its parent group', () => {
    const group1 = new Group();
    const group2 = new Group();

    expect(group1.getPosition()).to.eqls(vec3.create());
    expect(group2.getPosition()).to.eqls(vec3.create());

    // group1 -> group2
    group1.add(group2);

    // translate group1
    group1.translate([10, 0, 0]);

    // group2's world transform should be the same with group1
    expect(group1.getPosition()).to.eqls(vec3.fromValues(10, 0, 0));
    expect(group2.getPosition()).to.eqls(vec3.fromValues(10, 0, 0));

    // now move group2 to (20, 0, 0) in local space
    group2.translateLocal([10, 0, 0]);

    // group1's position (10, 0, 0)
    // group2's position (20, 0, 0)
    expect(group1.getPosition()).to.eqls(vec3.fromValues(10, 0, 0));
    expect(group2.getPosition()).to.eqls(vec3.fromValues(20, 0, 0));

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

    expect(group1.getPosition()).to.eqls([10, 10, 10]);
    expect(group2.getPosition()).to.eqls(vec3.fromValues(10, 10, 10));
  });

  it('should update scaling with its parent group', () => {
    const group1 = new Group();
    const group2 = new Group();

    expect(group1.getScale()).to.eqls(vec3.fromValues(1, 1, 1));
    expect(group2.getScale()).to.eqls(vec3.fromValues(1, 1, 1));

    // group1 -> group2
    group1.add(group2);

    // scale group1
    group1.scale(10);
    group1.scale([1, 1, 1]);

    // group2's world transform should be the same with group1
    expect(group1.getScale()).to.eqls(vec3.fromValues(10, 10, 10));
    expect(group2.getScale()).to.eqls(vec3.fromValues(10, 10, 10));

    // now scale group2 in local space
    group2.setLocalScale(2);
    group2.setLocalScale([2, 2, 2]);

    // group1's scaling (10, 0, 0)
    // group2's scaling (20, 0, 0)
    expect(group1.getScale()).to.eqls(vec3.fromValues(10, 10, 10));
    expect(group2.getScale()).to.eqls(vec3.fromValues(20, 20, 20));

    // remove group2 from group1
    group1.remove(group2);
    group1.removeChildren();

    expect(group1.getScale()).to.eqls(vec3.fromValues(10, 10, 10));
    expect(group2.getScale()).to.eqls(vec3.fromValues(2, 2, 2));
  });

  // it('should update rotation with its parent group', () => {
  //   const group1 = new Group();
  //   const groupEntity1 = group1.getEntity();
  //   const group2 = new Group();
  //   const groupEntity2 = group2.getEntity();

  //   const transform1 = groupEntity1.getComponent(Transform);
  //   expect(sceneGraph.getWorldTransform(groupEntity1, transform1)).to.eqls(mat4.create());

  //   const transform2 = groupEntity2.getComponent(Transform);
  //   expect(sceneGraph.getWorldTransform(groupEntity2, transform2)).to.eqls(mat4.create());

  //   // group1 -> group2
  //   group1.add(group2);
  // });

  // it('should query child correctly', () => {
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
