import type { CanvasContext, DisplayObject } from '@antv/g-lite';
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

/**
 * Inspired by @pixi/accessibility, create an overlay which sits over the canvas element.
 */
export class AriaManager {
  constructor(private context: CanvasContext) {}

  private $container: HTMLDivElement;

  private isActive = false;

  private isMobileAccessibility = false;

  /**
   * Button element for handling touch hooks.
   */
  private hookDiv: HTMLElement;

  private accessibleButtonMap = new WeakMap<DisplayObject, HTMLButtonElement>();

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

  private removeOverlay() {
    if (this.$container) {
      this.$container.remove();
    }
  }

  /**
   * Create an overlay which sits over the Canvas element.
   */
  private createOverlay() {
    const { document: doc } = this.context.config;
    const $domElement = this.context.contextService.getDomElement() as HTMLCanvasElement;
    const $parentElement = $domElement.parentNode;

    if ($parentElement) {
      let div = $parentElement.querySelector<HTMLDivElement>(`#${CLASSNAME_PREFIX}-mask`);
      if (!div) {
        div = (doc || document).createElement('div');
      }

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

    this.createOverlay();

    this.context.renderingContext.root.forEach((object: DisplayObject) => {
      this.createOrUpdateA11yDOM(object);
    });
  }

  private stop() {
    if (!this.isActive || this.isMobileAccessibility) {
      return;
    }

    this.isActive = false;

    globalThis.document.removeEventListener('mousemove', this.onMouseMove, true);
    globalThis.addEventListener('keydown', this.onKeyDown, false);

    this.removeOverlay();
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
    this.destroyTouchHook();

    this.removeOverlay();

    globalThis.removeEventListener('keydown', this.onKeyDown, false);
  }

  private dispatchEvent(e: UIEvent, types: string[]): void {
    console.log(types);

    // const { displayObject: target } = e.target as IAccessibleHTMLElement;
    // const boundry = this.renderer.events.rootBoundary;
    // const event: FederatedEvent = Object.assign(new FederatedEvent(boundry), { target });
    // boundry.rootTarget = this.renderer.lastObjectRendered as DisplayObject;
    // types.forEach((type) => boundry.dispatchEvent(event, type));
  }

  private onClick = (e: KeyboardEvent) => {
    this.dispatchEvent(e, ['click', 'pointertap', 'tap']);
  };

  private onFocus = (e: FocusEvent) => {
    const target = e.target as Element;
    // @see https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-live
    if (!target.getAttribute('aria-live')) {
      target.setAttribute('aria-live', 'assertive');
    }

    this.dispatchEvent(e, ['mouseover']);
  };

  private onFocusOut = (e: FocusEvent) => {
    const target = e.target as Element;
    if (!target.getAttribute('aria-live')) {
      target.setAttribute('aria-live', 'polite');
    }

    this.dispatchEvent(e, ['mouseout']);
  };

  createOrUpdateA11yDOM(object: DisplayObject) {
    if (object.isVisible() && object.style.accessible) {
      const { tabIndex, ariaLabel } = object.style;

      let $div = this.accessibleButtonMap.get(object);
      if (!$div) {
        $div = document.createElement('button');

        $div.style.width = `${DIV_TOUCH_SIZE}px`;
        $div.style.height = `${DIV_TOUCH_SIZE}px`;
        $div.style.backgroundColor = 'transparent';
        $div.style.position = 'absolute';
        $div.style.zIndex = DIV_TOUCH_ZINDEX.toString();
        $div.style.borderStyle = 'none';

        this.accessibleButtonMap.set(object, $div);

        // trigger events
        $div.addEventListener('click', this.onClick);
        $div.addEventListener('focus', this.onFocus);
        $div.addEventListener('focusout', this.onFocusOut);
      }

      // @see https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/tabindex
      $div.tabIndex = tabIndex;

      // @see https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-label
      $div.setAttribute('aria-label', ariaLabel);

      this.$container.appendChild($div);
    }
  }

  removeA11yDOM(object: DisplayObject) {
    const $div = this.accessibleButtonMap.get(object);
    if ($div) {
      $div.removeEventListener('click', this.onClick);
      $div.removeEventListener('focus', this.onFocus);
      $div.removeEventListener('focusout', this.onFocusOut);

      this.accessibleButtonMap.delete(object);

      this.$container.removeChild($div);
    }
  }
}
