import type { Color, Format } from '../platform';

export class RGRenderTargetDescription {
  width = 0;
  height = 0;
  sampleCount = 0;

  colorClearColor: Readonly<Color> | 'load' = 'load';
  depthClearValue: number | 'load' = 'load';
  stencilClearValue: number | 'load' = 'load';

  constructor(public pixelFormat: Format) {}

  /**
   * Set the dimensions of a render target description.
   */
  setDimensions(width: number, height: number, sampleCount: number): void {
    this.width = width;
    this.height = height;
    this.sampleCount = sampleCount;
  }

  copyDimensions(desc: Readonly<RGRenderTargetDescription>): void {
    this.width = desc.width;
    this.height = desc.height;
    this.sampleCount = desc.sampleCount;
  }
}
