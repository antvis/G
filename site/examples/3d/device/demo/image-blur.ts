// import { WebGPUDeviceContribution } from '@antv/g-plugin-webgpu-device';
// import {
//   VertexStepMode,
//   Format,
//   TransparentWhite,
//   Buffer,
//   Bindings,
//   BufferUsage,
//   TextureUsage,
// } from '@antv/g-plugin-device-renderer';

// /**
//  * Use Compute Shader with WebGPU
//  * @see https://webgpu.github.io/webgpu-samples/samples/imageBlur#main.ts
//  */

// const deviceContributionWebGPU = new WebGPUDeviceContribution(
//   {
//     shaderCompilerPath: '/glsl_wgsl_compiler_bg.wasm',
//   },
//   // @ts-ignore
//   {
//     globalThis: window,
//   },
// );

// async function loadImage(url: string): Promise<HTMLImageElement | ImageBitmap> {
//   if (!!window.createImageBitmap) {
//     const response = await fetch(url);
//     const imageBitmap = await createImageBitmap(await response.blob());
//     return imageBitmap;
//   } else {
//     const image = new window.Image();
//     return new Promise((res) => {
//       image.onload = () => res(image);
//       image.src = url;
//       image.crossOrigin = 'Anonymous';
//     });
//   }
// }

// const $container = document.getElementById('container')!;
// const $canvasContainer = document.createElement('div');
// $canvasContainer.id = 'canvas';
// $container.appendChild($canvasContainer);

// async function render(deviceContribution: WebGPUDeviceContribution) {
//   $canvasContainer.innerHTML = '';
//   const $canvas = document.createElement('canvas');
//   $canvas.width = 1000;
//   $canvas.height = 1000;
//   $canvas.style.width = '500px';
//   $canvas.style.height = '500px';
//   $canvasContainer.appendChild($canvas);

//   // Low-res, pixelated render target so it's easier to see fine details.
//   const kCanvasSize = 200;
//   const kViewportGridSize = 4;
//   const kViewportGridStride = Math.floor(kCanvasSize / kViewportGridSize);
//   const kViewportSize = kViewportGridStride - 2;

//   // The canvas buffer size is 200x200.
//   // Compute a canvas CSS size such that there's an integer number of device
//   // pixels per canvas pixel ("integer" or "pixel-perfect" scaling).
//   // Note the result may be 1 pixel off since ResizeObserver is not used.
//   const kCanvasLayoutCSSSize = 500; // set by template styles
//   const kCanvasLayoutDevicePixels = kCanvasLayoutCSSSize * window.devicePixelRatio;
//   const kScaleFactor = Math.floor(kCanvasLayoutDevicePixels / kCanvasSize);
//   const kCanvasDevicePixels = kScaleFactor * kCanvasSize;
//   const kCanvasCSSSize = kCanvasDevicePixels / window.devicePixelRatio;

//   // Set up a texture with 4 mip levels, each containing a differently-colored
//   // checkerboard with 1x1 pixels (so when rendered the checkerboards are
//   // different sizes). This is different from a normal mipmap where each level
//   // would look like a lower-resolution version of the previous one.
//   // Level 0 is 16x16 white/black
//   // Level 1 is 8x8 blue/black
//   // Level 2 is 4x4 yellow/black
//   // Level 3 is 2x2 pink/black
//   const kTextureMipLevels = 4;
//   const kTextureBaseSize = 16;

//   // create swap chain and get device
//   const swapChain = await deviceContribution.createSwapChain($canvas);
//   swapChain.configureSwapChain($canvas.width, $canvas.height);
//   const device = swapChain.getDevice();

//   const checkerboard = device.createTexture({
//     pixelFormat: Format.U8_RGBA_RT,
//     usage: TextureUsage.SAMPLED,
//     width: kTextureBaseSize,
//     height: kTextureBaseSize,
//     numLevels: 4,
//     // usage: GPUTextureUsage.COPY_DST | GPUTextureUsage.TEXTURE_BINDING,
//   });

//   const kColorForLevel = [
//     [255, 255, 255, 255],
//     [30, 136, 229, 255], // blue
//     [255, 193, 7, 255], // yellow
//     [216, 27, 96, 255], // pink
//   ];
//   for (let mipLevel = 0; mipLevel < kTextureMipLevels; ++mipLevel) {
//     const size = 2 ** (kTextureMipLevels - mipLevel); // 16, 8, 4, 2
//     const data = new Uint8Array(size * size * 4);
//     for (let y = 0; y < size; ++y) {
//       for (let x = 0; x < size; ++x) {
//         data.set(
//           (x + y) % 2 ? kColorForLevel[mipLevel] : [0, 0, 0, 255],
//           (y * size + x) * 4
//         );
//       }
//     }

//     checkerboard.setImageData();
//     // device.queue.writeTexture(
//     //   { texture: checkerboard, mipLevel },
//     //   data,
//     //   { bytesPerRow: size * 4 },
//     //   [size, size]
//     // );
//   }

//   const bufConfig = device.createBuffer({
//     usage: BufferUsage.UNIFORM,
//     viewOrSize: 128,
//   });

//   const kInitConfig = {
//     flangeLogSize: 1.0,
//     highlightFlange: false,
//     animation: 0.1,
//   } as const;
//   const config = { ...kInitConfig };
//   const updateConfigBuffer = () => {
//     const t = (performance.now() / 1000) * 0.5;
//     const data = new Float32Array([
//       Math.cos(t) * config.animation,
//       Math.sin(t) * config.animation,
//       (2 ** config.flangeLogSize - 1) / 2,
//       Number(config.highlightFlange),
//     ]);
//     bufConfig.setSubData(64, new Uint8Array(data.buffer));
//   };

//   const renderProgram = device.createProgram({
//     vertex: {
//       entryPoint: 'vert_main',
//       wgsl: `
// struct VertexOutput {
//   @builtin(position) Position : vec4<f32>,
//   @location(0) fragUV : vec2<f32>,
// }

// @vertex
// fn vert_main(@builtin(vertex_index) VertexIndex : u32) -> VertexOutput {
//   const pos = array(
//     vec2( 1.0,  1.0),
//     vec2( 1.0, -1.0),
//     vec2(-1.0, -1.0),
//     vec2( 1.0,  1.0),
//     vec2(-1.0, -1.0),
//     vec2(-1.0,  1.0),
//   );

//   const uv = array(
//     vec2(1.0, 0.0),
//     vec2(1.0, 1.0),
//     vec2(0.0, 1.0),
//     vec2(1.0, 0.0),
//     vec2(0.0, 1.0),
//     vec2(0.0, 0.0),
//   );

//   var output : VertexOutput;
//   output.Position = vec4(pos[VertexIndex], 0.0, 1.0);
//   output.fragUV = uv[VertexIndex];
//   return output;
// }`,
//     },
//     fragment: {
//       entryPoint: 'frag_main',
//       wgsl: `
// @group(0) @binding(0) var mySampler : sampler;
// @group(0) @binding(1) var myTexture : texture_2d<f32>;

// @fragment
// fn frag_main(@location(0) fragUV : vec2<f32>) -> @location(0) vec4<f32> {
//   return textureSample(myTexture, mySampler, fragUV);
// }`,
//     },
//   });

//   const computeProgram = device.createProgram({
//     compute: {
//       wgsl: `
// struct Params {
//   filterDim : i32,
//   blockDim : u32,
// }

// @group(0) @binding(0) var samp : sampler;
// @group(0) @binding(1) var<uniform> params : Params;
// @group(1) @binding(1) var inputTex : texture_2d<f32>;
// @group(1) @binding(2) var outputTex : texture_storage_2d<rgba8unorm, write>;

// struct Flip {
//   value : u32,
// }
// @group(1) @binding(3) var<uniform> flip : Flip;

// // This shader blurs the input texture in one direction, depending on whether
// // |flip.value| is 0 or 1.
// // It does so by running (128 / 4) threads per workgroup to load 128
// // texels into 4 rows of shared memory. Each thread loads a
// // 4 x 4 block of texels to take advantage of the texture sampling
// // hardware.
// // Then, each thread computes the blur result by averaging the adjacent texel values
// // in shared memory.
// // Because we're operating on a subset of the texture, we cannot compute all of the
// // results since not all of the neighbors are available in shared memory.
// // Specifically, with 128 x 128 tiles, we can only compute and write out
// // square blocks of size 128 - (filterSize - 1). We compute the number of blocks
// // needed in Javascript and dispatch that amount.

// var<workgroup> tile : array<array<vec3<f32>, 128>, 4>;

// @compute @workgroup_size(32, 1, 1)
// fn main(
//   @builtin(workgroup_id) WorkGroupID : vec3<u32>,
//   @builtin(local_invocation_id) LocalInvocationID : vec3<u32>
// ) {
//   let filterOffset = (params.filterDim - 1) / 2;
//   let dims = vec2<i32>(textureDimensions(inputTex, 0));
//   let baseIndex = vec2<i32>(WorkGroupID.xy * vec2(params.blockDim, 4) +
//                             LocalInvocationID.xy * vec2(4, 1))
//                   - vec2(filterOffset, 0);

//   for (var r = 0; r < 4; r++) {
//     for (var c = 0; c < 4; c++) {
//       var loadIndex = baseIndex + vec2(c, r);
//       if (flip.value != 0u) {
//         loadIndex = loadIndex.yx;
//       }

//       tile[r][4 * LocalInvocationID.x + u32(c)] = textureSampleLevel(
//         inputTex,
//         samp,
//         (vec2<f32>(loadIndex) + vec2<f32>(0.25, 0.25)) / vec2<f32>(dims),
//         0.0
//       ).rgb;
//     }
//   }

//   workgroupBarrier();

//   for (var r = 0; r < 4; r++) {
//     for (var c = 0; c < 4; c++) {
//       var writeIndex = baseIndex + vec2(c, r);
//       if (flip.value != 0) {
//         writeIndex = writeIndex.yx;
//       }

//       let center = i32(4 * LocalInvocationID.x) + c;
//       if (center >= filterOffset &&
//           center < 128 - filterOffset &&
//           all(writeIndex < dims)) {
//         var acc = vec3(0.0, 0.0, 0.0);
//         for (var f = 0; f < params.filterDim; f++) {
//           var i = center + f - filterOffset;
//           acc = acc + (1.0 / f32(params.filterDim)) * tile[r][i];
//         }
//         textureStore(outputTex, writeIndex, vec4(acc, 1.0));
//       }
//     }
//   }
// }

// `,
//     },
//   });

//   const particleBuffers: Buffer[] = [];
//   for (let i = 0; i < 2; ++i) {
//     particleBuffers[i] = device.createBuffer({
//       viewOrSize: initialParticleData,
//       usage: BufferUsage.VERTEX | BufferUsage.STORAGE,
//     });
//   }

//   const vertexBufferData = new Float32Array([
//     -0.01, -0.02, 0.01, -0.02, 0.0, 0.02,
//   ]);
//   const spriteVertexBuffer = device.createBuffer({
//     viewOrSize: vertexBufferData,
//     usage: BufferUsage.VERTEX,
//   });

//   const uniformBuffer = device.createBuffer({
//     viewOrSize: 7 * Float32Array.BYTES_PER_ELEMENT,
//     usage: BufferUsage.UNIFORM,
//   });

//   const inputLayout = device.createInputLayout({
//     vertexBufferDescriptors: [
//       {
//         byteStride: 4 * 4,
//         stepMode: VertexStepMode.INSTANCE,
//       },
//       {
//         byteStride: 4 * 2,
//         stepMode: VertexStepMode.VERTEX,
//       },
//     ],
//     vertexAttributeDescriptors: [
//       {
//         // instance position
//         bufferIndex: 0,
//         location: 0,
//         bufferByteOffset: 0,
//         format: Format.F32_RG,
//       },
//       {
//         // instance velocity
//         bufferIndex: 0,
//         location: 1,
//         bufferByteOffset: 4 * 2,
//         format: Format.F32_RG,
//       },
//       {
//         // vertex positions
//         bufferIndex: 1,
//         location: 2,
//         bufferByteOffset: 0,
//         format: Format.F32_RG,
//       },
//     ],
//     indexBufferFormat: null,
//     program: renderProgram,
//   });

//   const renderPipeline = device.createRenderPipeline({
//     inputLayout,
//     program: renderProgram,
//     colorAttachmentFormats: [Format.U8_RGBA_RT],
//   });
//   const computePipeline = device.createComputePipeline({
//     inputLayout: null,
//     program: computeProgram,
//   });

//   const simParams = {
//     deltaT: 0.04,
//     rule1Distance: 0.1,
//     rule2Distance: 0.025,
//     rule3Distance: 0.025,
//     rule1Scale: 0.02,
//     rule2Scale: 0.05,
//     rule3Scale: 0.005,
//   };

//   const bindings: Bindings[] = [];
//   for (let i = 0; i < 2; ++i) {
//     bindings[i] = device.createBindings({
//       pipeline: computePipeline,
//       uniformBufferBindings: [
//         {
//           binding: 0,
//           buffer: uniformBuffer,
//           size: 7 * Float32Array.BYTES_PER_ELEMENT,
//         },
//       ],
//       storageBufferBindings: [
//         {
//           binding: 1,
//           buffer: particleBuffers[i],
//           size: initialParticleData.byteLength,
//         },
//         {
//           binding: 2,
//           buffer: particleBuffers[(i + 1) % 2],
//           size: initialParticleData.byteLength,
//         },
//       ],
//     });
//   }

//   const renderTarget = device.createRenderTarget({
//     pixelFormat: Format.U8_RGBA_RT,
//     width: $canvas.width,
//     height: $canvas.height,
//   });
//   device.setResourceName(renderTarget, 'Main Render Target');

//   uniformBuffer.setSubData(
//     0,
//     new Uint8Array(
//       new Float32Array([
//         simParams.deltaT,
//         simParams.rule1Distance,
//         simParams.rule2Distance,
//         simParams.rule3Distance,
//         simParams.rule1Scale,
//         simParams.rule2Scale,
//         simParams.rule3Scale,
//       ]).buffer,
//     ),
//   );

//   let id;
//   let t = 0;
//   const frame = () => {
//     const computePass = device.createComputePass();
//     computePass.setPipeline(computePipeline);
//     computePass.setBindings(bindings[t % 2]);
//     computePass.dispatchWorkgroups(Math.ceil(numParticles / 64));
//     device.submitPass(computePass);

//     /**
//      * An application should call getCurrentTexture() in the same task that renders to the canvas texture.
//      * Otherwise, the texture could get destroyed by these steps before the application is finished rendering to it.
//      */
//     const onscreenTexture = swapChain.getOnscreenTexture();
//     const renderPass = device.createRenderPass({
//       colorAttachment: [renderTarget],
//       colorResolveTo: [onscreenTexture],
//       colorClearColor: [TransparentWhite],
//     });
//     renderPass.setPipeline(renderPipeline);
//     renderPass.setVertexInput(
//       inputLayout,
//       [
//         {
//           buffer: particleBuffers[(t + 1) % 2],
//         },
//         {
//           buffer: spriteVertexBuffer,
//         },
//       ],
//       null,
//     );
//     renderPass.setViewport(0, 0, $canvas.width, $canvas.height);
//     renderPass.draw(3, numParticles);

//     device.submitPass(renderPass);
//     ++t;
//     id = requestAnimationFrame(frame);
//   };

//   frame();

//   return () => {
//     if (id) {
//       cancelAnimationFrame(id);
//     }
//     renderProgram.destroy();
//     computeProgram.destroy();
//     particleBuffers.forEach((buffer) => buffer.destroy());
//     uniformBuffer.destroy();
//     spriteVertexBuffer.destroy();
//     inputLayout.destroy();
//     renderPipeline.destroy();
//     computePipeline.destroy();
//     renderTarget.destroy();
//     device.destroy();

//     // For debug.
//     device.checkForLeaks();
//   };
// }

// (async () => {
//   await render(deviceContributionWebGPU);
// })();
