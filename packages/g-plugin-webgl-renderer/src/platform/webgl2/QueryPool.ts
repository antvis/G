import { QueryPool, QueryPoolType, ResourceType } from '../interfaces';
import { nArray } from '../utils';
import { Device_GL } from './Device';
import { ResourceBase_GL } from './ResourceBase';
import { isWebGL2, translateQueryPoolType } from './utils';

export class QueryPool_GL extends ResourceBase_GL implements QueryPool {
  type: ResourceType.QueryPool = ResourceType.QueryPool;

  gl_query_type: number;
  gl_query: WebGLQuery[];

  constructor({
    id,
    device,
    descriptor,
  }: {
    id: number;
    device: Device_GL;
    descriptor: {
      elemCount: number;
      type: QueryPoolType;
    };
  }) {
    super({ id, device });

    const gl = this.device.gl;

    if (isWebGL2(gl)) {
      const { elemCount, type } = descriptor;
      this.gl_query = nArray(elemCount, () => this.device.ensureResourceExists(gl.createQuery()));
      this.gl_query_type = translateQueryPoolType(type);
    }
  }

  queryResultOcclusion(dstOffs: number): boolean | null {
    const gl = this.device.gl;
    if (isWebGL2(gl)) {
      const gl_query = this.gl_query[dstOffs];

      if (!gl.getQueryParameter(gl_query, gl.QUERY_RESULT_AVAILABLE)) {
        return null;
      }
      return !!gl.getQueryParameter(gl_query, gl.QUERY_RESULT);
    }
    return null;
  }

  destroy() {
    super.destroy();
    const gl = this.device.gl;
    if (isWebGL2(gl)) {
      for (let i = 0; i < this.gl_query.length; i++) {
        gl.deleteQuery(this.gl_query[i]);
      }
    }
  }
}
