import { Canvas, HTML, Rect } from '@antv/g-lite';
import { Renderer } from '@antv/g-canvas';

const renderer = new Renderer({ htmlRendering: 'native' });
const canvas = new Canvas({
  container: 'scene',
  width: 520,
  height: 320,
  renderer,
  background: '#26344e',
});
await canvas.ready;

const card = new HTML({
  style: {
    x: 70,
    y: 62,
    width: 250,
    height: 150,
    innerHTML: `<div style="width:100%;height:100%;padding:18px;box-sizing:border-box;border-radius:13px;background:#f7f9fd;color:#13243b">
      <strong>真实 HTML 图元</strong><p style="font-size:12px;color:#52657e">G 场景树内，浏览器原生交互。</p>
      <button id="node-button" style="height:34px;width:208px;border:0;border-radius:6px;background:#285cd7;color:white">点击验证</button>
    </div>`,
  },
});
const cover = new Rect({
  style: {
    x: 220,
    y: 140,
    width: 230,
    height: 80,
    fill: 'rgba(234, 103, 54, .78)',
    zIndex: 10,
  },
});
canvas.appendChild(card);
canvas.appendChild(cover);

const domCanvas = canvas
  .getContextService()
  .getDomElement() as HTMLCanvasElement;
document.querySelector('#mode')!.textContent =
  `模式：${renderer.getConfig().htmlRendering}；HTML 属于 Canvas 子树：${domCanvas.contains(card.getDomElement())}`;
card
  .getDomElement()
  ?.querySelector('#node-button')
  ?.addEventListener('click', () => {
    document.querySelector('#status')!.textContent = 'HTML 按钮已点击';
  });
cover.addEventListener('click', () => {
  document.querySelector('#status')!.textContent = '前景 G 图形已点击';
});
document.querySelector('#export')!.addEventListener('click', async () => {
  const preview = document.querySelector<HTMLImageElement>('#preview')!;
  preview.src = await canvas
    .getContextService()
    .toDataURL({ type: 'image/png' });
  preview.hidden = false;
});
