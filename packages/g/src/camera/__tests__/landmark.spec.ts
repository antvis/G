import chai, { expect } from 'chai';
// @ts-ignore
import chaiAlmost from 'chai-almost';
// @ts-ignore
import sinon from 'sinon';
// @ts-ignore
import sinonChai from 'sinon-chai';
import { vec3 } from 'gl-matrix';
import { Camera, Landmark, Circle, Canvas } from '../../../lib';
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

  it('should save camera state in landmark', () => {
    const camera = new Camera();
    const landmark = new Landmark('test', camera);

    expect(landmark.name).eqls('test');
    expect(landmark.getPosition()).eqls(vec3.fromValues(0, 0, 1));
    expect(landmark.getFocalPoint()).eqls(vec3.fromValues(0, 0, 0));
    expect(landmark.getRoll()).eqls(0);
    expect(landmark.getZoom()).eqls(1);

    const anotherCamera = new Camera();

    landmark.retrieve(anotherCamera);

    expect(anotherCamera.roll).eqls(0);
  });

  it('should do camera animation with landmarks', async () => {
    const camera = canvas.getCamera();
    const landmark = camera.createLandmark('mark1', {
      position: [100, 100],
      focalPoint: [100, 100],
      roll: 0,
      zoom: 2,
    });

    camera.gotoLandmark('mark1', 100);

    await sleep(200);

    camera.gotoLandmark(landmark, {
      duration: 100,
      easing: 'easeOut',
    });

    await sleep(200);

    expect(camera.getZoom()).to.be.eqls(2);
    expect(camera.getPosition()).to.be.eqls(vec3.fromValues(100, 100, 0));
  });
});
