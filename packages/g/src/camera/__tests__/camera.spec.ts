import chai, { expect } from 'chai';
// @ts-ignore
import chaiAlmost from 'chai-almost';
import { Camera, CAMERA_PROJECTION_MODE } from '../';
import { mat4, vec3 } from 'gl-matrix';

chai.use(chaiAlmost(0.0001));

describe('Camera landmark', () => {
  it('should create an ortho camera correctly', () => {
    const width = 600;
    const height = 500;
    const camera = new Camera()
      .setPosition(width / 2, height / 2, 500)
      .setFocalPoint(width / 2, height / 2, 0)
      .setOrthographic(width / -2, width / 2, height / -2, height / 2, 0.1, 1000);

    expect(camera.getProjectionMode()).eqls(CAMERA_PROJECTION_MODE.ORTHOGRAPHIC);
    expect(camera.getZoom()).eqls(1);
    expect(camera.getFar()).eqls(1000);
    expect(camera.getNear()).eqls(0.1);
    expect(camera.getPosition()).eqls(vec3.fromValues(300, 250, 500));
    expect(camera.getFocalPoint()).eqls(vec3.fromValues(300, 250, 0));

    expect(camera.getViewTransform()).eqls(
      mat4.fromValues(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, -300, -250, -500, 1),
    );
    expect(camera.getWorldTransform()).eqls(
      mat4.fromValues(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 300, 250, 500, 1),
    );

    expect(camera.getPerspective()).almost.eqls(
      mat4.fromValues(
        0.0033333334140479565,
        0,
        0,
        0,
        -0,
        0.004000000189989805,
        -0,
        -0,
        0,
        0,
        -0.0020002000965178013,
        0,
        -0,
        0,
        -1.0002000331878662,
        1,
      ),
    );

    expect(camera.getPerspectiveInverse()).almost.eqls(
      mat4.fromValues(
        300,
        -0,
        -0,
        -0,
        0,
        249.99998474121094,
        -0,
        -0,
        0,
        -0,
        -499.9499816894531,
        -0,
        -0,
        -0,
        -500.04998779296875,
        1,
      ),
    );

    const frustum = camera.getFrustum();
    expect(frustum.planes.length).eqls(6);

    camera.setFocalPoint(300, 200, 0);
    expect(camera.getFocalPoint()).eqls(vec3.fromValues(300, 200, 0));
    expect(camera.getPosition()).eqls(vec3.fromValues(300, 250, 500));

    // nothing changed in ortho camera
    camera.setFov(60);
    camera.setAspect(2);
    expect(camera.getFocalPoint()).eqls(vec3.fromValues(300, 200, 0));
    expect(camera.getPosition()).eqls(vec3.fromValues(300, 250, 500));

    camera.setNear(10);
    camera.setFar(200);
    expect(camera.getFar()).eqls(200);
    expect(camera.getNear()).eqls(10);
  });
});
