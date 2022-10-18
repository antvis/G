// import { inject, injectable } from 'inversify';
// import { Camera, DisplayObject } from '@antv/g-lite';
// // @ts-ignore
// import blendFS from '../services/shader-module/shaders/webgl.blend.frag.glsl';
// // @ts-ignore
// import copyFS from '../services/shader-module/shaders/webgl.copy.frag.glsl';
// // @ts-ignore
// import quadVS from '../services/shader-module/shaders/webgl.copy.vert.glsl';
// import { FrameGraphEngine, IRenderPass, RenderPassFactory } from '../FrameGraphEngine';
// import {
//   IFramebuffer,
//   IModel,
//   IModelInitializationOptions,
//   RenderingEngine,
// } from '../services/renderer';
// import { ShaderModuleService, ShaderType } from '../services/shader-module';
// import { FrameGraphHandle } from '../components/framegraph/FrameGraphHandle';
// import { gl } from '../services/renderer/constants';
// import { RenderPass, RenderPassData } from './RenderPass';
// import { PassNode } from '../components/framegraph/PassNode';
// import { FrameGraphPass } from '../components/framegraph/FrameGraphPass';
// import { ResourcePool } from '../components/framegraph/ResourcePool';
// import { View } from '../View';
// import { CopyPass, CopyPassData } from './CopyPass';

// // Generate halton sequence
// // https://en.wikipedia.org/wiki/Halton_sequence
// function halton(index: number, base: number) {
//   let result = 0;
//   let f = 1 / base;
//   let i = index;
//   while (i > 0) {
//     result = result + f * (i % base);
//     i = Math.floor(i / base);
//     f = f / base;
//   }
//   return result;
// }

// // 累加计数器
// let accumulatingId = 1;

// export interface TAAPassData {
//   sample: FrameGraphHandle;
//   prev: FrameGraphHandle;
//   copy: FrameGraphHandle;
//   output: FrameGraphHandle;
// }

// /**
//  * TAA（Temporal Anti-Aliasing）
//  * 在需要后处理的场景中（例如 L7 的热力图需要 blur pass、PBR 中的 SSAO 环境光遮蔽），无法使用浏览器内置的 MSAA，
//  * 只能使用 TAA
//  * @see https://yuque.antfin-inc.com/yuqi.pyq/fgetpa/ri52hv
//  */
// @injectable()
// export default class TAAPass implements IRenderPass<TAAPassData> {
//   static IDENTIFIER = 'TAA Pass';

//   @inject(RenderingEngine)
//   private readonly engine: RenderingEngine;

//   @inject(ShaderModuleService)
//   private shaderModuleService: ShaderModuleService;

//   @inject(ResourcePool)
//   private readonly resourcePool: ResourcePool;

//   @inject(RenderPassFactory)
//   private renderPassFactory: <T>(name: string) => IRenderPass<T>;

//   @inject(View)
//   private view: View;

//   /**
//    * 低差异序列
//    */
//   private haltonSequence: Array<[number, number]> = [];

//   /**
//    * 当前累加任务 ID，例如用户连续拖拽时上一次累加很有可能没有结束，此时在开启新一轮累加之前需要结束掉之前未完成的
//    */
//   private accumulatingId: number = 0;

//   /**
//    * 每一轮累加中的 frameID
//    */
//   private frame: number = 0;

//   /**
//    * 每一轮累加中的 frame 定时器
//    */
//   private timer: number | undefined = undefined;

//   private sampleRenderTarget: IFramebuffer;
//   private prevRenderTarget: IFramebuffer;
//   private outputRenderTarget: IFramebuffer;
//   private copyRenderTarget: IFramebuffer;

//   private blendModel: IModel;
//   private outputModel: IModel;
//   private copyModel: IModel;

//   private renderPass: RenderPass;
//   private copyPass: CopyPass;

//   setup = (fg: FrameGraphEngine, passNode: PassNode, pass: FrameGraphPass<TAAPassData>): void => {
//     const sample = fg.createRenderTarget(passNode, 'sample', {
//       width: 1,
//       height: 1,
//     });

//     const prev = fg.createRenderTarget(passNode, 'prev', {
//       width: 1,
//       height: 1,
//     });

//     const copy = fg.createRenderTarget(passNode, 'copy', {
//       width: 1,
//       height: 1,
//     });

//     const output = fg.createRenderTarget(passNode, 'output', {
//       width: 1,
//       height: 1,
//     });

//     pass.data = {
//       sample,
//       prev,
//       copy: passNode.write(fg, copy),
//       output,
//     };

//     for (let i = 0; i < 30; i++) {
//       this.haltonSequence.push([halton(i, 2), halton(i, 3)]);
//     }

//     this.renderPass = this.renderPassFactory<RenderPassData>(RenderPass.IDENTIFIER) as RenderPass;
//   };

//   // @ts-ignore
//   execute = (
//     fg: FrameGraphEngine,
//     pass: FrameGraphPass<TAAPassData>,
//     displayObjects: DisplayObject[],
//   ) => {
//     this.copyPass = this.renderPassFactory<CopyPassData>(CopyPass.IDENTIFIER) as CopyPass;

//     if (!this.blendModel) {
//       this.blendModel = this.createTriangleModel('blend-pass', blendFS);
//     }

//     if (!this.outputModel) {
//       this.outputModel = this.createTriangleModel('copy-pass', copyFS, {
//         blend: {
//           enable: true,
//           func: {
//             srcRGB: gl.ONE,
//             dstRGB: gl.ONE_MINUS_SRC_ALPHA,
//             srcAlpha: gl.ONE,
//             dstAlpha: gl.ONE_MINUS_SRC_ALPHA,
//           },
//           equation: {
//             rgb: gl.FUNC_ADD,
//             alpha: gl.FUNC_ADD,
//           },
//         },
//       });
//     }

//     if (!this.copyModel) {
//       this.copyModel = this.createTriangleModel('copy-pass', copyFS);
//     }

//     const viewport = this.view.getViewport();

//     this.sampleRenderTarget = this.resourcePool.getOrCreateResource(
//       fg.getResourceNode(pass.data.sample).resource,
//     );
//     this.prevRenderTarget = this.resourcePool.getOrCreateResource(
//       fg.getResourceNode(pass.data.prev).resource,
//     );
//     this.outputRenderTarget = this.resourcePool.getOrCreateResource(
//       fg.getResourceNode(pass.data.output).resource,
//     );
//     this.copyRenderTarget = this.resourcePool.getOrCreateResource(
//       fg.getResourceNode(pass.data.copy).resource,
//     );
//     this.sampleRenderTarget.resize(viewport);
//     this.prevRenderTarget.resize(viewport);
//     this.outputRenderTarget.resize(viewport);
//     this.copyRenderTarget.resize(viewport);

//     this.resetFrame();
//     // 首先停止上一次的累加
//     this.stopAccumulating();

//     const { clear, useFramebuffer } = this.engine;
//     // 先输出到 copy
//     useFramebuffer(
//       {
//         framebuffer: this.copyRenderTarget,
//       },
//       () => {
//         clear({
//           color: [0, 0, 0, 0],
//           depth: 1,
//           stencil: 0,
//           framebuffer: this.copyRenderTarget,
//         });

//         this.renderPass.renderDisplayObjects(displayObjects);
//       },
//     );

//     const accumulate = (id: number) => {
//       // 在开启新一轮累加之前，需要先结束掉之前的累加
//       if (!this.accumulatingId || id !== this.accumulatingId) {
//         return;
//       }

//       if (!this.isFinished()) {
//         this.doRender(displayObjects);

//         requestAnimationFrame(() => {
//           accumulate(id);
//         });
//       }
//     };

//     this.accumulatingId = accumulatingId++;
//     this.timer = window.setTimeout(() => {
//       accumulate(this.accumulatingId);
//     }, 50);
//   };

//   //   // 先输出到 PostProcessor
//   //   const readFBO = layer.multiPassRenderer.getPostProcessor().getReadFBO();
//   //   useFramebuffer(readFBO, () => {
//   //     clear({
//   //       color: [0, 0, 0, 0],
//   //       depth: 1,
//   //       stencil: 0,
//   //       framebuffer: readFBO,
//   //     });

//   //     // render to post processor
//   //     layer.multiPassRenderer.setRenderFlag(false);
//   //     layer.render();
//   //     layer.multiPassRenderer.setRenderFlag(true);
//   //   });

//   private doRender(displayObjects: DisplayObject[]) {
//     console.log(`accumulatingId: ${this.accumulatingId} ${this.frame}`);

//     const { clear, useFramebuffer } = this.engine;
//     const { width, height } = this.view.getViewport();
//     const jitterScale = 1;

//     // 使用 Halton 序列抖动投影矩阵
//     const offset = this.haltonSequence[this.frame % this.haltonSequence.length];
//     this.camera.jitterProjectionMatrix(
//       ((offset[0] * 2.0 - 1.0) / width) * jitterScale,
//       ((offset[1] * 2.0 - 1.0) / height) * jitterScale,
//     );

//     // 按抖动后的投影矩阵渲染
//     useFramebuffer(
//       {
//         framebuffer: this.sampleRenderTarget,
//       },
//       () => {
//         clear({
//           color: [0, 0, 0, 0],
//           depth: 1,
//           stencil: 0,
//           framebuffer: this.sampleRenderTarget,
//         });

//         this.renderPass.renderDisplayObjects(displayObjects);
//       },
//     );

//     // 混合
//     useFramebuffer(
//       {
//         framebuffer: this.outputRenderTarget,
//       },
//       () => {
//         this.blendModel.draw({
//           uniforms: {
//             u_Opacity: 1,
//             u_MixRatio: this.frame === 0 ? 1 : 0.9,
//             u_Diffuse1: this.sampleRenderTarget,
//             u_Diffuse2:
//               this.frame === 0
//                 ? // ? layer.multiPassRenderer.getPostProcessor().getReadFBO()
//                   this.copyRenderTarget
//                 : this.prevRenderTarget,
//           },
//         });
//       },
//     );

//     // 输出累加结果
//     if (this.frame === 0) {
//       clear({
//         color: [0, 0, 0, 0],
//         depth: 1,
//         stencil: 0,
//         framebuffer: this.copyRenderTarget,
//       });
//     }

//     if (this.frame >= 1) {
//       useFramebuffer(
//         {
//           framebuffer: this.copyRenderTarget,
//         },
//         () => {
//           this.outputModel.draw({
//             uniforms: {
//               u_Texture: this.outputRenderTarget,
//             },
//           });
//         },
//       );

//       this.copyPass.render(this.copyRenderTarget);

//       // useFramebuffer(
//       //   layer.multiPassRenderer.getPostProcessor().getReadFBO(),
//       //   () => {
//       //     this.copyModel.draw({
//       //       uniforms: {
//       //         u_Texture: this.copyRenderTarget,
//       //       },
//       //     });
//       //   },
//       // );
//       // layer.multiPassRenderer.getPostProcessor().render(layer);
//     }

//     // 保存前序帧结果
//     const tmp = this.prevRenderTarget;
//     this.prevRenderTarget = this.outputRenderTarget;
//     this.outputRenderTarget = tmp;

//     this.frame++;

//     // 恢复 jitter 后的相机
//     this.camera.clearJitterProjectionMatrix();
//   }

//   /**
//    * 是否已经完成累加
//    */
//   private isFinished() {
//     return this.frame >= this.haltonSequence.length;
//   }

//   private resetFrame() {
//     this.frame = 0;
//   }

//   private stopAccumulating() {
//     this.accumulatingId = 0;
//     window.clearTimeout(this.timer);
//   }

//   private createTriangleModel(
//     shaderModuleName: string,
//     fragmentShader: string,
//     options?: Partial<IModelInitializationOptions>,
//   ) {
//     const { createModel, createAttribute, createBuffer } = this.engine;
//     this.shaderModuleService.registerModule(shaderModuleName, {
//       vs: quadVS,
//       fs: fragmentShader,
//     });

//     const { vs = '', fs = '', uniforms } = this.shaderModuleService.getModule(shaderModuleName);

//     return createModel({
//       vs: this.shaderModuleService.transpile(vs, ShaderType.Vertex, this.engine.shaderLanguage),
//       fs: this.shaderModuleService.transpile(fs, ShaderType.Fragment, this.engine.shaderLanguage),
//       attributes: {
//         // 使用一个全屏三角形，相比 Quad 顶点数目更少
//         a_Position: createAttribute({
//           buffer: createBuffer({
//             data: [-4, -4, 4, -4, 0, 4],
//             type: gl.FLOAT,
//           }),
//           size: 2,
//         }),
//       },
//       uniforms: {
//         ...uniforms,
//       },
//       depth: {
//         enable: false,
//       },
//       count: 3,
//       ...options,
//     });
//   }
// }
