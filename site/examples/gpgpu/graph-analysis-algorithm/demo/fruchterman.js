import { Canvas, CanvasEvent, Circle, Line } from '@antv/g';
import { Renderer as WebGLRenderer } from '@antv/g-webgl';
import { WebGPUDeviceContribution, BufferUsage } from '@antv/g-device-api';

/**
 * ported from https://nblintao.github.io/ParaGraphL/
 * speed up ~100x(100ms vs 30s) compared with G6 @see https://g6.antv.vision/zh/examples/net/furchtermanLayout#fruchtermanWebWorker
 *
 * rewrite with WGSL(WebGPU Shader Language),
 * use Compressed Sparse Row (CSR) for adjacency list
 */

const MAX_ITERATION = 1000;
const CANVAS_SIZE = 600;

// create a canvas
const $wrapper = document.getElementById('container');
const $text = document.createElement('div');
$text.textContent =
  'Please open the devtools, the shortest paths will be printed in console.';
$wrapper.appendChild($text);
const $canvas = document.createElement('canvas');

(async () => {
  const deviceContributionWebGPU = new WebGPUDeviceContribution({
    shaderCompilerPath: '/glsl_wgsl_compiler_bg.wasm',
  });

  const swapChain = await deviceContributionWebGPU.createSwapChain($canvas);
  const device = swapChain.getDevice();

  // @see https://g6.antv.vision/en/examples/net/forceDirected/#basicForceDirected
  const data = await (
    await fetch(
      'https://gw.alipayobjects.com/os/basement_prod/7bacd7d1-4119-4ac1-8be3-4c4b9bcbc25f.json',
    )
  ).json();

  let startTime = window.performance.now();

  const center = [CANVAS_SIZE / 2, CANVAS_SIZE / 2];
  // generate position of each node
  const nodes = data.nodes.map((n) => ({
    x: Math.random() * CANVAS_SIZE,
    y: Math.random() * CANVAS_SIZE,
    id: n.id,
  }));
  const nodeNum = nodes.length;
  const [edges, indices, positions] = generateCSR(nodes, data.edges);

  const area = CANVAS_SIZE * CANVAS_SIZE;
  let maxDisplace = Math.sqrt(area) / 10;
  const k2 = area / (nodes.length + 1);
  const k = Math.sqrt(k2);

  const program = device.createProgram({
    compute: {
      wgsl: `
struct Buffer {
  data: array<i32>,
};
struct PositionBuffer {
  data: array<vec2<f32>>,
};
@group(0) @binding(0) var<storage, read> edges : Buffer;
@group(0) @binding(1) var<storage, read> indices : Buffer;
@group(0) @binding(2) var<storage, read_write> positions : PositionBuffer;

struct Params {
  vertexNum: f32,
  k: f32,
  k2: f32,
  gravity: f32,
  speed: f32,
  maxDisplace: f32,
  center: vec2<f32>,
};
@group(0) @binding(3) var<uniform> params : Params;

fn calc_repulsive(i: u32, current_node: vec2<f32>) -> vec2<f32> {
  var dx = 0.0;
  var dy = 0.0;
  for (var j = 0u; j < u32(params.vertexNum); j = j + 1u) {
    if (i != j) {
      var nextNode = positions.data[j];
      var x_dist = current_node[0] - nextNode[0];
      var y_dist = current_node[1] - nextNode[1];
      var dist = sqrt(x_dist * x_dist + y_dist * y_dist) + 0.01;
      if (dist > 0.0) {
        var repulsiveF = params.k2 / dist;
        dx = dx + x_dist / dist * repulsiveF;
        dy = dy + y_dist / dist * repulsiveF;
      }
    }
  }
  return vec2<f32>(dx, dy);
}

fn calc_gravity(current_node: vec2<f32>) -> vec2<f32> {
  var dx = 0.0;
  var dy = 0.0;
  var vx = current_node[0] - params.center[0];
  var vy = current_node[1] - params.center[1];
  var gf = 0.01 * params.k * params.gravity;
  dx = gf * vx;
  dy = gf * vy;

  return vec2<f32>(dx, dy);
}

fn calc_attractive(i: u32, current_node: vec2<f32>) -> vec2<f32> {
  var dx = 0.0;
  var dy = 0.0;

  for (var j = indices.data[i]; j < indices.data[i + 1u]; j = j + 1) {
    var next_node = positions.data[edges.data[j]];
    var x_dist = current_node[0] - next_node[0];
    var y_dist = current_node[1] - next_node[1];
    var dist = sqrt(x_dist * x_dist + y_dist * y_dist) + 0.01;
    var attractiveF = dist * dist / params.k;
    if (dist > 0.0) {
      dx = dx - x_dist / dist * attractiveF;
      dy = dy - y_dist / dist * attractiveF;
    }
  }

  return vec2<f32>(dx, dy);
}

@compute @workgroup_size(1, 1)
fn main(
  @builtin(global_invocation_id) global_id : vec3<u32>,
) {
  var i = global_id.x;
  if (i < u32(params.vertexNum)) {
    var current_node = positions.data[i];
    var dx = 0.0;
    var dy = 0.0;

    // repulsive
    var repulsive = calc_repulsive(i, current_node);
    dx = dx + repulsive[0];
    dy = dy + repulsive[1];

    // attractive
    var attractive = calc_attractive(i, current_node);
    dx = dx + attractive[0];
    dy = dy + attractive[1];

    // gravity
    var gravity = calc_gravity(current_node);
    dx = dx - gravity[0];
    dy = dy - gravity[1];

    // speed
    dx = dx * params.speed;
    dy = dy * params.speed;

    // move
    var dist_length = sqrt(dx * dx + dy * dy);
    if (dist_length > 0.0) {
      var limited_dist = min(params.maxDisplace * params.speed, dist_length);

      positions.data[i] = vec2<f32>(
        positions.data[i][0] + dx / dist_length * limited_dist,
        positions.data[i][1] + dy / dist_length * limited_dist,
      );
    }
  }
}`,
    },
  });

  const readback = device.createReadback();
  const edgesBuffer = device.createBuffer({
    usage: BufferUsage.STORAGE,
    viewOrSize: new Int32Array(edges),
  });
  const indicesBuffer = device.createBuffer({
    usage: BufferUsage.STORAGE,
    viewOrSize: new Int32Array(indices),
  });
  const positionsBuffer = device.createBuffer({
    usage: BufferUsage.STORAGE | BufferUsage.COPY_SRC,
    viewOrSize: new Float32Array(positions),
  });
  const paramBuffer = device.createBuffer({
    usage: BufferUsage.UNIFORM | BufferUsage.COPY_DST | BufferUsage.COPY_SRC,
    viewOrSize: new Float32Array([
      nodeNum,
      k,
      k2,
      10,
      0.1,
      maxDisplace,
      center[0],
      center[1],
    ]),
  });

  const pipeline = device.createComputePipeline({
    inputLayout: null,
    program,
  });

  const bindings = device.createBindings({
    pipeline,
    storageBufferBindings: [
      {
        binding: 0,
        buffer: edgesBuffer,
      },
      {
        binding: 1,
        buffer: indicesBuffer,
      },
      {
        binding: 2,
        buffer: positionsBuffer,
      },
    ],
    uniformBufferBindings: [
      {
        binding: 3,
        buffer: paramBuffer,
        size: 8 * 4,
      },
    ],
  });

  const computePass = device.createComputePass();
  computePass.setPipeline(pipeline);
  computePass.setBindings(bindings);

  for (let i = 0; i < MAX_ITERATION; i++) {
    computePass.dispatchWorkgroups(nodeNum, 1);

    // update uniform
    maxDisplace *= 0.99999;
    paramBuffer.setSubData(
      5 * 4,
      new Uint8Array(new Float32Array([maxDisplace]).buffer),
    );
  }

  device.submitPass(computePass);

  const result = await readback.readBuffer(positionsBuffer);

  console.log(
    `GPU Time Elapsed: ${Number.parseFloat(
      window.performance.now() - startTime,
    ).toFixed(2)}ms`,
  );

  renderCircles(edges, indices, result);
})();

const generateCSR = (nodes, edges) => {
  const resultEdges = [];
  const indices = [];
  const positions = [];
  const nodeDict = [];
  const mapIdPos = {}; // { A: 0, B: 1, C: 2 }
  let i = 0;
  for (i = 0; i < nodes.length; i++) {
    const { id, x, y } = nodes[i];
    mapIdPos[id] = i;
    nodeDict.push([]);
    positions.push(x, y);
  }
  for (i = 0; i < edges.length; i++) {
    const e = edges[i];
    nodeDict[mapIdPos[e.source]].push(mapIdPos[e.target]);
    nodeDict[mapIdPos[e.target]].push(mapIdPos[e.source]);
  }

  for (i = 0; i < nodes.length; i++) {
    const offset = resultEdges.length;
    const dests = nodeDict[i];
    const len = dests.length;
    indices[i] = offset;
    for (let j = 0; j < len; ++j) {
      const dest = dests[j];
      resultEdges.push(dest);
    }
  }

  indices.push(resultEdges.length);

  return [resultEdges, indices, positions];
};

function renderCircles(edges, indices, positions) {
  const $canvasContainer = document.createElement('div');
  $wrapper.appendChild($canvasContainer);

  const renderer = new WebGLRenderer({ targets: ['webgl2', 'webgl1'] });
  const canvas = new Canvas({
    container: $canvasContainer,
    width: CANVAS_SIZE,
    height: CANVAS_SIZE,
    renderer,
  });

  canvas.addEventListener(CanvasEvent.READY, () => {
    // draw edges
    for (let i = 0; i < indices.length - 1; i++) {
      const x1 = positions[i * 2];
      const y1 = positions[i * 2 + 1];

      for (let j = indices[i]; j < indices[i + 1]; j++) {
        const x2 = positions[edges[j] * 2];
        const y2 = positions[edges[j] * 2 + 1];
        canvas.appendChild(
          new Line({
            style: {
              x1,
              y1,
              x2,
              y2,
              stroke: '#1890FF',
              lineWidth: 1,
            },
          }),
        );
      }
    }

    // draw nodes
    for (let i = 0; i < positions.length; i += 2) {
      const x = positions[i];
      const y = positions[i + 1];

      canvas.appendChild(
        new Circle({
          style: {
            cx: x,
            cy: y,
            r: 5,
            fill: 'red',
            stroke: 'blue',
            lineWidth: 2,
          },
        }),
      );
    }
  });
}
