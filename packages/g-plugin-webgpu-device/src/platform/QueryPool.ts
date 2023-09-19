import type { QueryPool, QueryPoolType } from '@antv/g-plugin-device-renderer';
import { ResourceType } from '@antv/g-plugin-device-renderer';
import type { IDevice_WebGPU } from './interfaces';
import { ResourceBase_WebGPU } from './ResourceBase';
import { translateQueryPoolType } from './utils';

export class QueryPool_WebGPU extends ResourceBase_WebGPU implements QueryPool {
  type: ResourceType.QueryPool = ResourceType.QueryPool;

  querySet: GPUQuerySet;
  resolveBuffer: GPUBuffer;
  cpuBuffer: GPUBuffer;
  results: BigUint64Array | null;

  constructor({
    id,
    device,
    descriptor,
  }: {
    id: number;
    device: IDevice_WebGPU;
    descriptor: {
      elemCount: number;
      type: QueryPoolType;
    };
  }) {
    super({ id, device });
    const { elemCount, type } = descriptor;

    this.querySet = this.device.device.createQuerySet({
      type: translateQueryPoolType(type),
      count: elemCount,
    });

    this.resolveBuffer = this.device.device.createBuffer({
      size: elemCount * 8,
      usage: GPUBufferUsage.QUERY_RESOLVE | GPUBufferUsage.COPY_SRC,
    });
    this.cpuBuffer = this.device.device.createBuffer({
      size: elemCount * 8,
      usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
    });
    this.results = null;
  }

  queryResultOcclusion(dstOffs: number): boolean | null {
    if (this.results === null) return null;
    return this.results[dstOffs] !== BigInt(0);
  }

  destroy(): void {
    super.destroy();
    this.querySet.destroy();
    this.resolveBuffer.destroy();
    this.cpuBuffer.destroy();
  }
}
