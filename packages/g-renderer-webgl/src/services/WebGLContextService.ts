import { Camera, CanvasConfig, ContextService } from '@antv/g';
import { inject, injectable } from 'inversify';
import { isString } from '@antv/util';
import { IView, RenderingEngine } from './renderer';
import { ShaderModuleService } from './shader-module';
import { setDOMSize } from '../utils/dom';
import { View } from '../View';

export interface WebGLRenderingContext {
  engine: RenderingEngine;
  camera: Camera;
  view: IView;
}

@injectable()
export class WebGLContextService implements ContextService<WebGLRenderingContext> {
  private $container: HTMLElement | null;
  private context: WebGLRenderingContext | null;

  @inject(ShaderModuleService)
  private shaderModule: ShaderModuleService;

  @inject(RenderingEngine)
  private engine: RenderingEngine;

  @inject(Camera)
  private camera: Camera;

  @inject(View)
  private view: View;

  @inject(CanvasConfig)
  private canvasConfig: CanvasConfig;

  async init() {
    this.shaderModule.registerBuiltinModules();

    const { container, width, height } = this.canvasConfig;

    // create container
    this.$container = isString(container) ? document.getElementById(container) : container;
    if (this.$container) {
      // create canvas
      const $canvas = document.createElement('canvas');
      this.$container.appendChild($canvas);

      const dpr = this.getDPR();

      await this.engine.init({
        canvas: $canvas,
        antialias: false,
        dpr,
      });

      // this.camera.setPosition(0, 0, 1).setOrthographic(
      //   (width / -2) * dpr,
      //   (width / 2) * dpr,
      //   (height / 2) * dpr,
      //   (height / -2) * dpr,
      //   // 0,
      //   // width * dpr,
      //   // height * dpr,
      //   // 0,
      //   0.5,
      //   2
      // );
      // this.camera.setViewOffset(2, 2, 0, 0, 2, 2);

      this.view.setViewport({
        x: 0,
        y: 0,
        width: width * dpr,
        height: height * dpr,
      });

      this.context = {
        engine: this.engine,
        camera: this.camera,
        view: this.view,
      };

      this.resize(width, height);
    }
  }

  getDomElement() {
    return this.engine.getCanvas();
  }

  getContext() {
    return this.context;
  }

  getBoundingClientRect() {
    return this.$container?.getBoundingClientRect();
  }

  destroy() {
    this.shaderModule.destroy();
    this.engine.destroy();
    if (this.$container) {
      this.$container?.removeChild(this.engine.getCanvas());
    }
  }

  resize(width: number, height: number) {
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

  getDPR() {
    let dpr = window.devicePixelRatio || 1;
    dpr = dpr >= 1 ? Math.ceil(dpr) : 1;
    return dpr;
  }

  applyCursorStyle(cursor: string) {
    if (this.$container) {
      this.$container.style.cursor = cursor;
    }
  }
}
