import 'reflect-metadata';
import { expect } from 'chai';
import { DisplayObject, Circle, SHAPE } from '..';
import { mat4, vec3 } from 'gl-matrix';

describe('Circle', () => {
  it('should calc global bounds correctly', () => {
    const circle = new Circle({
      attrs: {
        x: 100,
        y: 100,
        r: 100,
      },
    });

    let bounds = circle.getBounds();
    expect(bounds.center).eqls(vec3.fromValues(100, 100, 0));
    expect(bounds.halfExtents).eqls(vec3.fromValues(100, 100, 0));

    circle.translate(100);
    bounds = circle.getBounds();
    expect(bounds.center).eqls(vec3.fromValues(200, 100, 0));
    expect(bounds.halfExtents).eqls(vec3.fromValues(100, 100, 0));

    circle.setAttribute('lineAppendWidth', 10);
    bounds = circle.getBounds();
    expect(bounds.center).eqls(vec3.fromValues(200, 100, 0));
    expect(bounds.halfExtents).eqls(vec3.fromValues(110, 110, 0));

    circle.setAttribute('lineWidth', 10);
    bounds = circle.getBounds();
    expect(bounds.center).eqls(vec3.fromValues(200, 100, 0));
    expect(bounds.halfExtents).eqls(vec3.fromValues(120, 120, 0));

    circle.setAttribute('r', 10);
    bounds = circle.getBounds();
    expect(bounds.center).eqls(vec3.fromValues(200, 100, 0));
    expect(bounds.halfExtents).eqls(vec3.fromValues(30, 30, 0));
  });
});
