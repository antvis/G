import type { Canvas, DataURLOptions } from '@antv/g';

export interface ExporterOptions {
  canvas: Canvas;
  defaultFilename?: string;
}

export interface DownloadImageOptions extends DataURLOptions {
  name: string;
}
