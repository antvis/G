import { expect } from 'chai';
import { Camera, Landmark } from '../';
import { vec3 } from 'gl-matrix';

describe('Camera landmark', () => {
  it('should save camera state in landmark', () => {
    const camera = new Camera();
    const landmark = new Landmark('test', camera);

    expect(landmark.name).eqls('test');
    expect(landmark.getPosition()).eqls(vec3.fromValues(0, 0, 1));
    expect(landmark.getFocalPoint()).eqls(vec3.fromValues(0, 0, 0));
    expect(landmark.getRoll()).eqls(0);

    const anotherCamera = new Camera();

    landmark.retrieve(anotherCamera);

    expect(anotherCamera.roll).eqls(0);
  });
});
