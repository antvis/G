import { WebGPUDeviceContribution, BufferUsage } from '@antv/g-device-api';
import { Algorithm } from '@antv/g6';

const $canvas = document.createElement('canvas');

/**
 * Pagerank with power method, ported from CUDA
 * @see https://github.com/princeofpython/PageRank-with-CUDA/blob/main/parallel.cu
 *
 * compared with G6:
 * @see https://g6.antv.vision/zh/docs/api/Algorithm#pagerank
 */

/**
 * use Compressed Sparse Row (CSR) for adjacency list
 */
// datasource: https://github.com/sengorajkumar/gpu_graph_algorithms/blob/master/input/simple.gr_E.csv
const V = [0, 1, 2, 3, 4];
const E = [1, 2, 2, 3, 4, 3, 4, 1, 3];
const I = [0, 2, 5, 7, 8, 10];
const W = [9, 4, 10, 2, 3, 2, 11, 2, 2];
const From = [0, 0, 1, 1, 1, 2, 2, 3, 4];
const To = [1, 2, 2, 3, 4, 3, 4, 1, 3];
const BLOCK_SIZE = 1;
const BLOCKS = 5;

const $wrapper = document.getElementById('container');
const $text = document.createElement('div');
$text.textContent =
  'Please open the devtools, the top nodes will be printed in console.';
$wrapper.appendChild($text);

(async () => {
  const deviceContributionWebGPU = new WebGPUDeviceContribution({
    shaderCompilerPath: '/glsl_wgsl_compiler_bg.wasm',
  });

  const swapChain = await deviceContributionWebGPU.createSwapChain($canvas);
  const device = swapChain.getDevice();

  const storeProgram = device.createProgram({
    compute: {
      wgsl: `
struct Buffer {
  data: array<f32>,
};

@group(0) @binding(0) var<storage, read> r : Buffer;
@group(0) @binding(1) var<storage, read_write> r_last : Buffer;

@compute @workgroup_size(${BLOCKS}, ${BLOCK_SIZE})
fn main(
  @builtin(global_invocation_id) global_id : vec3<u32>
) {
  var index = global_id.x;
  if (index < ${V.length}u) {
    r_last.data[index] = r.data[index];
  }
}`,
    },
  });
  const storePipeline = device.createComputePipeline({
    inputLayout: null,
    program: storeProgram,
  });

  const matmulProgram = device.createProgram({
    compute: {
      wgsl: `
struct Buffer {
  data: array<f32>,
};

@group(0) @binding(0) var<storage, read> graph : Buffer;
@group(0) @binding(1) var<storage, read_write> r : Buffer;
@group(0) @binding(2) var<storage, read> r_last : Buffer;

@compute @workgroup_size(${BLOCKS}, ${BLOCK_SIZE})
fn main(
  @builtin(global_invocation_id) global_id : vec3<u32>
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
    },
  });
  const matmulPipeline = device.createComputePipeline({
    inputLayout: null,
    program: matmulProgram,
  });

  const rankDiffProgram = device.createProgram({
    compute: {
      wgsl: `
struct Buffer {
  data: array<f32>,
};

@group(0) @binding(0) var<storage, read> r : Buffer;
@group(0) @binding(1) var<storage, read_write> r_last : Buffer;

@compute @workgroup_size(${BLOCKS}, ${BLOCK_SIZE})
fn main(
  @builtin(global_invocation_id) global_id : vec3<u32>
) {
  var index = global_id.x;
  if (index < ${V.length}u) {
    r_last.data[index] = abs(r_last.data[index] - r.data[index]);
  }
}    
    `,
    },
  });
  const rankDiffPipeline = device.createComputePipeline({
    inputLayout: null,
    program: rankDiffProgram,
  });

  const pageRankGPU = async () => {
    const d = 0.85;
    const eps = 0.000001;
    let maxIteration = 1000;
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

    const storeBindings = device.createBindings({
      pipeline: storePipeline,
      storageBufferBindings: [
        {
          binding: 0,
          buffer: rBuffer,
        },
        {
          binding: 1,
          buffer: rLastBuffer,
        },
      ],
    });
    const matmulBindings = device.createBindings({
      pipeline: matmulPipeline,
      storageBufferBindings: [
        {
          binding: 0,
          buffer: graphBuffer,
        },
        {
          binding: 1,
          buffer: rBuffer,
        },
        {
          binding: 2,
          buffer: rLastBuffer,
        },
      ],
    });
    const rankDiffBindings = device.createBindings({
      pipeline: rankDiffPipeline,
      storageBufferBindings: [
        {
          binding: 0,
          buffer: rBuffer,
        },
        {
          binding: 1,
          buffer: rLastBuffer,
        },
      ],
    });

    const readback = device.createReadback();

    const startTime = window.performance.now();
    while (maxIteration--) {
      const storeComputePass = device.createComputePass();
      storeComputePass.setPipeline(storePipeline);
      storeComputePass.setBindings(storeBindings);
      storeComputePass.dispatchWorkgroups(1, 1);
      device.submitPass(storeComputePass);

      const matmulComputePass = device.createComputePass();
      matmulComputePass.setPipeline(matmulPipeline);
      matmulComputePass.setBindings(matmulBindings);
      matmulComputePass.dispatchWorkgroups(1, 1);
      device.submitPass(matmulComputePass);

      const rankDiffComputePass = device.createComputePass();
      rankDiffComputePass.setPipeline(rankDiffPipeline);
      rankDiffComputePass.setBindings(rankDiffBindings);
      rankDiffComputePass.dispatchWorkgroups(1, 1);
      device.submitPass(rankDiffComputePass);

      const last = await readback.readBuffer(rLastBuffer);
      const result = last.reduce((prev, cur) => prev + cur, 0);
      if (result < eps) {
        const out = await readback.readBuffer(rBuffer);
        console.log(out);
        break;
      }
    }

    console.log(`GPU Time Elapsed: ${window.performance.now() - startTime}ms`);
  };

  pageRankGPU();
})();

const { pageRank } = Algorithm;
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
    },
    {
      source: 'A',
      target: 'C',
    },
    {
      source: 'B',
      target: 'C',
    },
    {
      source: 'B',
      target: 'D',
    },
    {
      source: 'B',
      target: 'E',
    },
    {
      source: 'C',
      target: 'D',
    },
    {
      source: 'C',
      target: 'E',
    },
    {
      source: 'D',
      target: 'B',
    },
    {
      source: 'E',
      target: 'D',
    },
  ],
};

const startTime = window.performance.now();
const result = pageRank(data);
console.log(result);
console.log(`CPU Time Elapsed: ${window.performance.now() - startTime}ms`);
