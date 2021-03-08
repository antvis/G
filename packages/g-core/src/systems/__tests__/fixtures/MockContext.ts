import { DefaultContextService } from '@antv/g-core';
import { injectable } from 'inversify';

@injectable()
export class MockContext extends DefaultContextService<{}> {
  public async init() {
    // const { container } = this.canvasConfig;

    // // create container
    // this.$container = isString(container) ? document.getElementById(container) : container;
    // if (this.$container) {
    //   // create canvas
    //   const $canvas = document.createElement('canvas');
    //   const context = $canvas.getContext('2d');
    //   this.$container.appendChild($canvas);
    //   this.$canvas = $canvas;
    //   return context;
    // }

    return null;
  }

  public async destroy() {
    // TODO: destroy context
  }

  public resize(width: number, height: number) {}
}
