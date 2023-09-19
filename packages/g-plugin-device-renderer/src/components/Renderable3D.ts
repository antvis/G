import type { Instanced } from '../drawcalls';

export class Renderable3D {
  static tag = 'c-renderable-3d';

  pickingId: number;

  encodedPickingColor: [number, number, number];

  drawcalls: Instanced[] = [];
}
