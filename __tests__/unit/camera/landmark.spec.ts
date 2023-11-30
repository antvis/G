import { vec3 } from 'gl-matrix';
import { Renderer as CanvasRenderer } from '../../../packages/g-svg/src';
import { AdvancedCamera, Canvas } from '../../../packages/g/src';
import { sleep } from '../utils';

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

describe('Camera landmark', () => {
  afterEach(() => {
    canvas.destroyChildren();
  });

  afterAll(() => {
    canvas.destroy();
  });

  it('should save default camera state in landmark', () => {
    const camera = new AdvancedCamera();
    const landmark = camera.createLandmark('test');
    expect(landmark.name).toBe('test');
    expect(landmark.right).toStrictEqual(vec3.fromValues(1, 0, 0));
    expect(landmark.up).toStrictEqual(vec3.fromValues(0, 1, 0));
    expect(landmark.forward).toStrictEqual(vec3.fromValues(0, 0, 1));
    expect(landmark.position).toStrictEqual(vec3.fromValues(0, 0, 1));
    expect(landmark.focalPoint).toStrictEqual(vec3.fromValues(0, 0, 0));
    expect(landmark.azimuth).toBeCloseTo(0);
    expect(landmark.elevation).toBe(0);
    expect(landmark.roll).toBe(0);
    expect(landmark.relAzimuth).toBe(0);
    expect(landmark.relElevation).toBe(0);
    expect(landmark.relRoll).toBe(0);
    expect(landmark.zoom).toBe(1);
    expect(landmark.distance).toBe(1);
    expect(landmark.distanceVector).toStrictEqual(vec3.fromValues(0, 0, -1));
    expect(landmark.dollyingStep).toBe(0.01);
    // matrix: mat4;
  });

  it('should do camera animation with landmarks', async () => {
    const camera = canvas.getCamera();
    const landmark = camera.createLandmark('mark1', {
      position: [100, 100],
      focalPoint: [100, 100],
      roll: 0,
      zoom: 2,
    });

    camera.gotoLandmark('mark1');
    camera.gotoLandmark(landmark, {
      duration: 100,
    });
    camera.gotoLandmark(landmark, {
      duration: 100,
      easing: 'easeOut',
    });
    const finishCallback = jest.fn();
    camera.gotoLandmark(landmark, {
      duration: 100,
      easing: 'easeOut',
      easingFunction: (t) => t,
      onfinish: finishCallback,
    });

    await sleep(1000);
    expect(finishCallback).toBeCalled();

    expect(camera.getPosition()).toStrictEqual(vec3.fromValues(100, 100, 500));
    expect(camera.getFocalPoint()).toStrictEqual(vec3.fromValues(100, 100, 0));
    expect(camera.getZoom()).toBe(2);
    expect(camera.getRoll()).toBe(0);

    const landmark2 = camera.createLandmark('mark2', {
      position: [100, 100, 500],
      focalPoint: [100, 100, 0],
      roll: 30,
    });
    expect(landmark2.position).toStrictEqual(vec3.fromValues(100, 100, 500));
    expect(landmark2.focalPoint).toStrictEqual(vec3.fromValues(100, 100, 0));

    camera.gotoLandmark(landmark2, 100);
    await sleep(500);
    expect(camera.getPosition()).toStrictEqual(vec3.fromValues(100, 100, 500));
    expect(camera.getFocalPoint()).toStrictEqual(vec3.fromValues(100, 100, 0));
    expect(camera.getRoll()).toBe(30);
    expect(camera.getZoom()).toBe(2);
  });
});
