import type { CanvasConfig as BaseConfig } from '@antv/g';
import { Canvas } from '@antv/g';
import { normContext } from './utils';
import CanvasElement from './canvas-element';

export interface CanvasConfig extends BaseConfig {
  context?: RenderingContext;
  devicePixelRatio: number;
}

class MobileCanvas extends Canvas {
  constructor(config: CanvasConfig) {
    const { context, devicePixelRatio } = config;
    let canvas;

    if (context) {
      const normalContext = normContext(context, devicePixelRatio);
      canvas = CanvasElement.create(normalContext);
    }

    super({
      ...config,
      canvas,
      devicePixelRatio,
    });
  }
}

export default MobileCanvas;
