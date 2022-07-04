import { CanvasConfig, ContextService, inject, singleton } from '@antv/g';
import { isMobile } from './util';

const CLASSNAME_PREFIX = 'g-a11y-screen-reader';

const KEY_CODE_TAB = 9;
const DIV_TOUCH_SIZE = 100;
const DIV_TOUCH_POS_X = 0;
const DIV_TOUCH_POS_Y = 0;
const DIV_TOUCH_ZINDEX = 2;

const DIV_HOOK_SIZE = 1;
const DIV_HOOK_POS_X = -1000;
const DIV_HOOK_POS_Y = -1000;
const DIV_HOOK_ZINDEX = 2;

@singleton()
export class AriaManager {
  @inject(ContextService)
  private contextService: ContextService<unknown>;

  @inject(CanvasConfig)
  private canvasConfig: CanvasConfig;

  private $container: HTMLDivElement;

  private isActive = false;

  private isMobileAccessibility = false;

  /**
   * Button element for handling touch hooks.
   */
  private hookDiv: HTMLElement;

  private onKeyDown = (e: KeyboardEvent) => {
    if (e.keyCode !== KEY_CODE_TAB) {
      return;
    }

    this.start();
  };

  private onMouseMove = (e: MouseEvent) => {
    if (e.movementX === 0 && e.movementY === 0) {
      return;
    }

    this.stop();
  };

  private createOverlay() {
    const { document: doc } = this.canvasConfig;
    const $domElement = this.contextService.getDomElement() as HTMLCanvasElement;
    const $parentElement = $domElement.parentNode;

    if ($parentElement) {
      const div = (doc || document).createElement('div');

      div.style.width = `${DIV_TOUCH_SIZE}px`;
      div.style.height = `${DIV_TOUCH_SIZE}px`;
      div.style.position = 'absolute';
      div.style.top = `${DIV_TOUCH_POS_X}px`;
      div.style.left = `${DIV_TOUCH_POS_Y}px`;
      div.style.zIndex = DIV_TOUCH_ZINDEX.toString();

      this.$container = div;
      this.$container.id = `${CLASSNAME_PREFIX}-mask`;
      $parentElement.appendChild(this.$container);
    }
  }

  private start() {
    if (this.isActive) {
      return;
    }

    this.isActive = true;

    globalThis.document.addEventListener('mousemove', this.onMouseMove, true);
    globalThis.removeEventListener('keydown', this.onKeyDown, false);
  }

  private stop() {
    if (!this.isActive || this.isMobileAccessibility) {
      return;
    }

    this.isActive = false;

    globalThis.document.removeEventListener('mousemove', this.onMouseMove, true);
    this.deactivate();

    globalThis.addEventListener('keydown', this.onKeyDown, false);
  }

  private createTouchHook() {
    const hookDiv = document.createElement('button');

    hookDiv.style.width = `${DIV_HOOK_SIZE}px`;
    hookDiv.style.height = `${DIV_HOOK_SIZE}px`;
    hookDiv.style.position = 'absolute';
    hookDiv.style.top = `${DIV_HOOK_POS_X}px`;
    hookDiv.style.left = `${DIV_HOOK_POS_Y}px`;
    hookDiv.style.zIndex = DIV_HOOK_ZINDEX.toString();
    hookDiv.style.backgroundColor = '#FF0000';
    hookDiv.title = 'select to enable accessibility for this content';

    hookDiv.addEventListener('focus', () => {
      this.isMobileAccessibility = true;
      this.start();
      this.destroyTouchHook();
    });

    document.body.appendChild(hookDiv);
    this.hookDiv = hookDiv;
  }

  /**
   * Destroys the touch hooks.
   */
  private destroyTouchHook() {
    if (!this.hookDiv) {
      return;
    }
    document.body.removeChild(this.hookDiv);
    this.hookDiv = null;
  }

  activate() {
    if (isMobile.tablet || isMobile.phone) {
      this.createTouchHook();
    }

    this.createOverlay();

    globalThis.addEventListener('keydown', this.onKeyDown, false);
  }

  deactivate() {
    if (this.$container) {
      this.$container.remove();
    }

    globalThis.removeEventListener('keydown', this.onKeyDown, false);
  }
}
