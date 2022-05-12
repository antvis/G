/**
 * @see https://github.com/gpuweb/cts/blob/main/src/webgpu/constants.ts
 */

enum GPUTextureUsage {
  COPY_SRC = 0x01,
  COPY_DST = 0x02,
  TEXTURE_BINDING = 0x04,
  // SAMPLED= 0x04,
  STORAGE_BINDING = 0x08,
  STORAGE = 0x08,
  RENDER_ATTACHMENT = 0x10,
}

// @see https://www.w3.org/TR/webgpu/#typedefdef-gpumapmodeflags
enum GPUMapMode {
  READ = 0x0001,
  WRITE = 0x0002,
}

export { GPUTextureUsage, GPUMapMode };
