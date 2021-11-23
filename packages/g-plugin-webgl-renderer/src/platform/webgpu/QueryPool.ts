import { QueryPool, QueryPoolType, ResourceType } from '../interfaces';
import { IDevice_WebGPU } from './interfaces';
import { ResourceBase_WebGPU } from './ResourceBase';
import { translateQueryPoolType } from './utils';

export class QueryPool_WebGPU extends ResourceBase_WebGPU implements QueryPool {
  type: ResourceType.QueryPool = ResourceType.QueryPool;

  querySet: GPUQuerySet;

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
  }

  queryResultOcclusion(dstOffs: number): boolean | null {
    return true;
  }
}
