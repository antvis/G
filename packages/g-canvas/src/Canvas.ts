import { Canvas as BaseCanvas } from '@antv/g-core';
import { module } from '.';

export class Canvas extends BaseCanvas {
  loadModule() {
    this.container.load(module);
  }
}
