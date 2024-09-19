import { CanvasEvent, Canvas } from '@antv/g';
import {
  CubeGeometry,
  CylinderGeometry,
  MeshPhongMaterial,
  MeshBasicMaterial,
  DirectionalLight,
  Mesh,
  Plugin as Plugin3D,
} from '@antv/g-plugin-3d';
import { ARButton, Renderer } from '@antv/g-webgl';

/**
 * @see https://github.com/immersive-web/webxr-samples/blob/main/hit-test.html
 */
export async function hit_test(context: {
  canvas: Canvas;
  renderer: Renderer;
  container: HTMLDivElement;
}) {
  const { canvas, renderer, container } = context;

  // wait for canvas' initialization complete
  await canvas.ready;

  // use GPU device
  const plugin = renderer.getPlugin('device-renderer');
  const device = plugin.getDevice();

  // create a sphere geometry
  const cylinderGeometry = new CylinderGeometry(device, {
    radius: 100,
    height: 50,
  });
  // create a material with Phong lighting model
  const material = new MeshPhongMaterial(device, {
    shininess: 30,
  });

  // 1. load texture with URL
  const map = plugin.loadTexture(
    'https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*_aqoS73Se3sAAAAAAAAAAAAAARQnAQ',
  );
  const cubeGeometry = new CubeGeometry(device, {
    width: 200,
    height: 200,
    depth: 200,
  });
  const basicMaterial = new MeshBasicMaterial(device, {
    // wireframe: true,
    map,
  });

  const reticle = new Mesh({
    style: {
      fill: 'red',
      opacity: 1,
      geometry: cylinderGeometry,
      material,
    },
  });
  reticle.setPosition(300, 300, 0);
  canvas.appendChild(reticle);

  // add a directional light into scene
  const light = new DirectionalLight({
    style: {
      fill: 'white',
      direction: [-1, 0, 1],
    },
  });
  canvas.appendChild(light);

  // adjust camera's position
  const camera = canvas.getCamera();
  camera.setPerspective(0.1, 1000, 45, 640 / 640);

  let hitTestSource: XRHitTestSource | null = null;
  let hitTestSourceRequested = false;
  let xrViewerSpace: XRReferenceSpace | null = null;
  canvas.addEventListener(CanvasEvent.BEFORE_RENDER, (e) => {
    const frame = e.detail as XRFrame;
    if (frame) {
      const referenceSpace = renderer.xr.getReferenceSpace();
      const session = renderer.xr.getSession();
      let pose = frame.getViewerPose(referenceSpace);

      reticle.style.visibility = 'hidden';

      if (hitTestSourceRequested === false) {
        session.requestReferenceSpace('viewer').then(function (referenceSpace) {
          xrViewerSpace = referenceSpace;
          session
            .requestHitTestSource?.({ space: referenceSpace })
            ?.then(function (source) {
              hitTestSource = source;
            });
        });

        session.addEventListener('end', function () {
          hitTestSourceRequested = false;
          hitTestSource = null;
        });

        hitTestSourceRequested = true;
      }

      if (hitTestSource && pose) {
        const hitTestResults = frame.getHitTestResults(hitTestSource);

        if (hitTestResults.length) {
          const hit = hitTestResults[0];
          reticle.style.visibility = 'visible';
          reticle.setLocalTransform(
            hit.getPose(referenceSpace)?.transform.matrix,
          );

          // console.log('position', reticle.getLocalPosition());
          // console.log('rotation', reticle.getRotation());
          // console.log('scale', reticle.getScale());

          const [x, y, z] = reticle.getLocalPosition();

          const width =
            session.renderState.baseLayer?.framebufferWidth! /
            window.devicePixelRatio;
          const height =
            session.renderState.baseLayer?.framebufferHeight! /
            window.devicePixelRatio;

          $domOverlay.innerHTML = `${x}, ${y}, ${z}, ${width}, ${height}`;

          // console.log(`${x}, ${y}, ${z}, ${width}, ${height}`);

          reticle.setLocalPosition(
            x * width + width / 2,
            height - y * height - height / 2,
            z,
          );
        } else {
          reticle.style.visibility = 'hidden';
        }
      }
    }
    // sphere.rotate(0, 0.1, 0);
  });

  canvas.getConfig().disableHitTesting = true;

  const $domOverlay = document.createElement('div');
  $domOverlay.id = 'overlay';
  document.body.appendChild($domOverlay);

  const $button = ARButton.createButton(canvas, renderer, {
    // @see https://github.com/immersive-web/webxr-samples/blob/main/hit-test.html
    requiredFeatures: ['local', 'hit-test', 'dom-overlay'],
    domOverlay: {
      root: document.getElementById('overlay')!,
    },
  });
  container.appendChild($button);

  const controller = renderer.xr.getController(0);
  controller.addEventListener('select', (e) => {
    if (reticle.style.visibility === 'visible') {
      const cube = new Mesh({
        style: {
          fill: '#1890FF',
          opacity: 1,
          geometry: cubeGeometry,
          material: basicMaterial,
        },
      });
      cube.setLocalTransform(reticle.getLocalTransform());
      canvas.appendChild(cube);
    }
  });
  canvas.appendChild(controller);
}

hit_test.initRenderer = (renderer) => {
  renderer.registerPlugin(new Plugin3D());
};
