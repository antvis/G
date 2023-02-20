// Hack for now until browsers implement compositingAlphaMode
// https://bugs.chromium.org/p/chromium/issues/detail?id=1241373
export class FullscreenAlphaClear {
  private shaderModule: GPUShaderModule;
  private pipeline: GPURenderPipeline;

  private shaderText = `
struct VertexOutput {
  @builtin(position) pos: vec4<f32>;
};

@vertex
fn vs(
  @builtin(vertex_index) index: u32
) -> VertexOutput {
  var out: VertexOutput;
  out.pos.x = select(-1.0, 3.0, index == 1u);
  out.pos.y = select(-1.0, 3.0, index == 2u);
  out.pos.z = 1.0;
  out.pos.w = 1.0;
  return out;
}

struct FragmentOutput { @location(0) color: vec4<f32>; };

@ stage(fragment)
fn fs() -> FragmentOutput {
  return FragmentOutput(vec4<f32>(1.0, 0.0, 1.0, 1.0));
}
`;

  constructor(device: GPUDevice) {
    const format: GPUTextureFormat = 'bgra8unorm';
    this.shaderModule = device.createShaderModule({ code: this.shaderText });
    this.pipeline = device.createRenderPipeline({
      vertex: { module: this.shaderModule, entryPoint: 'vs' },
      fragment: {
        module: this.shaderModule,
        entryPoint: 'fs',
        targets: [{ format, writeMask: 0x08 }],
      },
    });
  }

  render(device: GPUDevice, onscreenTexture: GPUTextureView): void {
    const encoder = device.createCommandEncoder();
    const renderPass = encoder.beginRenderPass({
      colorAttachments: [
        {
          view: onscreenTexture,
          loadOp: 'load',
          loadValue: 'load',
          storeOp: 'store',
        },
      ],
    });
    renderPass.setPipeline(this.pipeline);
    renderPass.draw(3);
    renderPass.end();
    device.queue.submit([encoder.finish()]);
  }
}
