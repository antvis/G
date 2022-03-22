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

const graph = new WebGPUGraph();

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
    result = await graph.sssp(data, 'A', 'weight');
  } else {
    result = await graph.sssp(data, 'A', 'weight');
  }
  console.log(result);
});
folder.open();
