import chai, { expect } from 'chai';
// @ts-ignore
import {
  createVec3,
  decompose,
  deg2rad,
  deg2turn,
  getAngle,
  grad2deg,
  rad2deg,
  turn2deg,
} from '@antv/g';
import chaiAlmost from 'chai-almost';
import { mat3, vec2, vec3 } from 'gl-matrix';
import sinonChai from 'sinon-chai';

chai.use(chaiAlmost());
chai.use(sinonChai);

describe('Math utils', () => {
  it('should getAngle correctly', () => {
    expect(getAngle()).to.be.eqls(0);
    expect(getAngle(380)).to.be.eqls(20);
    expect(getAngle(-380)).to.be.eqls(-20);
    expect(getAngle(320)).to.be.eqls(320);
  });

  it('should createVec3 correctly', () => {
    expect(createVec3(0)).to.be.eqls(vec3.create());
    expect(createVec3([0, 1, 2])).to.be.eqls(vec3.fromValues(0, 1, 2));
    expect(createVec3([1, 2])).to.be.eqls(vec3.fromValues(1, 2, 0));
    expect(createVec3([1, 2, 3, 4])).to.be.eqls(vec3.fromValues(1, 2, 3));
  });

  it('should convert angle correctly', () => {
    expect(deg2rad(360)).to.be.eqls(Math.PI * 2);
    expect(rad2deg(Math.PI * 2)).to.be.eqls(360);
    expect(deg2turn(360 * 2)).to.be.eqls(2);
    expect(turn2deg(2)).to.be.eqls(360 * 2);
    expect(grad2deg(400)).to.be.almost.eqls(0);
    expect(grad2deg(-400)).to.be.almost.eqls(0);
  });

  it('should decompose mat3 correctly', () => {
    const rotationMatrix = mat3.fromRotation(mat3.create(), deg2rad(90));
    expect(decompose(rotationMatrix)).to.be.eqls([0, 0, 1, 1, 90]);

    const translationMatrix = mat3.fromTranslation(mat3.create(), vec2.fromValues(10, 10));
    expect(decompose(translationMatrix)).to.be.eqls([10, 10, 1, 1, 0]);

    const scalingMatrix = mat3.fromScaling(mat3.create(), vec2.fromValues(2, 2));
    expect(decompose(scalingMatrix)).to.be.eqls([0, 0, 2, 2, 0]);
  });
});
