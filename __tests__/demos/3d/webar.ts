import { CanvasEvent } from '../../../packages/g';
import {
  MeshBasicMaterial,
  CubeGeometry,
  Mesh,
  Plugin as Plugin3D,
} from '../../../packages/g-plugin-3d';
import { Plugin as PluginControl } from '../../../packages/g-plugin-control';
import { ARButton, DeviceRenderer } from '../../../packages/g-webgl';

export async function ar(context) {
  const { canvas, renderer, container } = context;

  // wait for canvas' initialization complete
  await canvas.ready;

  // use GPU device
  const plugin = renderer.getPlugin('device-renderer') as DeviceRenderer.Plugin;
  const device = plugin.getDevice();

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

  const cube = new Mesh({
    style: {
      fill: '#1890FF',
      opacity: 1,
      geometry: cubeGeometry,
      material: basicMaterial,
    },
  });

  cube.setPosition(300, 250, 200);

  canvas.appendChild(cube);

  //   canvas.addEventListener(CanvasEvent.AFTER_RENDER, () => {
  //     cube.rotate(1, 0, 0);
  //   });

  const $button = ARButton.createButton(canvas, renderer, {});
  container.appendChild($button);
}

ar.initRenderer = (renderer, type) => {
  if (type === 'webgl' || type === 'webgpu') {
    renderer.registerPlugin(new Plugin3D());
    renderer.registerPlugin(new PluginControl());
  }
};
