import { WebGPUGraph } from '@antv/webgpu-graph';
import * as lil from 'lil-gui';

const data = {
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

const graph = new WebGPUGraph();

// const showResult = (label, startTime, endTime, topNodes) => {
//   const $cpu = document.createElement('div');
//   $cpu.textContent = `${label} Time Elapsed: ${Number.parseFloat(endTime - startTime).toFixed(
//     2,
//   )}ms`;
//   $wrapper.appendChild($cpu);
//   // print top nodes
//   console.log(topNodes);
// };

// GUI
const gui = new lil.GUI({ autoPlace: false });
const $wrapper = document.getElementById('container');
$wrapper.appendChild(gui.domElement);
const folder = gui.addFolder('dataset');
const config = {
  dataset: 'simple',
};
folder.add(config, 'dataset', ['simple', '1k nodes & 500k edges']).onChange(async (dataset) => {
  let result;
  if (dataset === 'simple') {
    result = await graph.pageRank(data);
  } else {
    result = await graph.pageRank(data);
  }
  console.log(result);
});
folder.open();
