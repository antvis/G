import { expect } from 'chai';
import { mat4, quat, vec3 } from 'gl-matrix';
import { Transform } from '../Transform';

describe('Transform component', () => {
  test('should rotate correctly.', () => {
    const component = new Transform();

    component.rotate(quat.create());
    component.updateTransform();
    component.applyTransform();
    expect(component.getRotation()).to.eqls(quat.create());

    component.setLocalRotation(quat.create());
    component.updateTransform();
    expect(component.getLocalRotation()).to.eqls(quat.create());

    component.setRotation(quat.create());
    component.updateTransform();
    expect(component.getRotation()).to.eqls(quat.create());
  });

  test('should rotate with pitch correctly.', () => {
    const component = new Transform();

    component.rotateRollPitchYaw(90, 0, 0);
    component.updateTransform();

    expect(component.getLocalRotation()).to.eqls(quat.fromValues(Math.sqrt(2) / 2, 0, 0, Math.sqrt(2) / 2));
  });

  test('should traslate correctly.', () => {
    const component = new Transform();

    // translate in world space
    component.translate(5, 0, 0);
    component.updateTransform();
    component.translate(vec3.fromValues(5, 0, 0));
    component.updateTransform();
    expect(component.getLocalPosition()).to.eqls(vec3.fromValues(10, 0, 0));
    expect(component.getPosition()).to.eqls(vec3.fromValues(10, 0, 0));

    // translate in local space
    component.translateLocal(5, 0, 0);
    component.updateTransform();
    component.translateLocal(vec3.fromValues(5, 0, 0));
    component.updateTransform();
    expect(component.getLocalPosition()).to.eqls(vec3.fromValues(20, 0, 0));
    expect(component.getPosition()).to.eqls(vec3.fromValues(20, 0, 0));

    // set position directly
    component.setLocalPosition(5, 0, 0);
    component.updateTransform();
    expect(component.getLocalPosition()).to.eqls(vec3.fromValues(5, 0, 0));
    expect(component.getPosition()).to.eqls(vec3.fromValues(5, 0, 0));

    component.setPosition(5, 0, 0);
    component.updateTransform();
    expect(component.getLocalPosition()).to.eqls(vec3.fromValues(5, 0, 0));
    expect(component.getPosition()).to.eqls(vec3.fromValues(5, 0, 0));
  });

  test('should scale correctly.', () => {
    const component = new Transform();

    component.scaleLocal(vec3.fromValues(2, 2, 2));
    component.scaleLocal(1, 1, 1);
    component.updateTransform();

    expect(component.getScale()).to.eqls(vec3.fromValues(2, 2, 2));
    expect(component.getLocalScale()).to.eqls(vec3.fromValues(2, 2, 2));

    component.setLocalScale(vec3.fromValues(1, 1, 1));
    component.setLocalScale(1, 1, 1);
    component.updateTransform();
    expect(component.getScale()).to.eqls(vec3.fromValues(1, 1, 1));
    expect(component.getLocalScale()).to.eqls(vec3.fromValues(1, 1, 1));
  });

  test('should lerp correctly.', () => {
    const component = new Transform();
    const componentA = new Transform();
    const componentB = new Transform();

    componentA.translate(vec3.fromValues(10, 0, 0));
    componentB.translate(vec3.fromValues(20, 0, 0));
    componentA.updateTransform();
    componentB.updateTransform();

    expect(componentA.getPosition()).to.eqls(vec3.fromValues(10, 0, 0));

    component.lerp(componentA, componentB, 0.5);
    component.updateTransform();

    expect(component.localPosition).to.eqls(vec3.fromValues(15, 0, 0));
  });

  test('should clear localMatrix correctly.', () => {
    const component = new Transform();

    component.scaleLocal(vec3.fromValues(2, 2, 2));
    component.updateTransform();

    expect(component.getLocalScale()).to.eqls(vec3.fromValues(2, 2, 2));

    component.clearTransform();
    component.updateTransform();
    expect(component.localTransform).to.eqls(mat4.create());
  });

  test('should apply localMatrix correctly.', () => {
    const component = new Transform();

    component.matrixTransform(mat4.fromTranslation(mat4.create(), vec3.fromValues(10, 0, 0)));
    component.updateTransform();

    expect(component.getLocalPosition()).to.eqls(vec3.fromValues(10, 0, 0));
  });

  test("should apply parent's transform correctly.", () => {
    const parent = new Transform();
    const child = new Transform();
    child.parent = parent;
    expect(child.getWorldTransform()).to.eqls(mat4.create());

    expect(child.getPosition()).to.eqls(vec3.fromValues(0, 0, 0));

    // translate parent should affect its children
    parent.translate(vec3.fromValues(10, 0, 0));
    parent.updateTransform();
    child.updateTransformWithParent(parent);
    expect(child.getLocalPosition()).to.eqls(vec3.fromValues(0, 0, 0));
    expect(child.getPosition()).to.eqls(vec3.fromValues(10, 0, 0));
    expect(child.getLocalTransform()).to.eqls(mat4.create());
    expect(child.getWorldTransform()).to.eqls(mat4.fromTranslation(mat4.create(), vec3.fromValues(10, 0, 0)));

    // set child's position in world space, which should affect its local position
    child.setPosition(vec3.fromValues(0, 0, 0));
    child.updateTransform();
    child.updateTransformWithParent(parent);
    expect(child.getLocalPosition()).to.eqls(vec3.fromValues(-10, 0, 0));
    expect(child.getPosition()).to.eqls(vec3.fromValues(0, 0, 0));

    // scale parent should affect its children
    parent.scaleLocal(vec3.fromValues(2, 2, 2));
    parent.updateTransform();
    child.updateTransformWithParent(parent);
    expect(child.getLocalScale()).to.eqls(vec3.fromValues(1, 1, 1));
    expect(child.getScale()).to.eqls(vec3.fromValues(2, 2, 2));

    child.rotate(quat.create());
    child.updateTransform();
    child.updateTransformWithParent(parent);
    expect(child.getRotation()).to.eqls(quat.create());

    child.setRotation(quat.create());
    child.updateTransform();
    child.updateTransformWithParent(parent);
    expect(child.getRotation()).to.eqls(quat.create());
  });
});
