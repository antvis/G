import { Color, Format } from '../platform';

export class RGRenderTargetDescription {
  width: number = 0;
  height: number = 0;
  sampleCount: number = 0;

  colorClearColor: Readonly<Color> | 'load' = 'load';
  depthClearValue: number | 'load' = 'load';
  stencilClearValue: number | 'load' = 'load';

  pixelFormat: Format;

  constructor(pixelFormat: Format) {
    this.pixelFormat = pixelFormat;
  }

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
