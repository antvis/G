import { injectable, Shape } from '@antv/g-lite';
import { MeshMesh } from '../meshes';
import { ShapeRenderer } from '../tokens';
import { Batch } from './Batch';

@injectable({
  token: [{ token: ShapeRenderer, named: Shape.MESH }],
})
export class MeshRenderer extends Batch {
  meshes = [MeshMesh];
}
