import { CanvasEvent } from '../../../packages/g';
import {
  MeshPhongMaterial,
  SphereGeometry,
  Mesh,
  Plugin as Plugin3D,
  DirectionalLight,
  AmbientLight,
} from '../../../packages/g-plugin-3d';
import { Plugin as PluginControl } from '../../../packages/g-plugin-control';

export async function sphere(context) {
  const { canvas, renderer } = context;

  renderer.registerPlugin(new Plugin3D());
  renderer.registerPlugin(new PluginControl());

  // wait for canvas' initialization complete
  await canvas.ready;

  // use GPU device
  const plugin = renderer.getPlugin('device-renderer');
  const device = plugin.getDevice();

  const map = plugin.loadTexture(
    'https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*npAsSLPX4A4AAAAAAAAAAAAAARQnAQ',
  );
  const specularMap = plugin.loadTexture(
    'https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*8wz0QaP_bjoAAAAAAAAAAAAAARQnAQ',
  );
  const bumpMap = plugin.loadTexture(
    'https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*kuUITY47ZhMAAAAAAAAAAAAAARQnAQ',
  );
  const cloudMap = plugin.loadTexture(
    'https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*N2ooTq4cQroAAAAAAAAAAAAAARQnAQ',
  );

  // create a sphere geometry
  const sphereGeometry = new SphereGeometry(device, {
    radius: 200,
    latitudeBands: 32,
    longitudeBands: 32,
  });
  // create a material with Phong lighting model
  const basicMaterial = new MeshPhongMaterial(device, {
    map,
    specular: 'white',
    specularMap,
    bumpMap,
    bumpScale: 5,
    shininess: 10,
  });
  const cloudMaterial = new MeshPhongMaterial(device, {
    map: cloudMap,
    doubleSide: true,
    depthWrite: false,
  });

  // create a mesh
  const sphere = new Mesh({
    style: {
      x: 300,
      y: 250,
      z: 0,
      transformOrigin: 'center',
      fill: '#1890FF',
      opacity: 1,
      geometry: sphereGeometry,
      material: basicMaterial,
    },
  });
  canvas.appendChild(sphere);

  // const cloudMesh = new Mesh({
  //   style: {
  //     opacity: 0.2,
  //     geometry: sphereGeometry,
  //     material: cloudMaterial,
  //   },
  // });
  // sphere.appendChild(cloudMesh);

  // add a directional light into scene
  const light = new DirectionalLight({
    style: {
      fill: 'white',
      direction: [-1, 0, 1],
      intensity: 3,
    },
  });
  canvas.appendChild(light);

  const ambientLight = new AmbientLight({
    style: {
      fill: '#000',
      intensity: 1,
    },
  });
  canvas.appendChild(ambientLight);

  canvas.addEventListener(CanvasEvent.AFTER_RENDER, () => {
    sphere.rotate(0, 0.2, 0);
  });
}
