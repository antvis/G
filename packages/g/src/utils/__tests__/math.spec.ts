import chai, { expect } from 'chai';
// @ts-ignore
import chaiAlmost from 'chai-almost';
// @ts-ignore
import sinon from 'sinon';
// @ts-ignore
import sinonChai from 'sinon-chai';
import { vec3 } from 'gl-matrix';
import { rad2deg, deg2rad, grad2deg, deg2turn, turn2deg, getAngle, createVec3 } from '@antv/g';

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
});
