import { CanvasEvent } from '@antv/g';
import {
  MeshBasicMaterial,
  CubeGeometry,
  Mesh,
  Plugin as Plugin3D,
} from '@antv/g-plugin-3d';
import { Plugin as PluginControl } from '@antv/g-plugin-control';
import { ARButton, DeviceRenderer } from '@antv/g-webgl';

export async function ar(context) {
  const { canvas, renderer, container } = context;

  //   renderer.getConfig().enableDirtyCheck = false;

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

    // width: 1,
    // height: 1,
    // depth: 1,
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

  // cube.setOrigin(300, 250, 200);
  cube.setPosition(300, 250, -200);

  canvas.appendChild(cube);

  // Called every time a XRSession requests that a new frame be drawn.
  // @see https://github.com/immersive-web/webxr-samples/blob/main/immersive-ar-session.html#L173
  canvas.addEventListener(CanvasEvent.AFTER_RENDER, () => {
    cube.rotate(0, 0.2, 0);
  });

  canvas.getConfig().disableHitTesting = true;

  const $button = ARButton.createButton(canvas, renderer, {});
  container.appendChild($button);
}

ar.initRenderer = (renderer, type) => {
  if (type === 'webgl' || type === 'webgpu') {
    renderer.registerPlugin(new Plugin3D());
    renderer.registerPlugin(new PluginControl());
  }
};
