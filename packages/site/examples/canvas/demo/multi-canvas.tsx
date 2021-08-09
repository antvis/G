import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import SplitPane from 'react-split-pane';
import Stats from 'stats.js';
import { Canvas, Group } from '@antv/g';
import { Renderer as WebGLRenderer } from '@antv/g-webgl';
import { Cube, Grid, containerModule } from '@antv/g-plugin-3d';

// scene1 + scene2
const TOTAL_WIDTH = 600;
const SCENE_HEIGHT = 500;

const App = function MultiWorld() {
  let canvas1;
  let canvas2;
  useEffect(() => {
    const stats = new Stats();
    stats.showPanel(0);
    const $stats = stats.dom;
    $stats.style.position = 'absolute';
    $stats.style.left = '0px';
    $stats.style.top = '0px';
    const $wrapper = document.getElementById('container');
    $wrapper.appendChild($stats);

    // create a webgl renderer
    const webglRenderer1 = new WebGLRenderer();
    webglRenderer1.registerPlugin(containerModule);

    const webglRenderer2 = new WebGLRenderer();
    webglRenderer2.registerPlugin(containerModule);

    // create a canvas
    canvas1 = new Canvas({
      container: 'container1',
      width: TOTAL_WIDTH / 2,
      height: SCENE_HEIGHT,
      renderer: webglRenderer1,
    });

    canvas2 = new Canvas({
      container: 'container2',
      width: TOTAL_WIDTH / 2,
      height: SCENE_HEIGHT,
      renderer: webglRenderer2,
    });

    // scene 1
    const camera1 = canvas1.getCamera();
    camera1
      .setPosition(150, 20, 500)
      .setFocalPoint(150, 250, 0)
      .setPerspective(0.1, 1000, 75, TOTAL_WIDTH / 2 / SCENE_HEIGHT);

    const group1 = new Group();
    const cube1 = new Cube({
      style: {
        width: 200,
        height: 200,
        depth: 200,
        fill: '#1890FF',
      },
    });
    const grid1 = new Grid({
      style: {
        width: 400,
        height: 400,
        depth: 400,
        fill: '#1890FF',
      },
    });
    group1.appendChild(grid1);
    grid1.translateLocal(0, 100, 0);
    group1.appendChild(cube1);
    group1.setPosition(150, 250, 0);
    canvas1.appendChild(group1);

    // scene2
    const camera2 = canvas2.getCamera();
    camera2
      .setPosition(150, 20, 500)
      .setFocalPoint(150, 250, 0);

    const group2 = new Group();
    const cube2 = new Cube({
      style: {
        width: 200,
        height: 200,
        depth: 200,
        fill: '#1890FF',
      },
    });
    const grid2 = new Grid({
      style: {
        width: 400,
        height: 400,
        depth: 400,
        fill: '#1890FF',
      },
    });
    group2.appendChild(grid2);
    grid2.translateLocal(0, 100, 0);
    group2.appendChild(cube2);
    group2.setPosition(150, 250, 0);
    canvas2.appendChild(group2);
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
        <div id='container1' style={{
          width: '100%',
          height: '100%',
        }} />
        <div id='container2' style={{
          width: '100%',
          height: '100%',
        }} />
      </SplitPane>
    </>
  );
};

ReactDOM.render(<App />, document.getElementById('container'));
