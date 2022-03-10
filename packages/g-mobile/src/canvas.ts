import type { CanvasConfig as BaseConfig } from '@antv/g';
import { Canvas } from '@antv/g';
import CanvasElement from './canvas-element';

export interface CanvasConfig extends BaseConfig {
  context: CanvasRenderingContext2D;
}

class MobileCanvas extends Canvas {
  constructor(config: CanvasConfig) {
    const { context } = config;
    const canvas = CanvasElement.create(context);
    super({
      ...config,
      canvas,
    });
  }
}

export default MobileCanvas;
