import { Canvas, CanvasEvent } from '@antv/g';
import { Kernel, Plugin } from '@antv/g-plugin-gpgpu';
import { DeviceRenderer, Renderer } from '@antv/g-webgpu';
import { Algorithm } from '@antv/g6';

const { BufferUsage } = DeviceRenderer;

/**
 * SSSP(Bellman-Ford) ported from CUDA
 * @see https://www.lewuathe.com/illustration-of-distributed-bellman-ford-algorithm.html
 * @see https://github.com/sengorajkumar/gpu_graph_algorithms
 *
 * compared with G6:
 * @see https://g6.antv.vision/zh/docs/api/Algorithm#findshortestpathgraphdata-start-end-directed-weightpropertyname
 */

/**
 * use Compressed Sparse Row (CSR) for adjacency list
 */
// datasource: https://github.com/sengorajkumar/gpu_graph_algorithms/blob/master/input/simple.gr_E.csv
const V = [0, 1, 2, 3, 4];
const E = [1, 2, 2, 3, 4, 3, 4, 1, 3];
const I = [0, 2, 5, 7, 8, 9];
const W = [9, 4, 10, 2, 3, 2, 11, 2, 2];
const BLOCK_SIZE = 1;
const BLOCKS = 5;

const CANVAS_SIZE = 1;
const MAX_DISTANCE = 10000;

const $wrapper = document.getElementById('container');
const $text = document.createElement('div');
$text.textContent = 'Please open the devtools, the shortest paths will be printed in console.';
$wrapper.appendChild($text);

// use WebGPU
const renderer = new Renderer();
renderer.registerPlugin(new Plugin());

// create a canvas
const canvas = new Canvas({
  container: $wrapper,
  width: CANVAS_SIZE,
  height: CANVAS_SIZE,
  renderer,
});

canvas.addEventListener(CanvasEvent.READY, () => {
  const plugin = renderer.getPlugin('device-renderer');
  const device = plugin.getDevice();
  const kernel = new Kernel(device, {
    computeShader: `
struct Buffer {
  data: array<i32>;
};
struct AtomicBuffer {
  data: array<atomic<i32>>;
};

@group(0) @binding(0) var<storage, read> d_in_E : Buffer;
@group(0) @binding(1) var<storage, read> d_in_I : Buffer;
@group(0) @binding(2) var<storage, read> d_in_W : Buffer;
@group(0) @binding(3) var<storage, read> d_out_D : Buffer;
@group(0) @binding(4) var<storage, read_write> d_out_Di : AtomicBuffer;

@stage(compute) @workgroup_size(${BLOCKS}, ${BLOCK_SIZE})
fn main(
  @builtin(global_invocation_id) global_id : vec3<u32>
) {
  var index = global_id.x;
  if (index < ${V.length}u) {
    for (var j = d_in_I.data[index]; j < d_in_I.data[index + 1u]; j = j + 1) {
      var w = d_in_W.data[j];
      var du = d_out_D.data[index];
      var dv = d_out_D.data[d_in_E.data[j]];
      var newDist = du + w;
      if (du == ${MAX_DISTANCE}) {
        newDist = ${MAX_DISTANCE};
      }

      if (newDist < dv) {
        atomicMin(&d_out_Di.data[d_in_E.data[j]], newDist);
      }
    }
  }
}`,
  });

  const updateDistanceKernel = new Kernel(device, {
    computeShader: `
struct Buffer {
  data: array<i32>;
};

@group(0) @binding(0) var<storage, read_write> d_out_D : Buffer;
@group(0) @binding(1) var<storage, read_write> d_out_Di : Buffer;

@stage(compute) @workgroup_size(${BLOCKS}, ${BLOCK_SIZE})
fn main(
  @builtin(global_invocation_id) global_id : vec3<u32>
) {
  var index = global_id.x;
  if (index < ${V.length}u) {
    if (d_out_D.data[index] > d_out_Di.data[index]) {
      d_out_D.data[index] = d_out_Di.data[index];
    }
    d_out_Di.data[index] = d_out_D.data[index];
  }
}
    `,
  });

  const updatePredKernel = new Kernel(device, {
    computeShader: `
struct Buffer {
  data: array<i32>;
};
struct AtomicBuffer {
  data: array<atomic<i32>>;
};

@group(0) @binding(0) var<storage, read> d_in_V : Buffer;
@group(0) @binding(1) var<storage, read> d_in_E : Buffer;
@group(0) @binding(2) var<storage, read> d_in_I : Buffer;
@group(0) @binding(3) var<storage, read> d_in_W : Buffer;
@group(0) @binding(4) var<storage, read> d_out_D : Buffer;
@group(0) @binding(5) var<storage, read_write> d_out_P : AtomicBuffer;

@stage(compute) @workgroup_size(${BLOCKS}, ${BLOCK_SIZE})
fn main(
  @builtin(global_invocation_id) global_id : vec3<u32>
) {
  var index = global_id.x;
  if (index < ${V.length}u) {
    for (var j = d_in_I.data[index]; j < d_in_I.data[index + 1u]; j = j + 1) {
      var u = d_in_V.data[index];
      var w = d_in_W.data[j];

      var dis_u = d_out_D.data[index];
      var dis_v = d_out_D.data[d_in_E.data[j]];
      if (dis_v == dis_u + w) {
        atomicMin(&d_out_P.data[d_in_E.data[j]], u);
      }
    }
  }
}    
    `,
  });

  calcShortestPath(device, kernel, updateDistanceKernel, updatePredKernel);
});

const calcShortestPath = async (device, relaxKernel, updateDistanceKernel, updatePredKernel) => {
  const VBuffer = device.createBuffer({
    usage: BufferUsage.STORAGE,
    viewOrSize: new Int32Array(V),
  });
  const EBuffer = device.createBuffer({
    usage: BufferUsage.STORAGE,
    viewOrSize: new Int32Array(E),
  });
  const IBuffer = device.createBuffer({
    usage: BufferUsage.STORAGE,
    viewOrSize: new Int32Array(I),
  });
  const WBuffer = device.createBuffer({
    usage: BufferUsage.STORAGE,
    viewOrSize: new Int32Array(W),
  });
  const DOutBuffer = device.createBuffer({
    usage: BufferUsage.STORAGE | BufferUsage.COPY_SRC,
    viewOrSize: new Int32Array([0, ...new Array(V.length - 1).fill(MAX_DISTANCE)]),
  });
  const DiOutBuffer = device.createBuffer({
    usage: BufferUsage.STORAGE | BufferUsage.COPY_SRC,
    viewOrSize: new Int32Array([0, ...new Array(V.length - 1).fill(MAX_DISTANCE)]),
  });
  const POutBuffer = device.createBuffer({
    usage: BufferUsage.STORAGE | BufferUsage.COPY_SRC,
    viewOrSize: new Int32Array([0, ...new Array(V.length - 1).fill(MAX_DISTANCE)]),
  });
  const readback = device.createReadback();

  relaxKernel.setBinding(0, EBuffer);
  relaxKernel.setBinding(1, IBuffer);
  relaxKernel.setBinding(2, WBuffer);
  relaxKernel.setBinding(3, DOutBuffer);
  relaxKernel.setBinding(4, DiOutBuffer);

  updateDistanceKernel.setBinding(0, DOutBuffer);
  updateDistanceKernel.setBinding(1, DiOutBuffer);

  updatePredKernel.setBinding(0, VBuffer);
  updatePredKernel.setBinding(1, EBuffer);
  updatePredKernel.setBinding(2, IBuffer);
  updatePredKernel.setBinding(3, WBuffer);
  updatePredKernel.setBinding(4, DOutBuffer);
  updatePredKernel.setBinding(5, POutBuffer);

  const startTime = window.performance.now();

  for (let i = 1; i < V.length; i++) {
    relaxKernel.dispatch(1, 1);
    updateDistanceKernel.dispatch(1, 1);
  }
  updatePredKernel.dispatch(1, 1);

  // result
  const out = await readback.readBuffer(DiOutBuffer);
  const predecessor = await readback.readBuffer(POutBuffer);

  const labels = ['A', 'B', 'C', 'D', 'E'];
  for (let i = 0; i < V.length; i++) {
    console.log(
      `from ${labels[0]} to ${labels[i]} = ${out[i]}, predecessor = ${labels[predecessor[i]]}`,
    );
  }

  console.log(`GPU Time Elapsed: ${window.performance.now() - startTime}ms`);
};

const { findShortestPath } = Algorithm;
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

const startTime = window.performance.now();
for (let i = 0; i < data.nodes.length; i++) {
  const { length, path, allPath } = findShortestPath(data, 'A', data.nodes[i].id, true, 'weight');
  console.log(`from A to ${data.nodes[i].id} = ${length}: `, path);
}
console.log(`CPU Time Elapsed: ${window.performance.now() - startTime}ms`);
