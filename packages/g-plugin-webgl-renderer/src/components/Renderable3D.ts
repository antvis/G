import { Component } from '@antv/g';

export class Renderable3D extends Component {
  static tag = 'c-renderable-3d';

  pickingId: number;

  encodedPickingColor: [number, number, number];

  batchId: number;
}
