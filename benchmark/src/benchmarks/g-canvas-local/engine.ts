import { Engine } from '../../base';
// 使用路径别名引用本地源码
import { Canvas } from '@antv/g-local';
import { Renderer } from '@antv/g-canvas-local';

export class GCanvasLocalEngine extends Engine<Canvas> {
  name = 'g-canvas-local';

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
