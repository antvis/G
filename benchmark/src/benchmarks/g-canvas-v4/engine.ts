import { Engine } from '../../base';
import { Canvas } from '@antv/g-canvas-v4';

export class GCanvasV4Engine extends Engine<Canvas> {
  name = 'g-canvas-v4';

  async initialize(container: HTMLElement): Promise<void> {
    // 获取容器尺寸
    const { width, height } = container.getBoundingClientRect();

    // 初始化画布
    const canvas = new Canvas({
      container: container,
      width,
      height,
    });

    this.app = canvas;
  }

  async destroy(): Promise<void> {
    this.app.destroy();
  }
}
