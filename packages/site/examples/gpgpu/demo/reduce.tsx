import React, { useCallback, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { Canvas, CanvasEvent } from '@antv/g';
import { Renderer } from '@antv/g-webgl';
import { Plugin, Kernel } from '@antv/g-plugin-gpgpu';
import * as dat from 'dat.gui';

/**
 * ported from https://github.com/9ballsyndrome/WebGL_Compute_shader/blob/master/webgl-compute-bitonicSort/js/script.js
 */

const workgroupSize = 128;

const App = function ReduceSum() {
  const [gpuTimeElapsed, setGPUTimeElapsed] = useState<number>(0);
  const [cpuTimeElapsed, setCPUTimeElapsed] = useState<number>(0);
  const [array, setArray] = useState<number[]>();
  const [gpuResult, setGPUResult] = useState<number>(0);
  const [cpuResult, setCPUResult] = useState<number>(0);

  const containerRef = useCallback(node => {
    if (node !== null) {
      const renderer = new Renderer();
      renderer.registerPlugin(new Plugin());

      // create a canvas
      const canvas = new Canvas({
        container: node,
        width: 1,
        height: 1,
        renderer,
      });

      canvas.addEventListener(CanvasEvent.READY, () => {
        const kernel = new Kernel({
          canvas,
          code: `
        [[block]] struct Array {
          size: u32;
          data: array<f32>;
        };
  
        [[group(0), binding(0)]] var<storage, read_write> input : Array;
        
        var<workgroup> shared : array<f32, ${workgroupSize}>;
        
        [[stage(compute), workgroup_size(${workgroupSize}, 1)]]
        fn main(
          [[builtin(global_invocation_id)]] global_id : vec3<u32>,
          [[builtin(local_invocation_id)]] local_id : vec3<u32>,
          [[builtin(workgroup_id)]] workgroup_id : vec3<u32>,
        ) {
          var tid = local_id.x;
          // var i = global_id.x;
  
          // version 4
          var i = workgroup_id.x * ${workgroupSize}u * 2u + local_id.x;
          shared[tid] = input.data[i] + input.data[i + ${workgroupSize}u];
          // shared[tid] = input.data[i];
          workgroupBarrier();
  
          // version 5
          // for (var s = ${workgroupSize}u / 2u; s > 32u; s = s >> 1u) {
          // version 3
          for (var s = ${workgroupSize}u / 2u; s > 0u; s = s >> 1u) {
            if (tid < s) {
              shared[tid] = shared[tid] + shared[tid + s];
            }
  
          // for (var s = 1u; s < ${workgroupSize}u; s = s * 2u) {
            // version 1
            // if (tid % (s * 2u) == 0u) {
            //   shared[tid] = shared[tid] + shared[tid + s];
            // }
  
            // version 2
            // var index = 2u * s * tid;
            // if (index < ${workgroupSize}u) {
            //   shared[index] = shared[index] + shared[index + s];
            // }
            
            workgroupBarrier();
          }
  
          // if (tid < 32u) {
          //   shared[tid] =
          //     shared[tid + 32u]
          //     + shared[tid + 16u]
          //     + shared[tid + 8u]
          //     + shared[tid + 4u]
          //     + shared[tid + 2u]
          //     + shared[tid + 1u];
          // }
  
          if (tid == 0u) {
            input.data[workgroup_id.x] = shared[0u];
          }
        }`,
        });
  
        calc(
          kernel,
          new Array(200).fill(1),
        );
  
        // GUI
        const gui = new dat.GUI({ autoPlace: false });
        node.appendChild(gui.domElement);
        const folder = gui.addFolder('array size');
        const config = {
          size: 32,
        };
        folder.add(config, 'size', [32, 1000, 10000, 100000, 1000000]).onChange((size) => {
          calc(kernel, new Array(Number(size)).fill(undefined).map(() => Math.random()));
        });
        folder.open();
      });
    }
  }, []);

  const cpuReduceSum = (array: number[]) => {
    const startTime = window.performance.now();
    setCPUResult(array.reduce((prev, cur) => prev + cur, 0));
    setCPUTimeElapsed(window.performance.now() - startTime);
  };

  const gpuReduceSum = async (kernel: Kernel, array: number[]) => {
    const padding = array.concat(
      new Array(workgroupSize - array.length % workgroupSize).fill(0)
    );

    const input = new Float32Array(
      [padding.length] // size
      .concat(padding) // origin data
    );

    let startTime = window.performance.now();

    const result = kernel
      .createBuffer({
        name: 'input',
        data: input,
      });
    kernel.dispatch(Math.ceil(array.length / workgroupSize), 1);
  
    // result
    await kernel.readBuffer(result);
    
    setGPUResult(input.slice(1, padding.length / workgroupSize + 1).reduce((prev, cur) => prev + cur, 0));
    setGPUTimeElapsed(window.performance.now() - startTime);
  };

  const calc = async (kernel: Kernel, array: number[]) => {
    setArray(array);
    cpuReduceSum(array);
    gpuReduceSum(kernel, array);
  };

  return (<>
    <div ref={containerRef} />
    {array &&
      <>
        <div><strong>Array({array.length})</strong>: {array.slice(0, 10).join(',')}...</div>
        <div><strong>GPU Result: {gpuResult}</strong></div>
        <div><strong>CPU Result: {cpuResult}</strong></div>
        <div><strong>GPU TimeElapsed: {gpuTimeElapsed}ms</strong></div>
        <div><strong>CPU TimeElapsed: {cpuTimeElapsed}ms</strong></div>
      </>
    }
  </>);
};

ReactDOM.render(<App />, document.getElementById('container'));
