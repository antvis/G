import { inject, injectable } from 'inversify';
import copyFrag from '../services/shader-module/shaders/webgl.copy.frag.glsl';
import copyVert from '../services/shader-module/shaders/webgl.copy.vert.glsl';
import copyFragWebGPU from '../services/shader-module/shaders/webgpu.copy.frag.glsl';
import copyVertWebGPU from '../services/shader-module/shaders/webgpu.copy.vert.glsl';
import { FrameGraphHandle } from '../components/framegraph/FrameGraphHandle';
import { FrameGraphPass } from '../components/framegraph/FrameGraphPass';
import { PassNode } from '../components/framegraph/PassNode';
import { ResourcePool } from '../components/framegraph/ResourcePool';
import { IModel, RenderingEngine } from '../services/renderer';
import { gl } from '../services/renderer/constants';
import { FrameGraphEngine, IRenderPass } from '../FrameGraphEngine';
import { RenderPass, RenderPassData } from './RenderPass';
import { View } from '../View';

export interface CopyPassData {
  input: FrameGraphHandle;
  output: FrameGraphHandle;
}

@injectable()
export class CopyPass implements IRenderPass<CopyPassData> {
  static IDENTIFIER = 'Copy Pass';

  @inject(RenderingEngine)
  private readonly engine: RenderingEngine;

  @inject(ResourcePool)
  private readonly resourcePool: ResourcePool;

  @inject(View)
  private view: View;

  private model: IModel | undefined;

  setup = (fg: FrameGraphEngine, passNode: PassNode, pass: FrameGraphPass<CopyPassData>): void => {
    const renderPass = fg.getPass<RenderPassData>(RenderPass.IDENTIFIER);
    if (renderPass) {
      const output = fg.createRenderTarget(passNode, 'render to screen', {
        width: 1,
        height: 1,
      });

      pass.data = {
        input: passNode.read(renderPass.data.output),
        output: passNode.write(fg, output),
      };
    }
  };

  execute = (fg: FrameGraphEngine, pass: FrameGraphPass<CopyPassData>) => {
    const { createModel, createAttribute, createBuffer } = this.engine;
    const viewport = this.view.getViewport();

    if (!this.model) {
      const model = createModel({
        vs: this.engine.supportWebGPU ? copyVertWebGPU : copyVert,
        fs: this.engine.supportWebGPU ? copyFragWebGPU : copyFrag,
        attributes: {
          // rendering a fullscreen triangle instead of quad
          // @see https://www.saschawillems.de/blog/2016/08/13/vulkan-tutorial-on-rendering-a-fullscreen-quad-without-buffers/
          a_Position: createAttribute({
            buffer: createBuffer({
              data: [-4, -4, 4, -4, 0, 4],
              type: gl.FLOAT,
            }),
            size: 2,
            arrayStride: 2 * 4,
            stepMode: 'vertex',
            attributes: [
              {
                shaderLocation: 0,
                offset: 0,
                format: 'float2',
              },
            ],
          }),
        },
        uniforms: {
          // @ts-ignore
          u_Texture: null,
        },
        depth: {
          enable: false,
        },
        count: 3,
        // blend: {
        //   // copy pass 需要混合
        //   enable: true,
        // },
      });
      this.model = model;
    }

    const resourceNode = fg.getResourceNode(pass.data.input);
    const framebuffer = this.resourcePool.getOrCreateResource(resourceNode.resource);

    this.engine.useFramebuffer(
      {
        framebuffer: null,
        viewport,
      },
      () => {
        this.engine.clear({
          framebuffer: null,
          color: [0, 0, 0, 0],
          depth: 1,
          stencil: 0,
        });
        this.model!.draw({
          uniforms: {
            u_Texture: framebuffer,
          },
        });
      }
    );
  };

  tearDown = () => {
    this.model = undefined;
  };
}
