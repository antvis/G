import { Canvas, Circle } from '@antv/g';
import { Renderer } from '@antv/g-canvas';

export async function shadowroot_offset(context) {
  const { container } = context;
  container.innerHTML = '';

  class CustomElement extends HTMLElement {
    connectedCallback() {
      const shadowRoot = this.attachShadow({ mode: 'open' });
      // 向 shodowRoot 中添加一些内容
      shadowRoot.innerHTML = `
        <div style='display: flex; transform: scale(1.5) translate(100px, 0);'>
          <div style="display: flex; width: 200px; height: 400px; border-right: 1px solid rgb(221, 221, 221);"></div>
          <div style="flex: 1 1 0%; display: flex;">
            <div id='container' style='height: 300px'></div>
          </div>
        </div>
        `;

      const canvas = new Canvas({
        container: shadowRoot.querySelector('#container')! as HTMLElement,
        width: 500,
        height: 500,
        renderer: new Renderer(),
        supportsCSSTransform: true,
      });

      const circle = new Circle({
        style: {
          cx: 100,
          cy: 100,
          r: 50,
          fill: 'red',
          cursor: 'pointer',
        },
      });
      canvas.appendChild(circle);

      circle.addEventListener('pointerenter', () => {
        circle.style.fill = 'green';
      });
      circle.addEventListener('pointerleave', () => {
        circle.style.fill = 'red';
      });
    }

    disconnectedCallback() {}
  }

  if (!customElements.get('error-element')) {
    customElements.define('error-element', CustomElement);
  }

  const e = document.createElement('error-element');
  container?.appendChild(e);
}
