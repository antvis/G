import { Engine } from '../../base';
import { Canvas } from '@antv/g';
import { Renderer } from '@antv/g-canvas';

export class GCanvasEngine extends Engine<Canvas> {
  name = 'g-canvas';

  async initialize(container: HTMLElement): Promise<void> {
    // 获取容器尺寸
    const { width, height } = container.getBoundingClientRect();

    // 初始化画布
    const canvas = new Canvas({
      container,
      width,
      height,
      renderer: new Renderer(),
    });

    await canvas.ready;

    this.app = canvas;
  }

  async destroy(): Promise<void> {
    this.app.destroy();
  }
}
