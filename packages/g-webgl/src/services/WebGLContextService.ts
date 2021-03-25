import { DefaultContextService } from '@antv/g-core';
import { inject, injectable } from 'inversify';
import isString from 'lodash-es/isString';
import { Camera } from '../Camera';
import { IView, RenderingEngine } from './renderer';
import { ShaderModuleService } from './shader-module';
import { setDOMSize } from '../utils/dom';
import { View } from '../View';

export interface RenderingContext {
  engine: RenderingEngine;
  camera: Camera;
  view: IView;
}

@injectable()
export class WebGLContextService extends DefaultContextService<RenderingContext> {
  private $container: HTMLElement | null;

  @inject(ShaderModuleService)
  private shaderModule: ShaderModuleService;

  @inject(RenderingEngine)
  private engine: RenderingEngine;

  @inject(Camera)
  private camera: Camera;

  @inject(View)
  private view: View;

  public async init() {
    this.shaderModule.registerBuiltinModules();

    const { container, width, height } = this.canvasConfig;

    // create container
    this.$container = isString(container) ? document.getElementById(container) : container;
    if (this.$container) {
      // create canvas
      const $canvas = document.createElement('canvas');
      this.$container.appendChild($canvas);

      await this.engine.init({
        canvas: $canvas,
        antialias: false,
      });

      this.camera.setPosition(0, 0, 2).setOrthographic(-0.5, 0.5, -0.5, 0.5, 0.5, 10);

      const dpr = this.getDPR();
      this.view.setViewport({
        x: 0,
        y: 0,
        width: width * dpr,
        height: height * dpr,
      });

      return {
        engine: this.engine,
        camera: this.camera,
        view: this.view,
      };
    }

    return null;
  }

  public destroy() {
    this.shaderModule.destroy();
  }

  public resize(width: number, height: number) {
    const $canvas = this.engine.getCanvas();
    if ($canvas) {
      const dpr = this.getDPR();

      // set canvas width & height
      $canvas.width = dpr * width;
      $canvas.height = dpr * height;

      // set CSS style width & height
      setDOMSize($canvas, width, height);
    }
  }

  private getDPR() {
    let dpr = window.devicePixelRatio || 1;
    dpr = dpr >= 1 ? Math.ceil(dpr) : 1;
    return dpr;
  }
}
