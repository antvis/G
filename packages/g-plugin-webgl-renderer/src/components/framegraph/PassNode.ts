import { FrameGraphEngine } from '../../FrameGraphEngine';
import { FrameGraphHandle } from './FrameGraphHandle';
import { VirtualResource } from './VirtualResource';

export class PassNode {
  public name: string;
  /**
   * count resources that have a reference to this pass node
   */
  public refCount = 0;

  /**
   * set by FG system
   */
  public hasSideEffect = false;

  /**
   * during FG's compile, create before executing
   */
  public devirtualize: VirtualResource[] = [];

  /**
   * during FG's compile, destroy after executing
   */
  public destroy: VirtualResource[] = [];

  public reads: FrameGraphHandle[] = [];

  public writes: FrameGraphHandle[] = [];

  public read(handle: FrameGraphHandle): FrameGraphHandle {
    if (!this.reads.find((h) => h.index === handle.index)) {
      this.reads.push(handle);
    }
    return handle;
  }

  public sample(handle: FrameGraphHandle) {
    this.read(handle);
    // TODO: 记录在 this.samples 中
    return handle;
  }

  public write(fg: FrameGraphEngine, handle: FrameGraphHandle): FrameGraphHandle {
    const existed = this.writes.find((h) => h.index === handle.index);
    if (existed) {
      return handle;
    }

    const node = fg.getResourceNode(handle);

    node.resource.version++;

    if (node.resource.imported) {
      this.hasSideEffect = true;
    }

    const r = fg.createResourceNode(node.resource);
    const newNode = fg.getResourceNode(r);

    newNode.writer = this;

    this.writes.push(r);
    return r;
  }
}
