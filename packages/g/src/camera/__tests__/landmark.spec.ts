import chai, { expect } from 'chai';
// @ts-ignore
import chaiAlmost from 'chai-almost';
// @ts-ignore
import sinon from 'sinon';
// @ts-ignore
import sinonChai from 'sinon-chai';
import { vec3 } from 'gl-matrix';
import { Camera, Canvas } from '../../../lib';
import { Renderer as CanvasRenderer } from '@antv/g-canvas';
import { sleep } from '../../__tests__/utils';

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

describe('Camera landmark', () => {
  afterEach(() => {
    canvas.removeChildren();
  });

  afterAll(() => {
    canvas.destroy();
  });

  it('should save default camera state in landmark', () => {
    const camera = new Camera();
    const landmark = camera.createLandmark('test');
    expect(landmark.name).eqls('test');
    expect(landmark.right).eqls(vec3.fromValues(1, 0, 0));
    expect(landmark.up).eqls(vec3.fromValues(0, 1, 0));
    expect(landmark.forward).eqls(vec3.fromValues(0, 0, 1));
    expect(landmark.position).eqls(vec3.fromValues(0, 0, 1));
    expect(landmark.focalPoint).eqls(vec3.fromValues(0, 0, 0));
    expect(landmark.azimuth).to.be.almost.eqls(0);
    expect(landmark.elevation).eqls(0);
    expect(landmark.roll).eqls(0);
    expect(landmark.relAzimuth).eqls(0);
    expect(landmark.relElevation).eqls(0);
    expect(landmark.relRoll).eqls(0);
    expect(landmark.zoom).eqls(1);
    expect(landmark.distance).eqls(1);
    expect(landmark.distanceVector).eqls(vec3.fromValues(0, 0, -1));
    expect(landmark.dollyingStep).eqls(0.01);
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
    const finishCallback = sinon.spy();
    camera.gotoLandmark(landmark, {
      duration: 100,
      easing: 'easeOut',
      easingFunction: (t) => t,
      onfinish: () => {
        expect(finishCallback).to.have.been.called;
      },
    });

    await sleep(300);

    expect(camera.getPosition()).to.be.eqls(vec3.fromValues(100, 100, 500));
    expect(camera.getFocalPoint()).to.be.eqls(vec3.fromValues(100, 100, 0));
    expect(camera.getZoom()).to.be.eqls(2);
    expect(camera.getRoll()).to.be.eqls(0);

    const landmark2 = camera.createLandmark('mark2', {
      position: [100, 100, 500],
      focalPoint: [100, 100, 0],
      roll: 30,
    });
    expect(landmark2.position).to.be.eqls(vec3.fromValues(100, 100, 500));
    expect(landmark2.focalPoint).to.be.eqls(vec3.fromValues(100, 100, 0));

    camera.gotoLandmark(landmark2, 100);
    await sleep(200);
    expect(camera.getPosition()).to.be.eqls(vec3.fromValues(100, 100, 500));
    expect(camera.getFocalPoint()).to.be.eqls(vec3.fromValues(100, 100, 0));
    expect(camera.getRoll()).to.be.eqls(30);
    expect(camera.getZoom()).to.be.eqls(2);
  });
});
