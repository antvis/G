import { DisplayObject } from '@antv/g';
import { inject, injectable } from 'inversify';
import { FrameGraphHandle, TextureDescriptor } from './components/framegraph/FrameGraphHandle';
import { FrameGraphPass } from './components/framegraph/FrameGraphPass';
import { PassNode } from './components/framegraph/PassNode';
import { ResourceEntry } from './components/framegraph/ResourceEntry';
import { ResourceNode } from './components/framegraph/ResourceNode';
import { RenderingEngine } from './services/renderer';

export const RenderPassFactory = Symbol('RenderPassFactory');
export const IRenderPass = Symbol('IRenderPass');
export interface IRenderPass<RenderPassData> {
  /**
   * 只声明虚拟资源及其读写关系，不进行具体资源 Texture | Framebuffer 的实例化
   */
  setup?(fg: FrameGraphEngine, passNode: PassNode, pass: FrameGraphPass<RenderPassData>): void;

  /**
   * 调用渲染引擎服务完成虚拟资源的实例化
   */
  execute(fg: FrameGraphEngine, pass: FrameGraphPass<RenderPassData>, displayObjects: DisplayObject<any>[]): void;

  /**
   * 结束后清理
   */
  tearDown?(): void;
}

/**
 * ported from FrameGraph implemented by SakuraRender
 * @see https://zhuanlan.zhihu.com/p/98572442
 * @see https://github.com/SaeruHikari/Sakura/blob/RenderGraph/SakuraCore/Source/Framework/GraphicTypes/FrameGraph/SakuraFrameGraph.cpp
 */
@injectable()
export class FrameGraphEngine {
  public passNodes: PassNode[] = [];

  public resourceNodes: ResourceNode[] = [];

  public frameGraphPasses: Array<FrameGraphPass<any>> = [];

  @inject(RenderingEngine)
  private readonly engine: RenderingEngine;

  public tearDown() {
    this.frameGraphPasses.forEach((pass) => {
      if (pass.tearDown) {
        pass.tearDown();
      }
    });
    this.reset();
  }

  public addPass<PassData>(
    name: string,
    setup: (fg: FrameGraphEngine, passNode: PassNode, pass: FrameGraphPass<PassData>) => void,
    execute: (fg: FrameGraphEngine, pass: FrameGraphPass<PassData>) => void,
    tearDown?: () => void
  ) {
    const frameGraphPass = new FrameGraphPass<PassData>();
    frameGraphPass.execute = execute;
    if (tearDown) {
      frameGraphPass.tearDown = tearDown;
    }
    frameGraphPass.name = name;

    const passNode = new PassNode();
    passNode.name = name;
    this.passNodes.push(passNode);

    this.frameGraphPasses.push(frameGraphPass);

    setup(this, passNode, frameGraphPass);

    return frameGraphPass;
  }

  public getPass<T>(name: string): FrameGraphPass<T> | undefined {
    return this.frameGraphPasses.find((p) => p.name === name);
  }

  public compile() {
    for (const pass of this.passNodes) {
      pass.refCount = pass.writes.length + (pass.hasSideEffect ? 1 : 0);

      pass.reads.forEach((handle) => {
        this.resourceNodes[handle.index].readerCount++;
      });
    }

    const stack: ResourceNode[] = [];
    for (const node of this.resourceNodes) {
      if (node.readerCount === 0) {
        stack.push(node);
      }
    }
    while (stack.length) {
      const pNode = stack.pop();
      const writer = pNode && pNode.writer;
      if (writer) {
        if (--writer.refCount === 0) {
          // this pass is culled
          // assert(!writer->hasSideEffect);
          for (const resource of writer.reads) {
            const r = this.resourceNodes[resource.index];
            if (--r.readerCount === 0) {
              stack.push(r);
            }
          }
        }
      }
    }

    // update the final reference counts
    this.resourceNodes.forEach((node) => {
      node.resource.refs += node.readerCount;
    });

    for (const pass of this.passNodes) {
      if (!pass.refCount) {
        continue;
      }
      for (const resource of pass.reads) {
        const pResource = this.resourceNodes[resource.index].resource;
        pResource.first = pResource.first ? pResource.first : pass;
        pResource.last = pass;
      }
      for (const resource of pass.writes) {
        const pResource = this.resourceNodes[resource.index].resource;
        pResource.first = pResource.first ? pResource.first : pass;
        pResource.last = pass;
      }
    }

    for (let priority = 0; priority < 2; priority++) {
      for (const resoureNode of this.resourceNodes) {
        const resource = resoureNode.resource;
        if (resource.priority === priority && resource.refs) {
          const pFirst = resource.first;
          const pLast = resource.last;
          if (pFirst && pLast) {
            pFirst.devirtualize.push(resource);
            pLast.destroy.push(resource);
          }
        }
      }
    }
  }

  public executePassNodes() {
    for (let index = 0; index < this.passNodes.length; index++) {
      const node = this.passNodes[index];
      if (node.refCount) {
        for (const resource of node.devirtualize) {
          resource.preExecuteDevirtualize(this.engine);
        }

        for (const resource of node.destroy) {
          resource.preExecuteDestroy(this.engine);
        }

        this.frameGraphPasses[index].execute(this, this.frameGraphPasses[index]);

        for (const resource of node.devirtualize) {
          resource.postExecuteDevirtualize(this.engine);
        }

        for (const resource of node.destroy) {
          resource.postExecuteDestroy(this.engine);
        }
      }
    }
    this.reset();
  }

  public reset() {
    this.passNodes = [];
    this.resourceNodes = [];
    this.frameGraphPasses = [];
  }

  public getResourceNode(r: FrameGraphHandle) {
    return this.resourceNodes[r.index];
  }

  public createResourceNode(resourceEntry: ResourceEntry) {
    const resourceNode = new ResourceNode();
    resourceNode.resource = resourceEntry;
    resourceNode.version = resourceEntry.version;

    this.resourceNodes.push(resourceNode);

    const fgh = new FrameGraphHandle();
    fgh.index = this.resourceNodes.length - 1;

    return fgh;
  }

  public createTexture(passNode: PassNode, name: string, descriptor: TextureDescriptor) {
    const resource = new ResourceEntry();
    resource.name = name;
    resource.descriptor = descriptor;
    return this.createResourceNode(resource);
  }

  public createRenderTarget(passNode: PassNode, name: string, descriptor: TextureDescriptor) {
    const resource = new ResourceEntry();
    resource.name = name;
    resource.descriptor = descriptor;
    return this.createResourceNode(resource);
  }

  public present(input: FrameGraphHandle) {
    this.addPass<any>(
      'Present',
      (fg, passNode) => {
        passNode.read(input);
        passNode.hasSideEffect = true;
      },
      () => {
        // 不需要执行
      }
    );
  }
}
