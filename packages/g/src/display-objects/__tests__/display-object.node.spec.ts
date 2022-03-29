import chai, { expect } from 'chai';
// @ts-ignore
import chaiAlmost from 'chai-almost';
// @ts-ignore
import sinon from 'sinon';
// @ts-ignore
import sinonChai from 'sinon-chai';
import { DisplayObject, Group, Shape } from '../..';
import { vec3 } from 'gl-matrix';

chai.use(chaiAlmost());
chai.use(sinonChai);

describe('DisplayObject Node API', () => {
  it('should update transform with its parent group', () => {
    const group1 = new DisplayObject({});
    const group2 = new DisplayObject({});

    group1.setPosition(0, 0);

    expect(group1.getPosition()).to.eqls(vec3.create());
    expect(group2.getPosition()).to.eqls(vec3.create());
    expect(group1.getLocalPosition()).to.eqls(vec3.create());
    expect(group2.getLocalPosition()).to.eqls(vec3.create());

    // group1 -> group2
    group1.add(group2);

    // translate group1
    group1.translate([10, 0, 0]);

    // group2's world transform should be the same with group1
    expect(group1.getPosition()).to.eqls(vec3.fromValues(10, 0, 0));
    expect(group2.getPosition()).to.eqls(vec3.fromValues(10, 0, 0));
    expect(group1.getLocalPosition()).to.eqls(vec3.fromValues(10, 0, 0));
    expect(group2.getLocalPosition()).to.eqls(vec3.create());

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
    group2.setLocalPosition(0, 0);
    group2.setLocalPosition([0, 0, 0]);
    group2.setLocalPosition([0, 0]);

    expect(group1.getPosition()).to.eqls(vec3.fromValues(10, 10, 10));
    expect(group2.getPosition()).to.eqls(vec3.fromValues(10, 10, 10));
  });

  it('should update scaling with its parent group', () => {
    const group1 = new DisplayObject({});
    const group2 = new DisplayObject({});

    expect(group1.getScale()).to.eqls(vec3.fromValues(1, 1, 1));
    expect(group2.getScale()).to.eqls(vec3.fromValues(1, 1, 1));
    expect(group1.getLocalScale()).to.eqls(vec3.fromValues(1, 1, 1));

    // group1 -> group2
    group1.add(group2);

    // scale group1
    group1.scale(10);
    group1.scale([1, 1, 1]);
    group1.scale([1, 1]);

    // group2's world transform should be the same with group1
    expect(group1.getScale()).to.eqls(vec3.fromValues(10, 10, 10));
    expect(group2.getScale()).to.eqls(vec3.fromValues(10, 10, 10));

    // now scale group2 in local space
    group2.setLocalScale(2);
    group2.setLocalScale([2, 2, 2]);

    // group1's scaling (10)
    // group2's scaling (20)
    expect(group1.getScale()).to.eqls(vec3.fromValues(10, 10, 10));
    expect(group2.getScale()).to.eqls(vec3.fromValues(20, 20, 20));

    // remove group2 from group1
    group1.removeChild(group2);
    group1.removeChildren();

    expect(group1.getScale()).to.eqls(vec3.fromValues(10, 10, 10));
    // should not keep scaling when detached
    // @see https://github.com/antvis/g/issues/935
    expect(group2.getScale()).to.eqls(vec3.fromValues(2, 2, 2));
  });

  it('should update rotation with its parent group', () => {
    const group1 = new Group();
    const group2 = new Group();
    // group1 -> group2
    group1.appendChild(group2);

    group1.rotateLocal(30);

    // use almost, allows a tolerance of 1 x 10-6.
    // @ts-ignore
    expect(group1.getEulerAngles()).to.almost.eqls(30);
    // @ts-ignore
    expect(group1.getLocalEulerAngles()).to.almost.eqls(30);
    // @ts-ignore
    expect(group2.getEulerAngles()).to.almost.eqls(30);
  });

  it('should query child correctly', () => {
    const group1 = new Group({
      id: 'id1',
      name: 'group1',
    });
    const group2 = new Group({
      id: 'id2',
      name: 'group2',
      class: 'c1 c2', // use class alias of className
    });
    const group3 = new Group({
      id: 'id3',
      name: 'group3',
      class: 'c1 c2 c3',
    });
    const group4 = new Group({
      id: 'id4',
      name: 'group4',
      className: 'className4',
    });

    // 1 -> 2 -> 3
    // 1 -> 4
    group1.add(group2);
    group2.add(group3);
    group1.add(group4);

    // query children & parent
    expect(group1.contain(group2)).to.true;
    expect(group1.contains(group3)).to.true;
    expect(group1.getCount()).to.eqls(2);
    expect(group1.getChildren().length).to.eqls(2);
    expect(group1.getFirst()).to.eqls(group2);
    expect(group1.getLast()).to.eqls(group4);
    expect(group1.getChildByIndex(1)).to.eqls(group4);
    expect(group2.getParent()).to.eqls(group1);
    expect(group1.getParent()).to.null;
    expect(group3.getParent()).to.eqls(group2);
    expect(group4.getFirst()).to.null;
    expect(group4.getLast()).to.null;
    expect(group1.getAttribute('class')).to.eqls(null);
    expect(group1.className).to.eqls('');
    expect(group1.classList).to.eqls([]);
    expect(group2.className).to.eqls('c1 c2');
    expect(group2.classList).to.eqls(['c1', 'c2']);
    expect(group4.getAttribute('class')).to.eqls('className4');
    expect(group4.className).to.eqls('className4');
    expect(group4.classList).to.eqls(['className4']);
    expect(group3.className).to.eqls('c1 c2 c3');
    expect(group3.classList).to.eqls(['c1', 'c2', 'c3']);

    group3.className = 'c1 c2';
    expect(group3.classList).to.eqls(['c1', 'c2']);

    group3.setAttribute('class', 'c1 c2 c3');
    expect(group3.classList).to.eqls(['c1', 'c2', 'c3']);

    group3.setAttribute('class', '');
    expect(group3.classList).to.eqls([]);

    // search in scene graph
    expect(
      group1.find((group) => {
        return group.get('name') === 'group4';
      }),
    ).to.eqls(group4);
    expect(
      group1.find((group) => {
        return group.get('name') === 'group5';
      }),
    ).to.null;
    expect(
      group1.find(() => {
        return true;
      }),
    ).to.eqls(group4);

    expect(
      group1.findAll(() => {
        return true;
      }).length,
    ).to.eqls(3);

    expect(group1.getElementsByName('group4').length).to.eqls(1);
    expect(group1.getElementsByName('group4')[0]).to.eqls(group4);

    expect(group1.getElementById('id4')).to.eqls(group4);
    expect(group1.getElementById('id10')).to.null;

    expect(group1.getElementsByClassName('className4').length).to.eqls(1);
    expect(group1.getElementsByClassName('className4')[0]).to.eqls(group4);
    expect(group1.getElementsByClassName('className10')).to.eqls([]);

    expect(group1.getElementsByTagName(Shape.GROUP).length).to.eqls(3);
    expect(group1.getElementsByTagName(Shape.CIRCLE).length).to.eqls(0);
  });

  it('should remove children recursively', () => {
    const group1 = new Group({
      id: 'id1',
      name: 'group1',
    });
    const group2 = new Group({
      id: 'id2',
      name: 'group2',
    });
    const group3 = new Group({
      id: 'id3',
      name: 'group3',
    });
    const group4 = new Group({
      id: 'id4',
      name: 'group4',
      className: 'className4',
    });

    // 1 -> 2 -> 3
    // 1 -> 4
    group1.appendChild(group2);
    group2.appendChild(group3);
    group1.appendChild(group4);

    group1.removeChildren();
    expect(group1.children.length).to.be.eqls(0);

    group1.appendChild(group2);
    group2.appendChild(group3);
    group1.appendChild(group4);
    // remove
    group4.remove(false);
    expect(group1.children.length).to.be.eqls(1);

    // re-append
    group1.appendChild(group4);
    expect(group1.children.length).to.be.eqls(2);

    group4.remove();
    expect(group1.children.length).to.be.eqls(1);

    group1.appendChild(group2);
    group2.appendChild(group3);
    group1.appendChild(group4);
    [...group1.children].forEach((child) => child.remove());
    expect(group1.children.length).to.be.eqls(0);
  });

  it('should set attr & style correctly', () => {
    const group = new Group({
      style: {
        width: 1,
        height: 1,
      },
    });

    expect(group.style.getPropertyValue('width')).to.eqls(1);
    expect(group.style.getPropertyValue('height')).to.eqls(1);

    group.style.setProperty('width', 2);
    expect(group.style.getPropertyValue('width')).to.eqls(2);

    group.style.removeProperty('width');
    expect(group.style.getPropertyValue('width')).to.null;
  });
});
