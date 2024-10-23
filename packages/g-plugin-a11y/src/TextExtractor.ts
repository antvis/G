import type { CanvasContext, Text } from '@antv/g-lite';

const CLASSNAME_PREFIX = 'g-a11y-text-extractor';

export class TextExtractor {
  constructor(private context: CanvasContext) {}

  private $container: HTMLDivElement;

  activate() {
    const { document: doc } = this.context.config;
    const $domElement =
      this.context.contextService.getDomElement() as HTMLCanvasElement;
    const $parentElement = $domElement.parentNode;

    if ($parentElement) {
      this.$container = (doc || document).createElement('div');
      this.$container.id = `${CLASSNAME_PREFIX}-mask`;
      this.$container.style.cssText = `
position: absolute;
top: 0;
left: 0;
right: 0;
bottom: 0;
z-index: 99;
pointer-events: none;
user-select: none;
overflow: hidden;
`;
      $parentElement.appendChild(this.$container);
    }
  }

  getOrCreateEl(text: Text) {
    const { document: doc } = this.context.config;
    const id = `${CLASSNAME_PREFIX}-text-${text.entity}`;

    let $existed = this.$container.querySelector<HTMLDivElement>(`#${id}`);
    if (!$existed) {
      $existed = (doc || document).createElement('div');
      $existed.id = `${CLASSNAME_PREFIX}-text-${text.entity}`;
      $existed.style.cssText = `
line-height: 1;
position: absolute;
white-space: pre;
word-break: keep-all;
color: transparent !important;
`;
      this.$container.appendChild($existed);
    }

    return $existed;
  }

  updateAttribute(name: string, text: Text) {
    const $el = this.getOrCreateEl(text);
    switch (name) {
      case 'text':
        const { text: textContent } = text.parsedStyle;
        $el.textContent = textContent;
        break;
      case 'visibility':
        const { visibility } = text.parsedStyle;
        if (visibility === 'visible') {
          this.getOrCreateEl(text);
        } else {
          this.removeEl(text);
        }
        break;
      case 'x':
        const { x } = text.parsedStyle;
        $el.style.left = `${x}px`;
        break;
      case 'y':
        const { y } = text.parsedStyle;
        $el.style.top = `${y}px`;
        break;
      case 'modelMatrix':
      case 'transformOrigin':
      case 'textAlign':
      case 'textBaseline':
      case 'dx':
      case 'dy':
        const {
          transformOrigin,
          textAlign,
          textBaseline,
          dx = 0,
          dy = 0,
        } = text.parsedStyle;
        $el.style['transform-origin'] = `${
          (transformOrigin && transformOrigin[0].value) || 0
        } ${(transformOrigin && transformOrigin[1].value) || 0}`;
        const worldTransform = text.getWorldTransform();

        let offsetX = '0';
        // handle horizontal text align
        if (textAlign === 'center' || textAlign === 'middle') {
          offsetX = '-50%';
        } else if (textAlign === 'right' || textAlign === 'end') {
          offsetX = '-100%';
        }
        let offsetY = '0';
        if (textBaseline === 'middle') {
          offsetY = '-50%';
        } else if (
          textBaseline === 'bottom' ||
          textBaseline === 'alphabetic' ||
          textBaseline === 'ideographic'
        ) {
          offsetY = '-100%';
        }

        $el.style.transform = `translate(${dx}px,${dy}px) translate(${offsetX},${offsetY}) matrix3d(${worldTransform.toString()})`;
        break;
      case 'fontSize':
        const { fontSize = 0 } = text.parsedStyle;
        $el.style.fontSize = `${fontSize}px`;
        break;
      case 'fontFamily':
        const { fontFamily } = text.parsedStyle;
        $el.style.fontFamily = fontFamily;
        break;
    }
  }

  removeEl(text: Text) {
    const id = `${CLASSNAME_PREFIX}-text-${text.entity}`;
    const $existed = this.$container.querySelector<HTMLDivElement>(`#${id}`);
    if ($existed) {
      $existed.remove();
    }
  }

  deactivate() {
    if (this.$container) {
      this.$container.remove();
    }
  }
}
