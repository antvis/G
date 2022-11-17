import { Algorithm } from '@antv/g6';
import { WebGPUGraph } from '@antv/webgpu-graph';
import * as lil from 'lil-gui';

/**
 * @see /zh/docs/api/gpgpu/webgpu-graph#bfs
 */

// GPU version
const graph = new WebGPUGraph();
// CPU version
const { breadthFirstSearch } = Algorithm;

const simpleDataset = {
  nodes: [
    {
      id: 'A',
    },
    {
      id: 'B',
    },
    {
      id: 'C',
    },
    {
      id: 'D',
    },
    {
      id: 'E',
    },
    {
      id: 'F',
    },
    {
      id: 'G',
    },
    {
      id: 'H',
    },
  ],
  edges: [
    {
      source: 'A',
      target: 'B',
    },
    {
      source: 'B',
      target: 'C',
    },
    {
      source: 'C',
      target: 'G',
    },
    {
      source: 'A',
      target: 'D',
    },
    {
      source: 'A',
      target: 'E',
    },
    {
      source: 'E',
      target: 'F',
    },
    {
      source: 'F',
      target: 'D',
    },
  ],
};

const calcInCPU = (data, root) => {
  const startTime = window.performance.now();
  breadthFirstSearch(data, root, {
    enter: ({ current, previous }) => {
      // 开始遍历点的回调
      // console.log('enter', current);
    },
    leave: ({ current, previous }) => {
      // 遍历完节点的回调
      // console.log('leave', current);
    },
  });
  console.log(`CPU Time Elapsed: ${window.performance.now() - startTime}ms`);
};

const calcInGPU = async (data, root) => {
  const startTime = window.performance.now();
  await graph.bfs(data, root);
  console.log(`GPU Time Elapsed: ${window.performance.now() - startTime}ms`);
};

calcInCPU(simpleDataset, 'A');
calcInGPU(simpleDataset, 'A');

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
    '1k nodes & 5k edges',
    '1k nodes & 500k edges',
  ])
  .onChange(async (dataset) => {
    if (dataset === 'simple') {
      calcInCPU(simpleDataset, 'A');
      calcInGPU(simpleDataset, 'A');
    } else if (dataset === '1k nodes & 5k edges') {
      const res = await fetch(
        'https://gw.alipayobjects.com/os/bmw-prod/180daecd-28d0-4d8f-ac4b-064d21062c12.json',
      );
      const input = await res.json();
      calcInGPU(input, '0');
      calcInCPU(input, '0');
    } else if (dataset === '1k nodes & 500k edges') {
      const res = await fetch(
        'https://gw.alipayobjects.com/os/bmw-prod/db52686c-423b-41d8-956b-38536252a48f.json',
      );
      const input = await res.json();
      calcInGPU(input, '0');
      calcInCPU(input, '0');
    }
  });
folder.open();
