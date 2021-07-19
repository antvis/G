import { CanvasConfig, ContextService } from '@antv/g';
import { inject, injectable } from 'inversify';
import { isString } from '@antv/util';
import { createSVGElement } from './utils/dom';

@injectable()
export class SVGContextService implements ContextService<SVGElement> {
  private $container: HTMLElement | null;
  private $namespace: SVGElement;
  private dpr: number;

  @inject(CanvasConfig)
  private canvasConfig: CanvasConfig;

  init() {
    const { container } = this.canvasConfig;

    // create container
    this.$container = isString(container) ? document.getElementById(container) : container;
    if (this.$container) {
      const $namespace = createSVGElement('svg');
      $namespace.setAttribute('width', `${this.canvasConfig.width}`);
      $namespace.setAttribute('height', `${this.canvasConfig.height}`);

      this.$container.appendChild($namespace);

      this.$namespace = $namespace;
    }

    let dpr = window.devicePixelRatio || 1;
    dpr = dpr >= 1 ? Math.ceil(dpr) : 1;
    this.dpr = dpr;
  }

  // @ts-ignore
  getDomElement() {
    return this.$namespace;
  }

  getContext() {
    return this.$namespace;
  }

  getDPR() {
    return this.dpr;
  }

  getBoundingClientRect() {
    return this.$namespace && this.$namespace.getBoundingClientRect();
  }

  destroy() {
    // destroy context
    if (this.$container && this.$namespace) {
      this.$container.removeChild(this.$namespace);
    }
  }

  resize(width: number, height: number) {
    if (this.$namespace) {
      this.$namespace.setAttribute('width', `${width}`);
      this.$namespace.setAttribute('height', `${height}`);
    }
  }

  applyCursorStyle(cursor: string) {
    if (this.$container) {
      this.$container.style.cursor = cursor;
    }
  }
}
