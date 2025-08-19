import { Engine } from '../../base';
import { init, type ZRenderType } from 'zrender';

export class ZRenderEngine extends Engine<ZRenderType> {
  name = 'zrender';

  async initialize(container: HTMLElement): Promise<void> {
    this.app = init(container);
  }

  async destroy(): Promise<void> {
    this.app.dispose();
  }
}
