import chai, { expect } from 'chai';
// @ts-ignore
import chaiAlmost from 'chai-almost';
import { AdvancedCamera, CameraProjectionMode, Canvas } from '@antv/g';
import { Renderer as CanvasRenderer } from '@antv/g-canvas';
import { mat4, vec3 } from 'gl-matrix';
import sinonChai from 'sinon-chai';

chai.use(chaiAlmost(0.0001));
chai.use(sinonChai);

const $container = document.createElement('div');
$container.id = 'container';
document.body.prepend($container);

const renderer = new CanvasRenderer();

// create a canvas
const canvas = new Canvas({
  container: 'container',
  width: 600,
  height: 500,
  renderer,
});

chai.use(chaiAlmost(0.0001));

describe('Camera', () => {
  it('should create an ortho camera correctly', () => {
    const width = 600;
    const height = 500;
    const camera = new AdvancedCamera()
      .setPosition(width / 2, height / 2, 500)
      .setFocalPoint(width / 2, height / 2, 0)
      .setOrthographic(width / -2, width / 2, height / -2, height / 2, 0.1, 1000);

    expect(camera.getProjectionMode()).eqls(CameraProjectionMode.ORTHOGRAPHIC);
    expect(camera.getZoom()).eqls(1);
    expect(camera.getFar()).eqls(1000);
    expect(camera.getNear()).eqls(0.1);
    expect(camera.getPosition()).eqls(vec3.fromValues(300, 250, 500));
    expect(camera.getFocalPoint()).eqls(vec3.fromValues(300, 250, 0));
    expect(camera.getDistance()).eqls(500);

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

    camera.setFocalPoint(300, 250, 100);
    expect(camera.getFocalPoint()).eqls(vec3.fromValues(300, 250, 100));
    expect(camera.getPosition()).eqls(vec3.fromValues(300, 250, 500));
    expect(camera.getDistance()).eqls(400);

    // nothing changed in ortho camera
    camera.setFov(60);
    camera.setAspect(2);
    expect(camera.getFocalPoint()).eqls(vec3.fromValues(300, 250, 100));
    expect(camera.getPosition()).eqls(vec3.fromValues(300, 250, 500));

    camera.setNear(10);
    camera.setFar(200);
    expect(camera.getFar()).eqls(200);
    expect(camera.getNear()).eqls(10);

    camera.setRoll(0);
    expect(camera.getRoll()).eqls(0);
    camera.setElevation(0);
    expect(camera.getElevation()).eqls(0);
    camera.setAzimuth(0);
    expect(camera.getAzimuth()).eqls(0);
  });

  it('should setDistance correctly.', () => {
    const width = 600;
    const height = 500;
    const camera = new AdvancedCamera()
      .setPosition(width / 2, height / 2, 500)
      .setFocalPoint(width / 2, height / 2, 0)
      .setOrthographic(width / -2, width / 2, height / -2, height / 2, 0.1, 1000);

    expect(camera.getPosition()).eqls(vec3.fromValues(300, 250, 500));
    expect(camera.getFocalPoint()).eqls(vec3.fromValues(300, 250, 0));
    expect(camera.getDistance()).eqls(500);

    camera.setDistance(500);
    expect(camera.getDistance()).eqls(500);

    camera.setDistance(-500);
    expect(camera.getDistance()).eqls(500);

    camera.setDistance(0.00000001);
    expect(camera.getDistance()).eqls(0.0002);

    camera.setDistance(400);
    expect(camera.getPosition()).eqls(vec3.fromValues(300, 250, 400));
    expect(camera.getFocalPoint()).eqls(vec3.fromValues(300, 250, 0));
    expect(camera.getDistance()).eqls(400);
  });

  it('should setViewOffset correctly.', () => {
    const width = 600;
    const height = 500;
    const camera = new AdvancedCamera()
      .setPosition(width / 2, height / 2, 500)
      .setFocalPoint(width / 2, height / 2, 0)
      .setOrthographic(width / -2, width / 2, height / -2, height / 2, 0.1, 1000);

    expect(camera.getPosition()).eqls(vec3.fromValues(300, 250, 500));
    expect(camera.getFocalPoint()).eqls(vec3.fromValues(300, 250, 0));
    expect(camera.getDistance()).eqls(500);

    camera.setEnableUpdate(false);
    camera.setViewOffset(600, 500, 0, 0, 300, 250);
    camera.setEnableUpdate(true);

    expect(camera.getView()).eqls({
      enabled: true,
      fullHeight: 500,
      fullWidth: 600,
      height: 250,
      offsetX: 0,
      offsetY: 0,
      width: 300,
    });
    expect(camera.getViewTransform()).eqls(
      mat4.fromValues(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, -300, -250, -500, 1),
    );
    expect(camera.getWorldTransform()).eqls(
      mat4.fromValues(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 300, 250, 500, 1),
    );

    expect(camera.getPerspective()).almost.eqls(
      mat4.fromValues(
        0.006666666828095913,
        0,
        0,
        0,
        -0,
        0.00800000037997961,
        -0,
        -0,
        0,
        0,
        -0.0020002000965178013,
        0,
        1,
        -1,
        -1.0002000331878662,
        1,
      ),
    );

    camera.clearViewOffset();

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
  });

  it('should jitter camera correctly.', () => {
    const width = 600;
    const height = 500;
    const camera = new AdvancedCamera()
      .setPosition(width / 2, height / 2, 500)
      .setFocalPoint(width / 2, height / 2, 0)
      .setOrthographic(width / -2, width / 2, height / -2, height / 2, 0.1, 1000);

    camera.jitterProjectionMatrix(1, 1);

    expect(camera.getPerspective()).almost.eqls(
      mat4.fromValues(
        0.0033333334140479565,
        0,
        0,
        0,
        0,
        0.004000000189989805,
        0,
        0,
        0,
        0,
        -0.0020002000965178013,
        0,
        1,
        1,
        -1.0002000331878662,
        1,
      ),
    );

    camera.clearJitterProjectionMatrix();
  });

  it('should do `pan` action correctly.', () => {
    const camera = canvas.getCamera();
    expect(camera.getFocalPoint()).eqls(vec3.fromValues(300, 250, 0));
    expect(camera.getPosition()).eqls(vec3.fromValues(300, 250, 500));

    camera.pan(100, 100);
    expect(camera.getFocalPoint()).eqls(vec3.fromValues(300, 250, 0));
    expect(camera.getPosition()).eqls(vec3.fromValues(400, 350, 500));

    camera.pan(-100, -100);
    expect(camera.getFocalPoint()).eqls(vec3.fromValues(300, 250, 0));
    expect(camera.getPosition()).eqls(vec3.fromValues(300, 250, 500));
  });

  it('should do `dolly` action correctly.', () => {
    const camera = canvas.getCamera();
    expect(camera.getFocalPoint()).eqls(vec3.fromValues(300, 250, 0));
    expect(camera.getPosition()).eqls(vec3.fromValues(300, 250, 500));
    expect(camera.getDistance()).eqls(500);
    expect(camera.getDollyingStep()).eqls(500 / 100);

    camera.dolly(100);
    expect(camera.getDollyingStep()).eqls(10);
    expect(camera.getFocalPoint()).eqls(vec3.fromValues(300, 250, 0));
    // dollyStep = 500 / 100
    expect(camera.getPosition()).eqls(vec3.fromValues(300, 250, 500 + (500 / 100) * 100));
    expect(camera.getDistance()).eqls(1000);

    // account for min & max distance
    camera.setMinDistance(100);
    camera.dolly(-100000);
    expect(camera.getDistance()).eqls(100);
    camera.setMaxDistance(1000);
    camera.dolly(100000);
    expect(camera.getDistance()).eqls(1000);

    camera.setPosition([300, 250, 500]);
    expect(camera.getPosition()).eqls(vec3.fromValues(300, 250, 500));
  });

  it('should do `rotate` action correctly.', () => {
    const camera = canvas.getCamera();
    expect(camera.getFocalPoint()).eqls(vec3.fromValues(300, 250, 0));
    expect(camera.getPosition()).eqls(vec3.fromValues(300, 250, 500));
    expect(camera.getAzimuth()).to.be.almost.eqls(0);
    expect(camera.getElevation()).to.be.almost.eqls(0);
    expect(camera.getRoll()).to.be.almost.eqls(0);

    camera.rotate(30, 0, 0);
    expect(camera.getAzimuth()).to.be.almost.eqls(30);
    expect(camera.getElevation()).to.be.almost.eqls(0);
    expect(camera.getRoll()).to.be.almost.eqls(0);

    camera.rotate(0, 30, 0);
    expect(camera.getAzimuth()).to.be.almost.eqls(30);
    expect(camera.getElevation()).to.be.almost.eqls(30);
    expect(camera.getRoll()).to.be.almost.eqls(0);

    camera.rotate(0, 0, 30);
    expect(camera.getAzimuth()).to.be.almost.eqls(30);
    expect(camera.getElevation()).to.be.almost.eqls(30);
    expect(camera.getRoll()).to.be.almost.eqls(30);
  });
});
