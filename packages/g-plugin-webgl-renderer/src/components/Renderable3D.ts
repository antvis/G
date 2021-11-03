import { Component } from '@antv/g-ecs';

export class Renderable3D extends Component {
  static tag = 'c-renderable-3d';

  pickingId: number;

  encodedPickingColor: [number, number, number];

  batchId: number;
}
