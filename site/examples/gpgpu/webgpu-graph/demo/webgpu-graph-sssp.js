import { Algorithm } from '@antv/g6';
import { WebGPUGraph } from '@antv/webgpu-graph';
import * as lil from 'lil-gui';

/**
 * @see /zh/docs/api/gpgpu/webgpu-graph#sssp
 */

// GPU version
const graph = new WebGPUGraph();
// CPU version
const { findShortestPath } = Algorithm;

const calcInCPU = (data, sourceId, weightPropertyName) => {
  const startTime = window.performance.now();
  for (let i = 0; i < data.nodes.length; i++) {
    const { length, path, allPath } = findShortestPath(
      data,
      sourceId,
      data.nodes[i].id,
      true,
      weightPropertyName,
    );
    // console.log(`from A to ${data.nodes[i].id} = ${length}: `, path);
  }
  console.log(`CPU Time Elapsed: ${window.performance.now() - startTime}ms`);
};
const calcInGPU = async (data, sourceId, weightPropertyName) => {
  const startTime = window.performance.now();
  const result = await graph.sssp(data, sourceId, weightPropertyName);
  console.log(`GPU Time Elapsed: ${window.performance.now() - startTime}ms`);

  // console.log(result);
};

const simpleDataset = {
  nodes: [
    {
      id: 'A',
      label: 'A',
    },
    {
      id: 'B',
      label: 'B',
    },
    {
      id: 'C',
      label: 'C',
    },
    {
      id: 'D',
      label: 'D',
    },
    {
      id: 'E',
      label: 'E',
    },
  ],
  edges: [
    {
      source: 'A',
      target: 'B',
      weight: 9,
    },
    {
      source: 'A',
      target: 'C',
      weight: 4,
    },
    {
      source: 'B',
      target: 'C',
      weight: 10,
    },
    {
      source: 'B',
      target: 'D',
      weight: 2,
    },
    {
      source: 'B',
      target: 'E',
      weight: 3,
    },
    {
      source: 'C',
      target: 'D',
      weight: 2,
    },
    {
      source: 'C',
      target: 'E',
      weight: 11,
    },
    {
      source: 'D',
      target: 'B',
      weight: 2,
    },
    {
      source: 'E',
      target: 'D',
      weight: 2,
    },
  ],
};

calcInGPU(simpleDataset, 'A', 'weight');
calcInCPU(simpleDataset, 'A', 'weight');

// GUI
const gui = new lil.GUI({ autoPlace: false });
const $wrapper = document.getElementById('container');
$wrapper.appendChild(gui.domElement);
const folder = gui.addFolder('dataset');
const config = {
  dataset: 'simple',
};
folder
  .add(config, 'dataset', ['simple', '1k nodes & 5k edges'])
  .onChange(async (dataset) => {
    if (dataset === 'simple') {
      calcInGPU(simpleDataset, 'A', 'weight');
      calcInCPU(simpleDataset, 'A', 'weight');
    } else if (dataset === '1k nodes & 5k edges') {
      const res = await fetch(
        'https://gw.alipayobjects.com/os/bmw-prod/180daecd-28d0-4d8f-ac4b-064d21062c12.json',
      );
      const input = await res.json();
      calcInGPU(input, '0', 'weight');
      calcInCPU(input, '0', 'weight');
    }
  });
folder.open();

const $text = document.createElement('div');
$text.textContent =
  'Please open the devtools, the shortest paths will be printed in console.';
$wrapper.appendChild($text);
