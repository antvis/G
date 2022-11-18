import { WebGPUGraph } from '@antv/webgpu-graph';
import { Algorithm } from '@antv/g6';
import * as lil from 'lil-gui';

/**
 * @see /zh/docs/api/gpgpu/webgpu-graph#pagerank
 */

// GPU version
const graph = new WebGPUGraph();
// CPU version
const { pageRank } = Algorithm;

const calcInCPU = (data) => {
  const startTime = window.performance.now();
  const result = pageRank(data);
  console.log(`CPU Time Elapsed: ${window.performance.now() - startTime}ms`);
  // console.log('CPU result: ', result);
};
const calcInGPU = async (data) => {
  const startTime = window.performance.now();
  const result = await graph.pageRank(data);
  console.log(`GPU Time Elapsed: ${window.performance.now() - startTime}ms`);
  // console.log('GPU result: ', result);
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
    {
      id: 'F',
      label: 'F',
    },
    {
      id: 'G',
      label: 'G',
    },
    {
      id: 'H',
      label: 'H',
    },
    {
      id: 'I',
      label: 'I',
    },
    {
      id: 'J',
      label: 'J',
    },
    {
      id: 'K',
      label: 'K',
    },
  ],
  edges: [
    {
      source: 'D',
      target: 'A',
    },
    {
      source: 'D',
      target: 'B',
    },
    {
      source: 'B',
      target: 'C',
    },
    {
      source: 'C',
      target: 'B',
    },
    {
      source: 'F',
      target: 'B',
    },
    {
      source: 'F',
      target: 'E',
    },
    {
      source: 'E',
      target: 'F',
    },
    {
      source: 'E',
      target: 'D',
    },
    {
      source: 'E',
      target: 'B',
    },
    {
      source: 'K',
      target: 'E',
    },
    {
      source: 'J',
      target: 'E',
    },
    {
      source: 'I',
      target: 'E',
    },
    {
      source: 'H',
      target: 'E',
    },
    {
      source: 'G',
      target: 'E',
    },
    {
      source: 'G',
      target: 'B',
    },
    {
      source: 'H',
      target: 'B',
    },
    {
      source: 'I',
      target: 'B',
    },
  ],
};

calcInCPU(simpleDataset);
calcInGPU(simpleDataset);

// GUI
const gui = new lil.GUI({ autoPlace: false });
const $wrapper = document.getElementById('container');
$wrapper.appendChild(gui.domElement);
const folder = gui.addFolder('dataset');
const config = {
  dataset: 'simple',
};
folder
  .add(config, 'dataset', [
    'simple',
    '8k nodes & 5k edges',
    '1k nodes & 500k edges',
  ])
  .onChange(async (dataset) => {
    let input;
    if (dataset === 'simple') {
      input = simpleDataset;
    } else if (dataset === '8k nodes & 5k edges') {
      const res = await fetch(
        'https://gw.alipayobjects.com/os/basement_prod/0b9730ff-0850-46ff-84d0-1d4afecd43e6.json',
      );
      input = await res.json();
    } else if (dataset === '1k nodes & 500k edges') {
      const res = await fetch(
        'https://gw.alipayobjects.com/os/bmw-prod/db52686c-423b-41d8-956b-38536252a48f.json',
      );
      input = await res.json();
    }

    calcInCPU(input);
    calcInGPU(input);
  });
folder.open();
