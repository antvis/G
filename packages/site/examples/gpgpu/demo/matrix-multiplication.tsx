import React, { useCallback, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { Canvas, CanvasEvent } from '@antv/g';
import { Renderer as WebGLRenderer, Kernel } from '@antv/g-webgl';
import * as dat from 'dat.gui';

/**
 * ported from https://web.dev/gpu-compute/
 */

const App = function MatrixMultiplication() {
  const [gpuTimeElapsed, setGPUTimeElapsed] = useState<number>(0);
  const [cpuTimeElapsed, setCPUTimeElapsed] = useState<number>(0);
  const [firstMatrix, setFirstMatrix] = useState<Float32Array>();
  const [secondMatrix, setSecondMatrix] = useState<Float32Array>();
  const [resultMatrix, setResultMatrix] = useState<Float32Array>();

  const containerRef = useCallback(node => {
    if (node !== null) {

      // create a canvas
      const canvas = new Canvas({
        container: node,
        width: 1,
        height: 1,
        renderer: new WebGLRenderer(),
      });

      canvas.addEventListener(CanvasEvent.READY, () => {
      console.log('ready...');
        const kernel = new Kernel({
          canvas,
          code: `
        [[block]] struct Matrix {
          size : vec2<f32>;
          numbers: array<f32>;
        };
        
        [[group(0), binding(0)]] var<storage, read> firstMatrix : Matrix;
        [[group(0), binding(1)]] var<storage, read> secondMatrix : Matrix;
        [[group(0), binding(2)]] var<storage, write> resultMatrix : Matrix;
        
        [[stage(compute), workgroup_size(8, 8)]]
        fn main([[builtin(global_invocation_id)]] global_id : vec3<u32>) {
          // Guard against out-of-bounds work group sizes
          if (global_id.x >= u32(firstMatrix.size.x) || global_id.y >= u32(secondMatrix.size.y)) {
            return;
          }
        
          resultMatrix.size = vec2<f32>(firstMatrix.size.x, secondMatrix.size.y);
        
          let resultCell = vec2<u32>(global_id.x, global_id.y);
          var result = 0.0;
          for (var i = 0u; i < u32(firstMatrix.size.y); i = i + 1u) {
            let a = i + resultCell.x * u32(firstMatrix.size.y);
            let b = resultCell.y + i * u32(secondMatrix.size.y);
            result = result + firstMatrix.numbers[a] * secondMatrix.numbers[b];
          }
        
          let index = resultCell.y + resultCell.x * u32(secondMatrix.size.y);
          resultMatrix.numbers[index] = result;
        }`,
        });

        calc(
          kernel,
          new Float32Array([
            2 /* rows */, 4 /* columns */,
            1, 2, 3, 4,
            5, 6, 7, 8
          ]),
          new Float32Array([
            4 /* rows */, 2 /* columns */,
            1, 2,
            3, 4,
            5, 6,
            7, 8
          ]),
        );

        // GUI
        const gui = new dat.GUI({ autoPlace: false });
        node.appendChild(gui.domElement);
        const folder = gui.addFolder('matrix size');
        const config = {
          size: 32,
        };
        folder.add(config, 'size', [32, 64,128,256, 512, 1024]).onChange((size) => {
          const first = new Float32Array([size, size].concat(new Array(size * size).fill(Math.random())));
          const second = new Float32Array([size, size].concat(new Array(size * size).fill(Math.random())));
          calc(kernel, first, second);
        });
        folder.open();
      });
    }
  }, []);

  const cpuMultiplication = (firstMatrix: Float32Array, secondMatrix: Float32Array) => {
    const startTime = window.performance.now();

    const x = firstMatrix[0];
    const z = firstMatrix[1];
    const y = secondMatrix[1];

    const resultMatrix = new Float32Array(firstMatrix[0] * secondMatrix[1]);

    let productRow = Array.apply(null, new Array(y)).map(Number.prototype.valueOf, 0);
    let product = new Array(x);
    for (let p = 0; p < x; p++) {
      product[p] = productRow.slice();
    }
    for (let i = 0; i < x; i++) {
      for (let j = 0; j < y; j++) {
         for (let k = 0; k < z; k++) {
            product[i][j] += firstMatrix[i * x + k] * secondMatrix[ k * y + j];
         }
      }
   }

    setCPUTimeElapsed(window.performance.now() - startTime);
  };

  const gpuMultiplication = async (kernel: Kernel,firstMatrix: Float32Array, secondMatrix: Float32Array) => {
    let startTime = window.performance.now();
    const x = Math.ceil(firstMatrix[0] / 8); // X dimension of the grid of workgroups to dispatch.
    const y = Math.ceil(secondMatrix[1] / 8); // Y dimension of the grid of workgroups to dispatch.
    const resultMatrixBufferSize = 2 + firstMatrix[0] * secondMatrix[1];
    const resultMatrix = new Float32Array(resultMatrixBufferSize);

    kernel.createBuffer({
      group: 0,
      binding: 0,
      usage: 'storage',
      accessMode: 'read',
      view: firstMatrix,
    });
    kernel.createBuffer({
      group: 0,
      binding: 1,
      usage: 'storage',
      accessMode: 'read',
      view: secondMatrix,
    });
    const resultBuffer = kernel.createBuffer({
      group: 0,
      binding: 2,
      usage: 'storage',
      accessMode: 'write',
      view: resultMatrix,
    });
    kernel.dispatch(x, y);
  
    // result
    await kernel.readBuffer(resultBuffer);

    setGPUTimeElapsed(window.performance.now() - startTime);
    setResultMatrix(resultMatrix);
  };

  const calc = async (kernel: Kernel, firstMatrix: Float32Array, secondMatrix: Float32Array) => {
    setFirstMatrix(firstMatrix);
    setSecondMatrix(secondMatrix);

    cpuMultiplication(firstMatrix, secondMatrix);
    gpuMultiplication(kernel, firstMatrix, secondMatrix);
  };

  return (<>
    <div ref={containerRef} />
    {firstMatrix && secondMatrix && resultMatrix &&
      <>
        <div><strong>First Matrix({firstMatrix[0]}x{firstMatrix[1]})</strong>: {firstMatrix.subarray(2,10).join(',')}...</div>
        <div><strong>Second Matrix({secondMatrix[0]}x{secondMatrix[1]})</strong>: {secondMatrix.subarray(2,10).join(',')}...</div>
        <div><strong>Result Matrix({resultMatrix[0]}x{resultMatrix[1]})</strong>: {resultMatrix.subarray(2,10).join(',')}...</div>
        <div><strong>GPU TimeElapsed: {gpuTimeElapsed}ms</strong></div>
        <div><strong>CPU TimeElapsed: {cpuTimeElapsed}ms</strong></div>
      </>
    }
  </>);
};

ReactDOM.render(<App />, document.getElementById('container'));
