import { inject, injectable } from 'inversify';
import { IFramebuffer, RenderingEngine } from '../../services/renderer';
import { gl } from '../../services/renderer/constants';
import { ResourceEntry } from './ResourceEntry';

@injectable()
export class ResourcePool {
  @inject(RenderingEngine)
  private readonly engine: RenderingEngine;

  // 资源池
  private resourcePool: Record<string, IFramebuffer> = {};

  /**
   * 负责实例化虚拟资源，通过引擎服务
   * @param resource 虚拟资源
   */
  public getOrCreateResource(resource: ResourceEntry): IFramebuffer {
    if (!this.resourcePool[resource.name]) {
      const { width, height, usage } = resource.descriptor;
      this.resourcePool[resource.name] = this.engine.createFramebuffer({
        color: this.engine.createTexture2D({
          width,
          height,
          wrapS: gl.CLAMP_TO_EDGE,
          wrapT: gl.CLAMP_TO_EDGE,
          usage,
        }),
      });
    }

    return this.resourcePool[resource.name];
  }

  public clean() {
    this.resourcePool = {};
  }
}
