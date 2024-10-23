import { Canvas, Image as GImage } from '@antv/g';

export async function image(context: { canvas: Canvas }) {
  const { canvas } = context;
  await canvas.ready;
  console.log(canvas);

  const $dom = canvas.getContextService().getDomElement() as HTMLCanvasElement;
  $dom.style.border = '1px solid gray';

  // ---
  $dom.addEventListener('wheel', (event) => {
    event.preventDefault();

    const { deltaX, deltaY } = event;
    const d = -(deltaX ?? deltaY);

    const ratio = 1 + (Math.min(Math.max(d, -50), 50) * 1) / 100;
    const zoom = canvas.getCamera().getZoom();

    canvas
      .getCamera()
      .setZoomByViewportPoint(zoom * ratio, [event.offsetX, event.offsetY]);
  });

  let isDragging = false;
  let lastX, lastY;
  $dom.addEventListener('mousedown', (e) => {
    isDragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
  });
  $dom.addEventListener('mousemove', (e) => {
    if (isDragging) {
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      canvas.getCamera().pan(-dx, -dy);
      lastX = e.clientX;
      lastY = e.clientY;
    }
  });
  $dom.addEventListener('mouseup', () => {
    isDragging = false;
  });

  // ---

  let image = new GImage({
    style: {
      x: 0,
      y: 0,
      // width: 100,
      // height: 400,
      // src: 'https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*N4ZMS7gHsUIAAAAAAAAAAABkARQnAQ',
      src: 'http://mmtcdp.stable.alipay.net/cto_designhubcore/afts/img/g1a5QYkvbcMAAAAAAAAAAAAADgLVAQBr/original',
    },
  });
  canvas.appendChild(image);
}
