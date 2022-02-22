import { Instanced } from '../meshes';

export class Renderable3D {
  static tag = 'c-renderable-3d';

  pickingId: number;

  encodedPickingColor: [number, number, number];

  meshes: Instanced[] = [];
}
