import { Canvas, CanvasEvent } from '@antv/g';
import { Renderer } from '@antv/g-webgl';
import {
  MeshPhongMaterial,
  SphereGeometry,
  AmbientLight,
  DirectionalLight,
  Mesh,
  Fog,
  FogType,
  Plugin as Plugin3D,
} from '@antv/g-plugin-3d';
import { Plugin as PluginControl } from '@antv/g-plugin-control';
import * as lil from 'lil-gui';
import Stats from 'stats.js';

// create a renderer
const renderer = new Renderer();
renderer.registerPlugin(new Plugin3D());
renderer.registerPlugin(new PluginControl());

// create a canvas
const canvas = new Canvas({
  container: 'container',
  width: 600,
  height: 500,
  renderer,
  background: 'black',
});

(async () => {
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
      fill: '#1890FF',
      opacity: 1,
      geometry: sphereGeometry,
      material: basicMaterial,
    },
  });
  sphere.setPosition(300, 250, 0);
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
    },
  });
  canvas.appendChild(light);

  const ambientLight = new AmbientLight({
    style: {
      fill: '#000',
    },
  });
  canvas.appendChild(ambientLight);

  // create fog, append to canvas later
  const fog = new Fog();

  // stats
  const stats = new Stats();
  stats.showPanel(0);
  const $stats = stats.dom;
  $stats.style.position = 'absolute';
  $stats.style.left = '0px';
  $stats.style.top = '0px';
  const $wrapper = document.getElementById('container');
  $wrapper.appendChild($stats);
  canvas.addEventListener(CanvasEvent.AFTER_RENDER, () => {
    if (stats) {
      stats.update();
    }
    sphere.setOrigin(0, 0, 0);
    sphere.rotate(0, 0.2, 0);
  });

  // GUI
  const gui = new lil.GUI({ autoPlace: false });
  $wrapper.appendChild(gui.domElement);

  const ambientFolder = gui.addFolder('ambient light');
  const ambientLightConfig = {
    fill: '#000',
  };
  ambientFolder.addColor(ambientLightConfig, 'fill').onChange((fill) => {
    ambientLight.style.fill = fill;
  });

  const lightFolder = gui.addFolder('directional light');
  const lightConfig = {
    fill: '#FFF',
    intensity: Math.PI,
    directionX: -1,
    directionY: 0,
    directionZ: 1,
  };
  lightFolder.addColor(lightConfig, 'fill').onChange((fill) => {
    light.style.fill = fill;
  });
  lightFolder.add(lightConfig, 'intensity', 0, 20).onChange((intensity) => {
    light.style.intensity = intensity;
  });
  lightFolder.add(lightConfig, 'directionX', -1, 1).onChange((directionX) => {
    const direction = light.style.direction;
    light.style.direction = [directionX, direction[1], direction[2]];
  });
  lightFolder.add(lightConfig, 'directionY', -1, 1).onChange((directionY) => {
    const direction = light.style.direction;
    light.style.direction = [direction[0], directionY, direction[2]];
  });
  lightFolder.add(lightConfig, 'directionZ', -1, 1).onChange((directionZ) => {
    const direction = light.style.direction;
    light.style.direction = [direction[0], direction[1], directionZ];
  });
  lightFolder.open();

  const fogFolder = gui.addFolder('fog');
  const fogConfig = {
    enable: false,
    type: FogType.NONE,
    fill: '#000',
    start: 1,
    end: 1000,
    density: 0,
  };
  fogFolder.add(fogConfig, 'enable').onChange((enable) => {
    if (enable) {
      canvas.appendChild(fog);
    } else {
      canvas.removeChild(fog);
    }
  });
  fogFolder
    .add(fogConfig, 'type', [
      FogType.NONE,
      FogType.EXP,
      FogType.EXP2,
      FogType.LINEAR,
    ])
    .onChange((type) => {
      fog.style.type = type;
    });
  fogFolder.addColor(fogConfig, 'fill').onChange((fill) => {
    fog.style.fill = fill;
  });
  fogFolder.add(fogConfig, 'start', 0, 1000).onChange((start) => {
    fog.style.start = start;
  });
  fogFolder.add(fogConfig, 'end', 0, 1000).onChange((end) => {
    fog.style.end = end;
  });
  fogFolder.add(fogConfig, 'density', 0, 5).onChange((density) => {
    fog.style.density = density;
  });
  fogFolder.open();

  const sphereFolder = gui.addFolder('sphere');
  const sphereConfig = {
    opacity: 1,
    fill: '#1890FF',
  };
  sphereFolder.add(sphereConfig, 'opacity', 0, 1, 0.1).onChange((opacity) => {
    sphere.style.opacity = opacity;
  });
  sphereFolder.addColor(sphereConfig, 'fill').onChange((color) => {
    sphere.style.fill = color;
  });
  sphereFolder.open();

  const geometryFolder = gui.addFolder('geometry');
  const geometryConfig = {
    radius: 200,
    latitudeBands: 32,
    longitudeBands: 32,
  };
  geometryFolder.add(geometryConfig, 'radius', 50, 300).onChange((radius) => {
    sphereGeometry.radius = radius;
  });
  geometryFolder
    .add(geometryConfig, 'latitudeBands', 8, 64, 1)
    .onChange((latitudeBands) => {
      sphereGeometry.latitudeBands = latitudeBands;
    });
  geometryFolder
    .add(geometryConfig, 'longitudeBands', 8, 64, 1)
    .onChange((longitudeBands) => {
      sphereGeometry.longitudeBands = longitudeBands;
    });
  geometryFolder.open();

  const materialFolder = gui.addFolder('material');
  const materialConfig = {
    map: 'https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*npAsSLPX4A4AAAAAAAAAAAAAARQnAQ',
    emissive: '#000000',
    specular: '#FFFFFF',
    specularMap:
      'https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*8wz0QaP_bjoAAAAAAAAAAAAAARQnAQ',
    shininess: 10,
    bumpMap:
      'https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*kuUITY47ZhMAAAAAAAAAAAAAARQnAQ',
    bumpScale: 5,
    wireframe: false,
  };
  materialFolder
    .add(materialConfig, 'map', [
      'https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*npAsSLPX4A4AAAAAAAAAAAAAARQnAQ',
      'https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*N4ZMS7gHsUIAAAAAAAAAAABkARQnAQ',
      'none',
    ])
    .onChange((mapURL) => {
      if (mapURL === 'none') {
        sphere.style.material.map = null;
      } else {
        const map = plugin.loadTexture(mapURL);
        sphere.style.material.map = map;
      }
    });
  materialFolder.addColor(materialConfig, 'emissive').onChange((emissive) => {
    sphere.style.material.emissive = emissive;
  });
  materialFolder.addColor(materialConfig, 'specular').onChange((specular) => {
    sphere.style.material.specular = specular;
  });
  materialFolder
    .add(materialConfig, 'specularMap', [
      'https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*8wz0QaP_bjoAAAAAAAAAAAAAARQnAQ',
      'none',
    ])
    .onChange((specularMapURL) => {
      if (specularMapURL === 'none') {
        sphere.style.material.specularMap = null;
      } else {
        const specularMap = plugin.loadTexture(specularMapURL);
        sphere.style.material.specularMap = specularMap;
      }
    });
  materialFolder
    .add(materialConfig, 'shininess', 0, 100)
    .onChange((shininess) => {
      sphere.style.material.shininess = shininess;
    });
  materialFolder
    .add(materialConfig, 'bumpMap', [
      'https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*kuUITY47ZhMAAAAAAAAAAAAAARQnAQ',
      'none',
    ])
    .onChange((bumpMapURL) => {
      if (bumpMapURL === 'none') {
        sphere.style.material.bumpMap = null;
      } else {
        const bumpMap = plugin.loadTexture(bumpMapURL);
        sphere.style.material.bumpMap = bumpMap;
      }
    });
  materialFolder
    .add(materialConfig, 'bumpScale', 0, 10)
    .onChange((bumpScale) => {
      sphere.style.material.bumpScale = bumpScale;
    });
  materialFolder.add(materialConfig, 'wireframe').onChange((enable) => {
    sphere.style.material.wireframe = !!enable;
  });
  materialFolder.open();
})();
