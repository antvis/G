import React, { useCallback, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { Canvas, CanvasEvent } from '@antv/g';
import { Renderer as WebGLRenderer, Kernel } from '@antv/g-webgl';
import { Select, Table } from 'antd';

/**
 * ported from
 * @see https://www.lewuathe.com/illustration-of-distributed-bellman-ford-algorithm.html
 * @see https://github.com/sengorajkumar/gpu_graph_algorithms
 */

/**
 * use Compressed Sparse Row (CSR) for adjacency list
 */
const V = [1, 2, 3, 4, 5];
const E = [2, 4, 3, 4, 5, 2, 3, 5, 1, 3];
const I = [0, 2, 5, 6, 8, 10];
const W = [6, 7, 5, 8, -4, -2, -3, 9, 2, 7];
const VSize = V.length;

const workgroupSize = 5;
const CANVAS_SIZE = 1;
const MAX_DISTANCE = 10000;

let kernel: Kernel;
const App = function BellmanFordSSSP() {
  const [datasource, setDatasource] = useState<
    Array<{
      destination: string;
      weight: number;
      prevPoint: string;
    }>
  >([]);
  const [gpuTimeElapsed, setGPUTimeElapsed] = useState<number>(0);

  const calcShortestPath = async () => {

    kernel.createBuffer({
      group: 0,
      binding: 0,
      usage: 'storage',
      accessMode: 'read',
      view: new Float32Array(V),
    });
    kernel.createBuffer({
      group: 0,
      binding: 1,
      usage: 'storage',
      accessMode: 'read',
      view: new Float32Array(E),
    });
    kernel.createBuffer({
      group: 0,
      binding: 2,
      usage: 'storage',
      accessMode: 'read',
      view: new Float32Array(I),
    });
    kernel.createBuffer({
      group: 0,
      binding: 3,
      usage: 'storage',
      accessMode: 'read',
      view: new Float32Array(W),
    });
    
    const d_out_D = kernel.createBuffer({
      group: 0,
      binding: 4,
      usage: 'storage',
      accessMode: 'read_write',
      view: new Float32Array(new Array(VSize).fill(MAX_DISTANCE)),
    });
    const d_out_Di_View = new Float32Array(new Array(VSize).fill(MAX_DISTANCE));
    const d_out_Di = kernel.createBuffer({
      group: 0,
      binding: 5,
      usage: 'storage',
      accessMode: 'read_write',
      view: d_out_Di_View,
    });

    let startTime = window.performance.now();

    for (let i = 1; i < VSize; i++) {
      kernel.dispatch(VSize, 1);
    }

    // result
    await kernel.readBuffer(d_out_Di);

    console.log(d_out_Di_View);
  };

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
        kernel = new Kernel({
          canvas,
          code: `
[[block]] struct Buffer {
  data: array<i32>;
};
[[block]] struct AtomicBuffer {
  data: array<atomic<i32>>;
};

[[group(0), binding(0)]] var<storage, read> d_in_V : Buffer;
[[group(0), binding(1)]] var<storage, read> d_in_E : Buffer;
[[group(0), binding(2)]] var<storage, read> d_in_I : Buffer;
[[group(0), binding(3)]] var<storage, read> d_in_W : Buffer;
[[group(0), binding(4)]] var<storage, read> d_out_D : Buffer;
[[group(0), binding(5)]] var<storage, read_write> d_out_Di : AtomicBuffer;

[[stage(compute), workgroup_size(${workgroupSize}, 1)]]
fn main(
  [[builtin(global_invocation_id)]] global_id : vec3<u32>
) {
  var index = global_id.x;
  var v_index = d_in_V.data[index];
  if (index < ${VSize}u - 1u) { // do index < N - 1 because nth element of I array points to the end of E array
    for (var j = d_in_I.data[index]; j < d_in_I.data[index + 1u]; j = j + 1) {
      var w = d_in_W.data[j];
      var du = d_out_D.data[index];
      var dv = d_out_D.data[d_in_E.data[j]];
      var newDist = du + w;
      if (du == ${MAX_DISTANCE}) {
        newDist = ${MAX_DISTANCE};
      }

      if (newDist < dv) {
        ignore(atomicMin(&d_out_Di.data[d_in_E.data[j]], newDist));
      }
    }

    // ignore(atomicMin(&d_out_Di.data[index], 10));
  }
}`,
        });

        calcShortestPath();
      });
    }
  }, []);

  return (<>
    <div ref={containerRef} />
    {/* <div>Elapsed time: {Math.round(gpuTimeElapsed)} ms</div>
      <div>
        Shortest path from
        <Select
          defaultValue="B"
          options={data.nodes.map((node) => ({
            value: node.id,
            label: node.label,
          }))}
          onChange={calcShortestPath}
        />
      </div>
      <Table
        rowKey="destination"
        columns={[
          {
            dataIndex: 'destination',
            title: 'destination',
          },
          {
            dataIndex: 'weight',
            title: 'weight',
          },
          {
            dataIndex: 'prevPoint',
            title: 'previous point',
          },
        ]}
        dataSource={datasource}
        pagination={false}
      /> */}
  </>);
};

ReactDOM.render(<App />, document.getElementById('container'));
