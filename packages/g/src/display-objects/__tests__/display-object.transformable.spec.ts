import chai, { expect } from 'chai';
// @ts-ignore
import chaiAlmost from 'chai-almost';
// @ts-ignore
import sinon from 'sinon';
// @ts-ignore
import sinonChai from 'sinon-chai';
import { mat3, mat4, vec2, vec3 } from 'gl-matrix';
import { DisplayObject, Group, Circle, deg2rad } from '@antv/g';

chai.use(chaiAlmost());
chai.use(sinonChai);

describe('Mixin Transformable', () => {
  it('should update transform with its parent group', () => {
    const group1 = new DisplayObject({});
    const group2 = new DisplayObject({});

    expect(group1.getPosition()).to.eqls(vec3.create());
    expect(group2.getPosition()).to.eqls(vec3.create());
    expect(group1.getLocalPosition()).to.eqls(vec3.create());
    expect(group2.getLocalPosition()).to.eqls(vec3.create());

    // group1 -> group2
    group1.add(group2);
    group1.appendChild(group2);

    // translate group1
    group1.translate([10, 0, 0]);
    group1.translate([0, 0]);
    group1.translate(0, 0, 0);
    group1.translate(0, 0);
    group1.translate(0);

    // group2's world transform should be the same with group1
    expect(group1.getPosition()).to.eqls(vec3.fromValues(10, 0, 0));
    expect(group2.getPosition()).to.eqls(vec3.fromValues(10, 0, 0));
    expect(group1.getLocalPosition()).to.eqls(vec3.fromValues(10, 0, 0));
    expect(group2.getLocalPosition()).to.eqls(vec3.create());

    // now move group2 to (20, 0, 0) in local space
    group2.translateLocal([10, 0, 0]);
    group1.translateLocal([0, 0]);
    group1.translateLocal(0, 0, 0);
    group1.translateLocal(0, 0);
    group1.translateLocal(0);

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
    group2.setLocalPosition(0);
    group2.setLocalPosition([0, 0, 0]);
    group2.setLocalPosition([0, 0]);

    expect(group1.getPosition()).to.eqls(vec3.fromValues(10, 10, 10));
    expect(group2.getPosition()).to.eqls(vec3.fromValues(10, 10, 10));

    group1.resetLocalTransform();
    expect(group1.getLocalPosition()).to.eqls(vec3.create());
    expect(group1.getLocalScale()).to.eqls(vec3.fromValues(1, 1, 1));
    expect(group1.getLocalEulerAngles()).to.eqls(0);
    expect(group1.getLocalTransform()).to.eqls(mat4.identity(mat4.create()));

    group2.resetLocalTransform();
    expect(group2.getLocalPosition()).to.eqls(vec3.create());
    expect(group2.getLocalScale()).to.eqls(vec3.fromValues(1, 1, 1));
    expect(group2.getLocalEulerAngles()).to.eqls(0);
    expect(group2.getLocalTransform()).to.eqls(mat4.identity(mat4.create()));
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
    group1.scale(1, 1);
    group1.scale([1, 1, 1]);
    group1.scale([1, 1]);

    // group2's world transform should be the same with group1
    expect(group1.getScale()).to.eqls(vec3.fromValues(10, 10, 10));
    expect(group2.getScale()).to.eqls(vec3.fromValues(10, 10, 10));

    // now scale group2 in local space
    group2.setLocalScale(2);
    group2.setLocalScale(2, 2);
    group2.setLocalScale([2, 2, 2]);
    group2.setLocalScale([2, 2]);

    // group1's scaling (10)
    // group2's scaling (20)
    expect(group1.getScale()).to.eqls(vec3.fromValues(10, 10, 10));
    expect(group2.getScale()).to.eqls(vec3.fromValues(20, 20, 20));

    // remove group2 from group1
    group1.removeChild(group2);
    group1.removeChildren();

    expect(group1.getScale()).to.eqls(vec3.fromValues(10, 10, 10));
    // should not keep scaling when detached
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

  it('should get/setMatrix correctly', () => {
    // compatible with legacy G4.0

    const group = new Group();
    expect(group.getMatrix()).to.almost.eqls(mat3.identity(mat3.create()));
    expect(group.getLocalMatrix()).to.almost.eqls(mat3.identity(mat3.create()));

    group.translateLocal(100, 100);
    expect(group.getMatrix()).to.almost.eqls(
      mat3.fromTranslation(mat3.create(), vec2.fromValues(100, 100)),
    );
    expect(group.getLocalMatrix()).to.almost.eqls(
      mat3.fromTranslation(mat3.create(), vec2.fromValues(100, 100)),
    );

    let matrix = mat3.fromTranslation(mat3.create(), vec2.fromValues(200, 200));
    group.setMatrix(matrix);
    expect(group.getMatrix()).to.almost.eqls(matrix);
    expect(group.getLocalMatrix()).to.almost.eqls(matrix);

    matrix = mat3.fromRotation(mat3.create(), deg2rad(90));
    group.setMatrix(matrix);
    expect(group.getMatrix()).to.almost.eqls(matrix);
    expect(group.getLocalMatrix()).to.almost.eqls(matrix);

    matrix = mat3.fromScaling(mat3.create(), vec2.fromValues(2, 2));
    group.setMatrix(matrix);
    expect(group.getMatrix()).to.almost.eqls(matrix);
    expect(group.getLocalMatrix()).to.almost.eqls(matrix);

    matrix = mat3.identity(mat3.create());
    group.setLocalMatrix(matrix);
    expect(group.getMatrix()).to.almost.eqls(mat3.identity(mat3.create()));
    expect(group.getLocalMatrix()).to.almost.eqls(mat3.identity(mat3.create()));
  });

  it('should set origin correctly', () => {
    const circle = new Circle({ style: { r: 100 } });
    circle.setPosition(100, 100, 0);
    expect(circle.getOrigin()).to.eqls(vec3.fromValues(0, 0, 0));

    let bounds = circle.getBounds();
    if (bounds) {
      expect(bounds.center).eqls(vec3.fromValues(100, 100, 0));
      expect(bounds.halfExtents).eqls(vec3.fromValues(100, 100, 0));
    }

    // origin: [0, 0]
    circle.scale(0.5);

    bounds = circle.getBounds();
    if (bounds) {
      expect(bounds.center).eqls(vec3.fromValues(100, 100, 0));
      expect(bounds.halfExtents).eqls(vec3.fromValues(50, 50, 0));
    }
    // restore
    circle.scale(2);

    // origin: [-100, -100]
    circle.setOrigin(-100, -100);
    expect(circle.getOrigin()).to.eqls(vec3.fromValues(-100, -100, 0));
    circle.scale(0.5);
    expect(circle.getPosition()).to.eqls(vec3.fromValues(50, 50, 0));
    bounds = circle.getBounds();
    if (bounds) {
      expect(bounds.center).eqls(vec3.fromValues(50, 50, 0));
      expect(bounds.halfExtents).eqls(vec3.fromValues(50, 50, 0));
    }
  });
});
