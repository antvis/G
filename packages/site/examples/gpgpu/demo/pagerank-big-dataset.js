import { Algorithm } from '@antv/g6';
import { Canvas } from '@antv/g';
import { Renderer } from '@antv/g-webgl';
import { Plugin, Kernel, BufferUsage } from '@antv/g-plugin-gpgpu';

/**
 * Pagerank with power method, ported from CUDA
 * @see https://github.com/princeofpython/PageRank-with-CUDA/blob/main/parallel.cu
 *
 * compared with G6:
 * @see https://g6.antv.vision/zh/docs/api/Algorithm#pagerank
 *
 * dataset: 1k vertices & 50w edges
 * @see https://github.com/sengorajkumar/gpu_graph_algorithms/tree/master/input
 */

const $wrapper = document.getElementById('container');
(async () => {
  // load & parse TXT datasets
  const res = await fetch(
    'https://gw.alipayobjects.com/os/bmw-prod/b2e21724-d8b7-415d-9fea-9b41b21410b8.txt',
  );
  const text = await res.text();
  let V = [];
  const From = [];
  const To = [];
  text.split('\n').forEach((line, i) => {
    if (i === 0) {
      const [vertices] = line.split(' ');
      V = new Array(Number(vertices)).fill(undefined).map((_, i) => i);
    } else {
      const [from, to] = line.split(' ');
      From.push(Number(from));
      To.push(Number(to));
    }
  });

  // use G6's `pagerank` method
  let startTime = window.performance.now();
  let topNodes = calculateInCPU(V, From, To);
  showResult('CPU', startTime, window.performance.now(), topNodes);

  // use Compute Shader with WebGPU
  startTime = window.performance.now();
  topNodes = await calculateInGPU(V, From, To);
  showResult('GPU', startTime, window.performance.now(), topNodes);
})();

// calculate with G6's pagerank in CPU
const calculateInCPU = (V, From, To) => {
  const { pageRank } = Algorithm;
  const data = {
    nodes: V.map((v) => ({
      id: `${v}`,
      label: `${v}`,
    })),
    edges: From.map((from, i) => ({
      source: `${from}`,
      target: `${To[i]}`,
    })),
  };

  const result = pageRank(data);
  return Object.keys(result)
    .map((key) => ({ id: Number(key), value: result[key] }))
    .sort((a, b) => b.value - a.value);
};

// we use 3 kernels
const calculateInGPU = async (V, From, To) => {
  // The total number of workgroup invocations (4096) exceeds the maximum allowed (256).
  const BLOCK_SIZE = 1;
  const BLOCKS = 256;
  const CANVAS_SIZE = 1;
  const d = 0.85;
  const eps = 0.000001;
  let maxIteration = 1000;

  // use WebGPU
  const renderer = new Renderer({ targets: ['webgpu'] });
  renderer.registerPlugin(new Plugin());

  // create a canvas
  const canvas = new Canvas({
    container: $wrapper,
    width: CANVAS_SIZE,
    height: CANVAS_SIZE,
    renderer,
  });

  // wait for canvas' services ready
  await canvas.ready;

  const device = renderer.getDevice();
  const n = V.length;
  const graph = new Float32Array(new Array(n * n).fill((1 - d) / n));
  const r = new Float32Array(new Array(n).fill(1 / n));

  From.forEach((from, i) => {
    graph[To[i] * n + from] += d * 1.0;
  });

  for (let j = 0; j < n; j++) {
    let sum = 0.0;

    for (let i = 0; i < n; ++i) {
      sum += graph[i * n + j];
    }

    for (let i = 0; i < n; ++i) {
      if (sum != 0.0) {
        graph[i * n + j] /= sum;
      } else {
        graph[i * n + j] = 1 / n;
      }
    }
  }

  const storeKernel = new Kernel(device, {
    computeShader: `
[[block]] struct Buffer {
  data: array<f32>;
};

[[group(0), binding(0)]] var<storage, read> r : Buffer;
[[group(0), binding(1)]] var<storage, write> r_last : Buffer;

[[stage(compute), workgroup_size(${BLOCKS}, ${BLOCK_SIZE})]]
fn main(
  [[builtin(global_invocation_id)]] global_id : vec3<u32>
) {
  var index = global_id.x;
  if (index < ${V.length}u) {
    r_last.data[index] = r.data[index];
  }
}`,
  });

  const matmulKernel = new Kernel(device, {
    computeShader: `
[[block]] struct Buffer {
  data: array<f32>;
};

[[group(0), binding(0)]] var<storage, read> graph : Buffer;
[[group(0), binding(1)]] var<storage, read_write> r : Buffer;
[[group(0), binding(2)]] var<storage, read> r_last : Buffer;

[[stage(compute), workgroup_size(${BLOCKS}, ${BLOCK_SIZE})]]
fn main(
  [[builtin(global_invocation_id)]] global_id : vec3<u32>
) {
  var index = global_id.x;
  if (index < ${V.length}u) {
    var sum = 0.0;
    for (var i = 0u; i < ${V.length}u; i = i + 1u) {
      sum = sum + r_last.data[i] * graph.data[index * ${V.length}u + i];
    }
    r.data[index] = sum;
  }
}
    `,
  });

  const rankDiffKernel = new Kernel(device, {
    computeShader: `
[[block]] struct Buffer {
  data: array<f32>;
};

[[group(0), binding(0)]] var<storage, read> r : Buffer;
[[group(0), binding(1)]] var<storage, read_write> r_last : Buffer;

[[stage(compute), workgroup_size(${BLOCKS}, ${BLOCK_SIZE})]]
fn main(
  [[builtin(global_invocation_id)]] global_id : vec3<u32>
) {
  var index = global_id.x;
  if (index < ${V.length}u) {
    r_last.data[index] = abs(r_last.data[index] - r.data[index]);
  }
}    
    `,
  });

  const rBuffer = device.createBuffer({
    usage: BufferUsage.STORAGE | BufferUsage.COPY_SRC,
    viewOrSize: new Float32Array(r),
  });
  const rLastBuffer = device.createBuffer({
    usage: BufferUsage.STORAGE | BufferUsage.COPY_SRC,
    viewOrSize: new Float32Array(n),
  });
  const graphBuffer = device.createBuffer({
    usage: BufferUsage.STORAGE,
    viewOrSize: new Float32Array(graph),
  });

  const readback = device.createReadback();

  storeKernel.setBinding(0, rBuffer);
  storeKernel.setBinding(1, rLastBuffer);

  matmulKernel.setBinding(0, graphBuffer);
  matmulKernel.setBinding(1, rBuffer);
  matmulKernel.setBinding(2, rLastBuffer);

  rankDiffKernel.setBinding(0, rBuffer);
  rankDiffKernel.setBinding(1, rLastBuffer);

  const grids = Math.ceil(V.length / (BLOCKS * BLOCK_SIZE));

  while (maxIteration--) {
    storeKernel.dispatch(grids, 1);
    matmulKernel.dispatch(grids, 1);
    rankDiffKernel.dispatch(grids, 1);

    const last = await readback.readBuffer(rLastBuffer);
    const result = last.reduce((prev, cur) => prev + cur, 0);
    if (result < eps) {
      const out = await readback.readBuffer(rBuffer);

      return Array.from(out)
        .map((value, id) => ({ id, value }))
        .sort((a, b) => b.value - a.value);
    }
  }
};

const $text = document.createElement('div');
$text.textContent = 'Please open the devtools, the top nodes will be printed in console.';
$wrapper.appendChild($text);

const showResult = (label, startTime, endTime, topNodes) => {
  const $cpu = document.createElement('div');
  $cpu.textContent = `${label} Time Elapsed: ${Number.parseFloat(endTime - startTime).toFixed(
    2,
  )}ms`;
  $wrapper.appendChild($cpu);
  // print top nodes
  console.log(topNodes);
};
