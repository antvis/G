import { Canvas, CanvasEvent } from '@antv/g';
import { Renderer } from '@antv/g-webgl';
import { Plugin, Kernel } from '@antv/g-plugin-gpgpu';
import { Compiler } from '@antv/g-webgpu-compiler';

// kernel code
const gCode = `
import { globalInvocationID } from 'g-webgpu';

@numthreads(8, 1, 1)
class Add2Vectors {
  @in @out
  vectorA: float[];

  @in
  vectorB: float[];

  sum(a: float, b: float): float {
    return a + b;
  }

  @main
  compute() {
    // 获取当前线程处理的数据
    const a = this.vectorA[globalInvocationID.x];
    const b = this.vectorB[globalInvocationID.x];
  
    // 输出当前线程处理完毕的数据，即两个向量相加后的结果
    this.vectorA[globalInvocationID.x] = this.sum(a, b);
  }
}
`;

// compile our kernel code
const compiler = new Compiler();
const bundle = compiler.compileBundle(gCode);

// create a renderer
const renderer = new Renderer();
// register GPGPU plugin
renderer.registerPlugin(new Plugin());
// create a canvas
const canvas = new Canvas({
  container: 'container',
  width: 1,
  height: 1,
  renderer,
});

canvas.addEventListener(CanvasEvent.READY, () => {
  // create our kernel
  const kernel = new Kernel({ canvas, bundle });

  // create input & output buffers
  const resultBuffer = kernel.createBuffer({
    name: 'vectorA',
    data: new Float32Array([1, 2, 3, 4, 5, 6, 7, 8]),
  });
  // or
  // resultBuffer.setSubData(0, new Float32Array([1, 2, 3, 4, 5, 6, 7, 8]));
  kernel.createBuffer({
    name: 'vectorB',
    data: new Float32Array([1, 2, 3, 4, 5, 6, 7, 8]),
  });

  // schedule a dispatch command
  kernel.dispatch(1, 1, 1);

  (async () => {
    // readback the result
    const result = await kernel.readBuffer(resultBuffer);

    // show the result
    const $container = document.getElementById('container');
    const $result = document.getElementById('result') || document.createElement('div');
    $result.id = 'result';
    $result.textContent = `
    Add 2 vectors: [1, 2, 3, 4, 5, 6, 7, 8] + [1, 2, 3, 4, 5, 6, 7, 8] 
    Result: [${result.toString()}]
  `;
    $container.appendChild($result);
  })();
});
