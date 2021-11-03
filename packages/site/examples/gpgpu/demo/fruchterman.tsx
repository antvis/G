import React, { useCallback, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { Canvas, CanvasEvent } from '@antv/g';
import { Renderer as WebGLRenderer, Kernel } from '@antv/g-webgl';

/**
 * ported from https://nblintao.github.io/ParaGraphL/
 */

const CANVAS_SIZE = 600;
const MAX_ITERATION = 1;

const App = function FruchtermanLayout() {
  const [gpuTimeElapsed, setGPUTimeElapsed] = useState<number>(0);

  const containerRef = useCallback(node => {
    if (node !== null) {
      // create a canvas
      const canvas = new Canvas({
        container: node,
        width: CANVAS_SIZE,
        height: CANVAS_SIZE,
        renderer: new WebGLRenderer(),
      });

      canvas.addEventListener(CanvasEvent.READY, () => {
        const kernel = new Kernel({
          canvas,
          code: `
    [[block]] struct NodeEdges {
      vertexNum : u32;
      maxEdgePerVertex: u32;
      data: array<vec4<f32>>;
    };
    [[block]] struct Params {
      k: f32;
      k2: f32;
      gravity: f32;
      speed: f32;
      maxDisplace: f32;
      center: vec2<f32>;
    };
  
    [[group(0), binding(0)]] var<storage, read_write> input : NodeEdges;
    [[group(0), binding(1)]] var<uniform> params : Params;
  
    fn calc_repulsive(i: u32, current_node: vec4<f32>) -> vec2<f32> {
      var dx = 0.0;
      var dy = 0.0;
      for (var j = 0u; j < input.vertexNum; j = j + 1u) {
        if (i != j) {
          var nextNode = input.data[j];
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
  
    fn calc_gravity(current_node: vec4<f32>) -> vec2<f32> {
      var dx = 0.0;
      var dy = 0.0;
      var vx = current_node[0] - params.center[0];
      var vy = current_node[1] - params.center[1];
      var gf = 0.01 * params.k * params.gravity;
      dx = gf * vx;
      dy = gf * vy;
  
      return vec2<f32>(dx, dy);
    }
  
    fn calc_attractive(current_node: vec4<f32>) -> vec2<f32> {
      var dx = 0.0;
      var dy = 0.0;
      var arr_offset = u32(floor(current_node[2] + 0.5));
      var length = u32(floor(current_node[3] + 0.5));
      var node_buffer: vec4<f32>;
      for (var p = 0u; p < input.maxEdgePerVertex; p = p + 1u) {
        if (p >= length) {
          break;
        }
        var arr_idx = arr_offset + p;
        var buf_offset = arr_idx % 4u;
        if (p == 0u || buf_offset == 0u) {
          node_buffer = input.data[arr_idx / 4u];
        }
  
        var float_j = node_buffer[buf_offset];
        var int_j = u32(float_j);
        var next_node = input.data[int_j];
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
    
    [[stage(compute), workgroup_size(1, 1)]]
    fn main(
      [[builtin(global_invocation_id)]] global_id : vec3<u32>,
      [[builtin(local_invocation_id)]] local_id : vec3<u32>,
      [[builtin(workgroup_id)]] workgroup_id : vec3<u32>,
    ) {
      var i = global_id.x;
      var current_node = input.data[i];
      var dx = 0.0;
      var dy = 0.0;
  
      if (i >= input.vertexNum) {
        input.data[i] = current_node;
        return;
      }
  
      // repulsive
      var repulsive = calc_repulsive(i, current_node);
      dx = dx + repulsive[0];
      dy = dy + repulsive[1];
  
      // attractive
      var attractive = calc_attractive(current_node);
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
  
        input.data[i] = vec4<f32>(
          current_node[0] + dx / dist_length * limited_dist,
          current_node[1] + dy / dist_length * limited_dist,
          current_node[2],
          current_node[3]
        );
      }
    }`,
        });
  
        (async () => {
          // @see https://g6.antv.vision/en/examples/net/forceDirected/#basicForceDirected
          const data = await (
            await fetch(
              'https://gw.alipayobjects.com/os/basement_prod/7bacd7d1-4119-4ac1-8be3-4c4b9bcbc25f.json',
            )
          ).json();
  
          const center = [CANVAS_SIZE / 2, CANVAS_SIZE / 2];
          const nodes = data.nodes.map((n) => ({
            x: Math.random() * CANVAS_SIZE,
            y: Math.random() * CANVAS_SIZE,
            id: n.id,
          }));
          const edges = data.edges;
          const nodeNum = nodes.length;
          const nodesEdgesArray = buildTextureData(nodes, edges);
  
          const area = CANVAS_SIZE * CANVAS_SIZE;
          let maxDisplace = Math.sqrt(area) / 10;
          const k2 = area / (nodes.length + 1);
          const k = Math.sqrt(k2);
  
          const buffer1 = kernel.createBuffer({
            group: 0,
            binding: 0,
            usage: 'storage',
            accessMode: 'read_write',
            view: nodesEdgesArray,
          });
          const buffer2 = kernel.createBuffer({
            group: 0,
            binding: 1,
            accessMode: 'read',
            usage: 'uniform',
            view: new Float32Array([
              k, k2, 10, 0.1, maxDisplace, center[0], center[1], 0
            ]),
          });
  
          let startTime = window.performance.now();
          for (let i = 0; i < MAX_ITERATION; i++) {
            kernel.dispatch(nodeNum, 1);
  
            // maxDisplace *= 0.99;
            // buffer2.setSubData(0, new Float32Array([
            //   k, k2, 10, 0.1, maxDisplace, center[0], center[1]
            // ]));
          }
  
          // result
          await kernel.readBuffer(buffer1);
  
          setGPUTimeElapsed(window.performance.now() - startTime);
        })();
      });
    }
  }, []);

  const lineIndexBufferData = [];
  let maxEdgePerVetex;
  // @see https://github.com/nblintao/ParaGraphL/blob/master/sigma.layout.paragraphl.js#L192-L229
  const buildTextureData = (nodes, edges) => {
    const dataArray = [];
    const nodeDict = [];
    const mapIdPos = {};
    let i = 0;
    for (i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      mapIdPos[n.id] = i;
      dataArray.push(n.x);
      dataArray.push(n.y);
      dataArray.push(0);
      dataArray.push(0);
      nodeDict.push([]);
    }
    for (i = 0; i < edges.length; i++) {
      const e = edges[i];
      nodeDict[mapIdPos[e.source]].push(mapIdPos[e.target]);
      nodeDict[mapIdPos[e.target]].push(mapIdPos[e.source]);
      lineIndexBufferData.push(mapIdPos[e.source], mapIdPos[e.target]);
    }

    maxEdgePerVetex = 0;
    for (i = 0; i < nodes.length; i++) {
      const offset = dataArray.length;
      const dests = nodeDict[i];
      const len = dests.length;
      dataArray[i * 4 + 2] = offset;
      dataArray[i * 4 + 3] = dests.length;
      maxEdgePerVetex = Math.max(maxEdgePerVetex, dests.length);
      for (let j = 0; j < len; ++j) {
        const dest = dests[j];
        dataArray.push(+dest);
      }
    }

    dataArray.unshift(maxEdgePerVetex);
    dataArray.unshift(nodes.length);

    while (dataArray.length % 4 !== 0) {
      dataArray.push(0);
    }
    return new Float32Array(dataArray);
  }

  return (<>
    <div ref={containerRef} />
    <>
      <div><strong>GPU TimeElapsed: {gpuTimeElapsed}ms</strong></div>
    </>
  </>);
};

ReactDOM.render(<App />, document.getElementById('container'));
