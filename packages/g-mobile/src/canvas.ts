import type { CanvasConfig as BaseConfig } from '@antv/g';
import { Canvas } from '@antv/g';
import { normContext } from './dom';
import CanvasElement from './canvas-element';

export interface CanvasConfig extends BaseConfig {
  context?: CanvasRenderingContext2D;
  devicePixelRatio: number;
}

class MobileCanvas extends Canvas {
  constructor(config: CanvasConfig) {
    const { context, devicePixelRatio } = config;
    const normalContext = normContext(context, devicePixelRatio);

    const canvas = CanvasElement.create(normalContext);
    super({
      ...config,
      canvas,
      devicePixelRatio,
    });
  }
}

export default MobileCanvas;
