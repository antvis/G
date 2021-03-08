import 'reflect-metadata';
import { expect } from 'chai';
import { MockCanvas } from './fixtures/MockCanvas';
import { Canvas, Transform } from '@antv/g-core';
import { mat4, vec3 } from 'gl-matrix';
import { sleep } from './utils/sleep';

describe('Animation System', () => {
  let canvas: Canvas;
  beforeEach(() => {
    canvas = new MockCanvas({
      width: 0,
      height: 0,
      container: 'id',
    });
  });

  it('should transform with its parent', async () => {
    const group1 = canvas.addGroup();
    const groupEntity1 = group1.getEntity();
    const group2 = canvas.addGroup();
    const groupEntity2 = group2.getEntity();

    const transform1 = groupEntity1.getComponent(Transform);
    expect(transform1.getWorldTransform()).to.eqls(mat4.create());

    const transform2 = groupEntity2.getComponent(Transform);
    expect(transform2.getWorldTransform()).to.eqls(mat4.create());

    // group1 -> group2
    group1.add(group2);

    // translate group1
    transform1.translate([10, 0, 0]);

    // wait for next frame
    await sleep(2000);

    // group2's world transform should be the same with group1
    expect(transform1.getWorldTransform()).to.eqls(mat4.fromTranslation(mat4.create(), vec3.fromValues(10, 0, 0)));
    expect(transform2.getWorldTransform()).to.eqls(mat4.fromTranslation(mat4.create(), vec3.fromValues(10, 0, 0)));

    // now move group2 to (20, 0, 0) in world space
    transform2.translate([10, 0, 0]);

    // wait for next frame
    await sleep(2000);

    // group1's position (10, 0, 0)
    // group2's position (20, 0, 0)
    expect(transform1.getWorldTransform()).to.eqls(mat4.fromTranslation(mat4.create(), vec3.fromValues(10, 0, 0)));
    expect(transform2.getWorldTransform()).to.eqls(mat4.fromTranslation(mat4.create(), vec3.fromValues(20, 0, 0)));
  });
});
