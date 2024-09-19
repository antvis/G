import {
  MeshPhongMaterial,
  TorusGeometry,
  DirectionalLight,
  Mesh,
  Plugin as Plugin3D,
} from '@antv/g-plugin-3d';
import { Plugin as PluginControl } from '@antv/g-plugin-control';

export async function torus(context) {
  const { canvas, renderer } = context;

  // wait for canvas' initialization complete
  await canvas.ready;

  // use GPU device
  const plugin = renderer.getPlugin('device-renderer');
  const device = plugin.getDevice();

  const torusGeometry = new TorusGeometry(device, {
    tubeRadius: 30,
    ringRadius: 200,
  });
  const basicMaterial = new MeshPhongMaterial(device, {
    wireframe: true,
  });

  const torus = new Mesh({
    style: {
      transform: `translate3d(320, 250, 0)`,
      fill: 'white',
      opacity: 1,
      geometry: torusGeometry,
      material: basicMaterial,
    },
  });

  canvas.appendChild(torus);

  // add a directional light into scene
  const light = new DirectionalLight({
    style: {
      fill: 'white',
      direction: [-1, 0, 1],
      intensity: 3,
    },
  });
  canvas.appendChild(light);

  const camera = canvas.getCamera();
  camera.setPosition(300, 0, 500);
}

torus.initRenderer = (renderer, type) => {
  if (type === 'webgl' || type === 'webgpu') {
    renderer.registerPlugin(new Plugin3D());
    renderer.registerPlugin(new PluginControl());
  }
};
