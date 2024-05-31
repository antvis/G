import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import Stats from 'stats.js';
import SimplexNoise from 'simplex-noise';
import { Canvas, CanvasEvent } from '@antv/g';
import { Renderer as WebGLRenderer } from '@antv/g-webgl';
import {
  Mesh,
  SphereGeometry,
  PlaneGeometry,
  MeshBasicMaterial,
  Fog,
  FogType,
  Plugin as Plugin3D,
  CullMode,
  VertexAttributeBufferIndex,
  VertexAttributeLocation,
} from '@antv/g-plugin-3d';
import { Plugin as PluginControl } from '@antv/g-plugin-control';

/**
 * ported from https://medium.com/@mag_ops/music-visualiser-with-three-js-web-audio-api-b30175e7b5ba
 * Web Audio API @see https://developer.mozilla.org/zh-CN/docs/Web/API/AudioContext
 */

const App = function MusicViz() {
  const containerRef = useRef(null);
  const audioRef = useRef(null);
  let analyser;
  let dataArray;
  const noise = new SimplexNoise();

  useEffect(() => {
    // create a webgl renderer
    const renderer = new WebGLRenderer();
    renderer.registerPlugin(new Plugin3D());
    renderer.registerPlugin(new PluginControl());

    // create a canvas
    const canvas = new Canvas({
      container: containerRef.current,
      width: 600,
      height: 500,
      renderer,
      background: '#120f6c',
    });

    const camera = canvas.getCamera();
    camera.setPosition(300, 100, 500);
    camera.setPerspective(0.1, 1000, 75, 600 / 500);

    canvas.appendChild(
      new Fog({
        style: {
          fill: 'purple',
          type: FogType.EXP2,
          density: 0.0015,
          start: 0,
          end: 0,
        },
      }),
    );

    (async () => {
      await canvas.ready;

      const plugin = renderer.getPlugin('device-renderer');
      const device = plugin.getDevice();

      const sphereGeometry = new SphereGeometry(device, {
        radius: 100,
        latitudeBands: 32,
        longitudeBands: 32,
      });
      const groundGeometry = new PlaneGeometry(device, {
        width: 800,
        depth: 800,
        widthSegments: 20,
        depthSegments: 20,
      });
      const skyGeometry = new PlaneGeometry(device, {
        width: 800,
        depth: 800,
        widthSegments: 20,
        depthSegments: 20,
      });
      const planeMaterial = new MeshBasicMaterial(device, {
        wireframe: true,
        wireframeColor: 'purple',
        cullMode: CullMode.NONE,
      });
      const basicMaterial = new MeshBasicMaterial(device, {
        wireframe: true,
        wireframeColor: '#ff00ee',
      });

      const sphere = new Mesh({
        style: {
          fill: '#120f6c',
          opacity: 1,
          geometry: sphereGeometry,
          material: basicMaterial,
        },
      });
      sphere.setPosition(300, 200);
      canvas.appendChild(sphere);

      const ground = new Mesh({
        style: {
          fill: '#120f6c',
          opacity: 1,
          geometry: groundGeometry,
          material: planeMaterial,
        },
      });
      ground.setPosition(300, 250);
      canvas.appendChild(ground);

      const sky = new Mesh({
        style: {
          fill: 'white',
          opacity: 1,
          geometry: skyGeometry,
          material: planeMaterial,
        },
      });
      sky.setPosition(300, 0);
      canvas.appendChild(sky);

      canvas.addEventListener(CanvasEvent.AFTER_RENDER, () => {
        if (stats) {
          stats.update();
        }

        canvas.document.documentElement.setOrigin(300, 250, 0);
        canvas.document.documentElement.rotate(0, 0.2, 0);

        if (analyser && dataArray) {
          analyser.getByteFrequencyData(dataArray);

          const lowerHalfArray = dataArray.slice(0, dataArray.length / 2 - 1);
          const upperHalfArray = dataArray.slice(
            dataArray.length / 2 - 1,
            dataArray.length - 1,
          );

          const overallAvg = avg(dataArray);
          const lowerMax = max(lowerHalfArray);
          const lowerAvg = avg(lowerHalfArray);
          const upperMax = max(upperHalfArray);
          const upperAvg = avg(upperHalfArray);

          const lowerMaxFr = lowerMax / lowerHalfArray.length;
          const lowerAvgFr = lowerAvg / lowerHalfArray.length;
          const upperMaxFr = upperMax / upperHalfArray.length;
          const upperAvgFr = upperAvg / upperHalfArray.length;

          makeRoughGround(groundGeometry, modulate(lowerMaxFr, 0, 1, 0.5, 4));
          makeRoughGround(skyGeometry, modulate(upperAvgFr, 0, 1, 0.5, 4));
          makeRoughBall(
            sphereGeometry,
            modulate(Math.pow(lowerMaxFr, 0.8), 0, 1, 0, 8),
            modulate(upperAvgFr, 0, 1, 0, 4),
          );
        }
      });

      const makeRoughGround = (geometry, distortionFr) => {
        const bufferIndex = VertexAttributeBufferIndex.POSITION;
        const positions = geometry.vertices[bufferIndex];

        for (let i = 0; i < positions.length; i += 3) {
          const x = positions[i];
          const y = positions[i + 1];
          const z = positions[i + 2];

          const amp = 2;
          const time = window.performance.now();
          const distance =
            noise.noise2D(x + time * 0.003, z + time * 0.001) *
            distortionFr *
            amp;
          positions[i + 1] = distance;
        }

        geometry.updateVertexBuffer(
          bufferIndex,
          VertexAttributeLocation.POSITION,
          0,
          new Uint8Array(positions.buffer),
        );
      };

      const makeRoughBall = (geometry, bassFr, treFr) => {
        const bufferIndex = VertexAttributeBufferIndex.POSITION;
        const positions = geometry.vertices[bufferIndex];

        for (let i = 0; i < positions.length; i += 3) {
          const x = positions[i];
          const y = positions[i + 1];
          const z = positions[i + 2];

          const amp = 7;
          const time = window.performance.now();
          const radius = 100;
          const vec3 = [x, y, z];

          normalize(vec3, vec3);
          const rf = 0.0001;
          const distance =
            radius +
            bassFr +
            noise.noise3D(
              vec3[0] + time * rf * 7,
              vec3[1] + time * rf * 8,
              vec3[2] + time * rf * 9,
            ) *
              amp *
              treFr;

          positions[i] = vec3[0] * distance;
          positions[i + 1] = vec3[1] * distance;
          positions[i + 2] = vec3[2] * distance;
        }

        geometry.updateVertexBuffer(
          bufferIndex,
          VertexAttributeLocation.POSITION,
          0,
          new Uint8Array(positions.buffer),
        );
      };

      const stats = new Stats();
      stats.showPanel(0);
      const $stats = stats.dom;
      $stats.style.position = 'absolute';
      $stats.style.left = '0px';
      $stats.style.top = '0px';
      const $wrapper = containerRef.current;
      $wrapper.appendChild($stats);
    })();
  }, []);

  const handleFileChanged = (e) => {
    const files = e.target.files;
    const audio = audioRef.current;
    audio.src = URL.createObjectURL(files[0]);
    audio.load();
    audio.play();

    const context = new AudioContext();
    const src = context.createMediaElementSource(audio);
    analyser = context.createAnalyser();
    src.connect(analyser);
    analyser.connect(context.destination);
    analyser.fftSize = 512;
    const bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);
  };

  return (
    <>
      <label htmlFor="file">
        <input
          type="file"
          id="file"
          accept="audio/*"
          onChange={handleFileChanged}
        />
      </label>
      <audio id="audio" controls ref={audioRef}></audio>

      <div
        id="container1"
        ref={containerRef}
        style={{
          width: '100%',
          height: '100%',
        }}
      />
    </>
  );
};

//some helper functions here
function fractionate(val, minVal, maxVal) {
  return (val - minVal) / (maxVal - minVal);
}

function modulate(val, minVal, maxVal, outMin, outMax) {
  const fr = fractionate(val, minVal, maxVal);
  const delta = outMax - outMin;
  return outMin + fr * delta;
}

function avg(arr) {
  const total = arr.reduce(function (sum, b) {
    return sum + b;
  });
  return total / arr.length;
}

function max(arr) {
  return arr.reduce(function (a, b) {
    return Math.max(a, b);
  });
}

function normalize(out, a) {
  var x = a[0];
  var y = a[1];
  var z = a[2];
  var len = x * x + y * y + z * z;

  if (len > 0) {
    len = 1 / Math.sqrt(len);
  }

  out[0] = a[0] * len;
  out[1] = a[1] * len;
  out[2] = a[2] * len;
  return out;
}

ReactDOM.render(<App />, document.getElementById('container'));
