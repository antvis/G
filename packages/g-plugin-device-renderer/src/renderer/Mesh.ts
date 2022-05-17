import { injectable } from 'mana-syringe';
import { Batch } from './Batch';
import { ShapeRenderer } from '../tokens';
import { MeshMesh } from '../meshes';
import { Shape } from '@antv/g';

@injectable({
  token: [{ token: ShapeRenderer, named: Shape.MESH }],
})
export class MeshRenderer extends Batch {
  meshes = [MeshMesh];
}
