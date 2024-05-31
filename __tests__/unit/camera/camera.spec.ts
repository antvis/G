import { mat4, vec3 } from 'gl-matrix';
import { toBeDeepCloseTo, toMatchCloseTo } from 'jest-matcher-deep-close-to';
import { Renderer as CanvasRenderer } from '../../../packages/g-svg/src';
import {
  AdvancedCamera,
  CameraProjectionMode,
  Canvas,
  ClipSpaceNearZ,
} from '../../../packages/g/src';

expect.extend({ toBeDeepCloseTo, toMatchCloseTo });

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

describe('Camera', () => {
  it('should create an ortho camera correctly', () => {
    const width = 600;
    const height = 500;
    const camera = new AdvancedCamera()
      .setPosition(width / 2, height / 2, 500)
      .setFocalPoint(width / 2, height / 2, 0)
      .setOrthographic(
        width / -2,
        width / 2,
        height / -2,
        height / 2,
        0.1,
        1000,
      );

    expect(camera.getProjectionMode()).toBe(CameraProjectionMode.ORTHOGRAPHIC);
    expect(camera.getZoom()).toBe(1);
    expect(camera.getFar()).toBe(1000);
    expect(camera.getNear()).toBe(0.1);
    expect(camera.getPosition()).toStrictEqual(vec3.fromValues(300, 250, 500));
    expect(camera.getFocalPoint()).toStrictEqual(vec3.fromValues(300, 250, 0));
    expect(camera.getDistance()).toBe(500);

    expect(camera.getViewTransform()).toStrictEqual(
      mat4.fromValues(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, -300, -250, -500, 1),
    );
    expect(camera.getWorldTransform()).toStrictEqual(
      mat4.fromValues(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 300, 250, 500, 1),
    );

    expect(camera.getPerspective()).toBeDeepCloseTo(
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

    expect(camera.getPerspectiveInverse()).toBeDeepCloseTo(
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
    expect(frustum.planes.length).toBe(6);

    camera.setFocalPoint(300, 250, 100);
    expect(camera.getFocalPoint()).toStrictEqual(
      vec3.fromValues(300, 250, 100),
    );
    expect(camera.getPosition()).toStrictEqual(vec3.fromValues(300, 250, 500));
    expect(camera.getDistance()).toBe(400);

    // nothing changed in ortho camera
    camera.setFov(60);
    camera.setAspect(2);
    expect(camera.getFocalPoint()).toStrictEqual(
      vec3.fromValues(300, 250, 100),
    );
    expect(camera.getPosition()).toStrictEqual(vec3.fromValues(300, 250, 500));

    camera.setNear(10);
    camera.setFar(200);
    expect(camera.getFar()).toBe(200);
    expect(camera.getNear()).toBe(10);

    camera.setRoll(0);
    expect(camera.getRoll()).toBe(0);
    camera.setElevation(0);
    expect(camera.getElevation()).toBe(0);
    camera.setAzimuth(0);
    expect(camera.getAzimuth()).toBe(0);
  });

  it('should create an orthoZO camera correctly', () => {
    const width = 600;
    const height = 500;
    const camera = new AdvancedCamera();
    camera.clipSpaceNearZ = ClipSpaceNearZ.ZERO;
    camera
      .setPosition(width / 2, height / 2, 500)
      .setFocalPoint(width / 2, height / 2, 0)
      .setOrthographic(
        width / -2,
        width / 2,
        height / -2,
        height / 2,
        0.1,
        1000,
      );

    expect(camera.getProjectionMode()).toBe(CameraProjectionMode.ORTHOGRAPHIC);
    expect(camera.getZoom()).toBe(1);
    expect(camera.getFar()).toBe(1000);
    expect(camera.getNear()).toBe(0.1);
    expect(camera.getPosition()).toStrictEqual(vec3.fromValues(300, 250, 500));
    expect(camera.getFocalPoint()).toStrictEqual(vec3.fromValues(300, 250, 0));
    expect(camera.getDistance()).toBe(500);

    expect(camera.getViewTransform()).toStrictEqual(
      mat4.fromValues(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, -300, -250, -500, 1),
    );
    expect(camera.getWorldTransform()).toStrictEqual(
      mat4.fromValues(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 300, 250, 500, 1),
    );

    expect(camera.getPerspective()).toBeDeepCloseTo(
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
        -0.00010001000191550702,
        1,
      ),
    );
  });

  it('should create an perspective camera correctly', () => {
    const width = 600;
    const height = 500;
    const camera = new AdvancedCamera();
    camera
      .setPosition(width / 2, height / 2, 500)
      .setFocalPoint(width / 2, height / 2, 0)
      .setPerspective(0.1, 1000, 45, width / height);

    expect(camera.getProjectionMode()).toBe(CameraProjectionMode.PERSPECTIVE);
    expect(camera.getZoom()).toBe(1);
    expect(camera.getFar()).toBe(1000);
    expect(camera.getNear()).toBe(0.1);
    expect(camera.getPosition()).toStrictEqual(vec3.fromValues(300, 250, 500));
    expect(camera.getFocalPoint()).toStrictEqual(vec3.fromValues(300, 250, 0));
    expect(camera.getDistance()).toBe(500);

    expect(camera.getViewTransform()).toStrictEqual(
      mat4.fromValues(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, -300, -250, -500, 1),
    );
    expect(camera.getWorldTransform()).toStrictEqual(
      mat4.fromValues(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 300, 250, 500, 1),
    );

    expect(camera.getPerspective()).toBeDeepCloseTo(
      mat4.fromValues(
        2.0118446350097656,
        0,
        0,
        0,
        -0,
        -2.4142136573791504,
        -0,
        -0,
        0,
        0,
        -1.0002000331878662,
        -1,
        -0,
        0,
        -0.20002000033855438,
        0,
      ),
    );
  });

  it('should create an perspectiveZO camera correctly', () => {
    const width = 600;
    const height = 500;
    const camera = new AdvancedCamera();
    camera.clipSpaceNearZ = ClipSpaceNearZ.ZERO;
    camera
      .setPosition(width / 2, height / 2, 500)
      .setFocalPoint(width / 2, height / 2, 0)
      .setPerspective(0.1, 1000, 45, width / height);

    expect(camera.getProjectionMode()).toBe(CameraProjectionMode.PERSPECTIVE);
    expect(camera.getZoom()).toBe(1);
    expect(camera.getFar()).toBe(1000);
    expect(camera.getNear()).toBe(0.1);
    expect(camera.getPosition()).toStrictEqual(vec3.fromValues(300, 250, 500));
    expect(camera.getFocalPoint()).toStrictEqual(vec3.fromValues(300, 250, 0));
    expect(camera.getDistance()).toBe(500);

    expect(camera.getViewTransform()).toStrictEqual(
      mat4.fromValues(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, -300, -250, -500, 1),
    );
    expect(camera.getWorldTransform()).toStrictEqual(
      mat4.fromValues(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 300, 250, 500, 1),
    );

    expect(camera.getPerspective()).toBeDeepCloseTo(
      mat4.fromValues(
        2.0118446350097656,
        0,
        0,
        0,
        -0,
        -2.4142136573791504,
        -0,
        -0,
        0,
        0,
        -1.0002000331878662,
        -1,
        -0,
        0,
        -0.10001000016927719,
        0,
      ),
    );
  });

  it('should setDistance correctly.', () => {
    const width = 600;
    const height = 500;
    const camera = new AdvancedCamera()
      .setPosition(width / 2, height / 2, 500)
      .setFocalPoint(width / 2, height / 2, 0)
      .setOrthographic(
        width / -2,
        width / 2,
        height / -2,
        height / 2,
        0.1,
        1000,
      );

    expect(camera.getPosition()).toStrictEqual(vec3.fromValues(300, 250, 500));
    expect(camera.getFocalPoint()).toStrictEqual(vec3.fromValues(300, 250, 0));
    expect(camera.getDistance()).toBe(500);

    camera.setDistance(500);
    expect(camera.getDistance()).toBe(500);

    camera.setDistance(-500);
    expect(camera.getDistance()).toBe(500);

    camera.setDistance(0.00000001);
    expect(camera.getDistance()).toBe(0.0002);

    camera.setDistance(400);
    expect(camera.getPosition()).toStrictEqual(vec3.fromValues(300, 250, 400));
    expect(camera.getFocalPoint()).toStrictEqual(vec3.fromValues(300, 250, 0));
    expect(camera.getDistance()).toBe(400);
  });

  it('should setViewOffset correctly.', () => {
    const width = 600;
    const height = 500;
    const camera = new AdvancedCamera()
      .setPosition(width / 2, height / 2, 500)
      .setFocalPoint(width / 2, height / 2, 0)
      .setOrthographic(
        width / -2,
        width / 2,
        height / -2,
        height / 2,
        0.1,
        1000,
      );

    expect(camera.getPosition()).toStrictEqual(vec3.fromValues(300, 250, 500));
    expect(camera.getFocalPoint()).toStrictEqual(vec3.fromValues(300, 250, 0));
    expect(camera.getDistance()).toBe(500);

    camera.setEnableUpdate(false);
    camera.setViewOffset(600, 500, 0, 0, 300, 250);
    camera.setEnableUpdate(true);

    expect(camera.getView()).toStrictEqual({
      enabled: true,
      fullHeight: 500,
      fullWidth: 600,
      height: 250,
      offsetX: 0,
      offsetY: 0,
      width: 300,
    });
    expect(camera.getViewTransform()).toStrictEqual(
      mat4.fromValues(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, -300, -250, -500, 1),
    );
    expect(camera.getWorldTransform()).toStrictEqual(
      mat4.fromValues(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 300, 250, 500, 1),
    );

    expect(camera.getPerspective()).toBeDeepCloseTo(
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
        1,
        -1.0002000331878662,
        1,
      ),
    );

    camera.clearViewOffset();

    expect(camera.getViewTransform()).toStrictEqual(
      mat4.fromValues(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, -300, -250, -500, 1),
    );
    expect(camera.getWorldTransform()).toStrictEqual(
      mat4.fromValues(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 300, 250, 500, 1),
    );

    expect(camera.getPerspective()).toBeDeepCloseTo(
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
      .setOrthographic(
        width / -2,
        width / 2,
        height / -2,
        height / 2,
        0.1,
        1000,
      );

    camera.jitterProjectionMatrix(1, 1);

    expect(camera.getPerspective()).toBeDeepCloseTo(
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
    expect(camera.getFocalPoint()).toStrictEqual(vec3.fromValues(300, 250, 0));
    expect(camera.getPosition()).toStrictEqual(vec3.fromValues(300, 250, 500));

    camera.pan(100, 100);
    expect(camera.getFocalPoint()).toStrictEqual(vec3.fromValues(300, 250, 0));
    expect(camera.getPosition()).toStrictEqual(vec3.fromValues(400, 350, 500));

    camera.pan(-100, -100);
    expect(camera.getFocalPoint()).toStrictEqual(vec3.fromValues(300, 250, 0));
    expect(camera.getPosition()).toStrictEqual(vec3.fromValues(300, 250, 500));
  });

  it('should do `dolly` action correctly.', () => {
    const camera = canvas.getCamera();
    expect(camera.getFocalPoint()).toStrictEqual(vec3.fromValues(300, 250, 0));
    expect(camera.getPosition()).toStrictEqual(vec3.fromValues(300, 250, 500));
    expect(camera.getDistance()).toBe(500);
    expect(camera.getDollyingStep()).toBe(500 / 100);

    camera.dolly(100);
    expect(camera.getDollyingStep()).toBe(10);
    expect(camera.getFocalPoint()).toStrictEqual(vec3.fromValues(300, 250, 0));
    // dollyStep = 500 / 100
    expect(camera.getPosition()).toStrictEqual(
      vec3.fromValues(300, 250, 500 + (500 / 100) * 100),
    );
    expect(camera.getDistance()).toBe(1000);

    // account for min & max distance
    camera.setMinDistance(100);
    camera.dolly(-100000);
    expect(camera.getDistance()).toBe(100);
    camera.setMaxDistance(1000);
    camera.dolly(100000);
    expect(camera.getDistance()).toBe(1000);

    camera.setPosition([300, 250, 500]);
    expect(camera.getPosition()).toStrictEqual(vec3.fromValues(300, 250, 500));
  });

  it('should do `rotate` action correctly.', () => {
    const camera = canvas.getCamera();
    expect(camera.getFocalPoint()).toStrictEqual(vec3.fromValues(300, 250, 0));
    expect(camera.getPosition()).toStrictEqual(vec3.fromValues(300, 250, 500));
    expect(camera.getAzimuth()).toBeCloseTo(0);
    expect(camera.getElevation()).toBeCloseTo(0);
    expect(camera.getRoll()).toBeCloseTo(0);

    camera.rotate(30, 0, 0);
    expect(camera.getAzimuth()).toBeCloseTo(30);
    expect(camera.getElevation()).toBeCloseTo(0);
    expect(camera.getRoll()).toBeCloseTo(0);

    camera.rotate(0, 30, 0);
    expect(camera.getAzimuth()).toBeCloseTo(30);
    expect(camera.getElevation()).toBeCloseTo(30);
    expect(camera.getRoll()).toBeCloseTo(0);

    camera.rotate(0, 0, 30);
    expect(camera.getAzimuth()).toBeCloseTo(30);
    expect(camera.getElevation()).toBeCloseTo(30);
    expect(camera.getRoll()).toBeCloseTo(30);
  });
});
