import { Canvas, CanvasEvent, Circle } from '@antv/g';
import { Renderer as CanvasRenderer } from '@antv/g-canvas';
import { Renderer as SVGRenderer } from '@antv/g-svg';
import { Renderer as WebGLRenderer } from '@antv/g-webgl';
import { Renderer as CanvaskitRenderer } from '@antv/g-canvaskit';
import * as lil from 'lil-gui';
import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import SplitPane from 'react-split-pane';
import Stats from 'stats.js';

// scene1 + scene2
const TOTAL_WIDTH = 600;
const SCENE_HEIGHT = 500;

const App = function MultiWorld() {
  let canvas1: Canvas;
  let canvas2: Canvas;
  useEffect(() => {
    const stats = new Stats();
    stats.showPanel(0);
    const $stats = stats.dom;
    $stats.style.position = 'absolute';
    $stats.style.left = '0px';
    $stats.style.top = '0px';
    const $wrapper = document.getElementById('container');
    $wrapper.appendChild($stats);

    // create a canvas renderer
    const canvasRenderer1 = new CanvasRenderer();
    const canvasRenderer2 = new CanvasRenderer();
    const svgRenderer1 = new SVGRenderer();
    const svgRenderer2 = new SVGRenderer();
    const webglRenderer1 = new WebGLRenderer();
    const webglRenderer2 = new WebGLRenderer();
    const canvaskitRenderer1 = new CanvaskitRenderer({
      wasmDir: '/',
    });
    const canvaskitRenderer2 = new CanvaskitRenderer({
      wasmDir: '/',
    });

    // create a canvas
    canvas1 = new Canvas({
      container: 'container1',
      width: TOTAL_WIDTH / 2,
      height: SCENE_HEIGHT,
      renderer: canvasRenderer1,
    });

    canvas2 = new Canvas({
      container: 'container2',
      width: TOTAL_WIDTH / 2,
      height: SCENE_HEIGHT,
      renderer: canvasRenderer2,
    });

    canvas1.addEventListener(CanvasEvent.READY, () => {
      const circle1 = new Circle({
        style: {
          cx: 100,
          cy: 100,
          r: 100,
          fill: 'blue',
        },
      });
      canvas1.appendChild(circle1);
      circle1.on('mouseenter', () => {
        circle1.attr('fill', 'yellow');
      });
      circle1.on('mouseleave', () => {
        circle1.attr('fill', 'blue');
      });
    });

    canvas2.addEventListener(CanvasEvent.READY, () => {
      const circle2 = new Circle({
        style: {
          cx: 100,
          cy: 100,
          r: 100,
          fill: 'red',
        },
      });
      canvas2.appendChild(circle2);
      circle2.on('mouseenter', () => {
        circle2.attr('fill', 'green');
      });
      circle2.on('mouseleave', () => {
        circle2.attr('fill', 'red');
      });
    });

    // GUI
    const gui = new lil.GUI({ autoPlace: false });
    $wrapper.appendChild(gui.domElement);

    const rendererFolder = gui.addFolder('renderer');
    const rendererConfig = {
      renderer: 'canvas',
      devicePixelRatio: window.devicePixelRatio,
    };
    rendererFolder
      .add(rendererConfig, 'renderer', ['canvas', 'webgl', 'svg', 'canvaskit'])
      .onChange((renderer) => {
        canvas1.setRenderer(
          renderer === 'canvas'
            ? canvasRenderer1
            : renderer === 'webgl'
            ? webglRenderer1
            : renderer === 'svg'
            ? svgRenderer1
            : canvaskitRenderer1,
        );
        canvas2.setRenderer(
          renderer === 'canvas'
            ? canvasRenderer2
            : renderer === 'webgl'
            ? webglRenderer2
            : renderer === 'svg'
            ? svgRenderer2
            : canvaskitRenderer2,
        );
      });
    rendererFolder.add(rendererConfig, 'devicePixelRatio', 0.5, 5).onChange((dpr) => {
      canvas1.getConfig().devicePixelRatio = dpr;
    });
    rendererFolder.open();
  });

  return (
    <>
      <SplitPane
        split="vertical"
        defaultSize={TOTAL_WIDTH / 2}
        onChange={(width) => {
          canvas1.resize(width, SCENE_HEIGHT);
          canvas2.resize(TOTAL_WIDTH - width, SCENE_HEIGHT);
        }}
      >
        <div
          id="container1"
          style={{
            width: '100%',
            height: '100%',
          }}
        />
        <div
          id="container2"
          style={{
            width: '100%',
            height: '100%',
          }}
        />
      </SplitPane>
    </>
  );
};

ReactDOM.render(<App />, document.getElementById('container'));
