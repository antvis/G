import { IFramebuffer } from '../../services/renderer';
import { TextureDescriptor } from './FrameGraphHandle';
import { VirtualResource } from './VirtualResource';

export class ResourceEntry extends VirtualResource {
  public version: number = 0;

  public refs: number = 0;

  public name: string;

  public imported: boolean;

  public priority: number;

  public discardStart = true;

  public discardEnd = false;

  public descriptor: TextureDescriptor;

  public resource: IFramebuffer;

  /**
   * Lifecycles in FG's execute
   */
  public preExecuteDestroy(): void {
    this.discardEnd = true;
  }

  public postExecuteDestroy(): void {
    if (!this.imported) {
      // TODO: 不需要每一帧结束后都销毁资源，可以增加临时资源标志
      // this.resource.destroy();
    }
  }

  public postExecuteDevirtualize(): void {
    this.discardStart = false;
  }

  public preExecuteDevirtualize() {
    if (!this.imported) {
      //
    }
  }
}
