import type { Rectangle } from '@antv/g';

export interface DownloadImageOptions {
  dataURL: string;
  name?: string;
}

export interface CanvasOptions {
  clippingRegion: Rectangle;
  beforeDrawImage: (context: CanvasRenderingContext2D) => void;
  afterDrawImage: (context: CanvasRenderingContext2D) => void;
}
