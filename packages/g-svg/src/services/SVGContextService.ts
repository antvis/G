import { CanvasConfig, ContextService } from '@antv/g-core';
import { inject, injectable } from 'inversify';
import { isString } from '@antv/util';
import { createSVGElement } from '../utils/dom';
// import { setDOMSize } from '../utils/dom';

@injectable()
export class SVGContextService implements ContextService<SVGElement> {
  private $container: HTMLElement | null;
  private $namespace: SVGElement | null;

  @inject(CanvasConfig)
  private canvasConfig: CanvasConfig;

  async init() {
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
  }

  getContext() {
    return this.$namespace;
  }

  async destroy() {
    // destroy context
    if (this.$container && this.$namespace) {
      this.$container.removeChild(this.$namespace);
    }
  }

  resize(width: number, height: number) {}
}
