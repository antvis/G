import { injectable } from 'mana-syringe';
import { Batch } from './Batch';
import { ShapeRenderer } from '../tokens';
import { MeshMesh } from '../meshes';
import { Mesh } from '../Mesh';

@injectable({
  token: [{ token: ShapeRenderer, named: Mesh.tag }],
})
export class MeshRenderer extends Batch {
  meshes = [MeshMesh];
}
