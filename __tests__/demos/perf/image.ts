import { Canvas, Group, Image as GImage } from '@antv/g';
import * as lil from 'lil-gui';

export async function image(context: { canvas: Canvas; gui: lil.GUI }) {
  const { canvas, gui } = context;
  await canvas.ready;
  console.log(canvas);

  const group = new Group();

  // let image = new GImage({
  //   style: {
  //     x: 0,
  //     y: 0,
  //     // width: 100,
  //     // height: 400,
  //     // src: 'https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*N4ZMS7gHsUIAAAAAAAAAAABkARQnAQ',
  //     // src: 'http://mmtcdp.stable.alipay.net/cto_designhubcore/afts/img/g1a5QYkvbcMAAAAAAAAAAAAADgLVAQBr/original',
  //     src: 'https://mdn.alipayobjects.com/huamei_fr7vu1/afts/img/A*SqloToP7R9QAAAAAAAAAAAAADkn0AQ/original',
  //     // src: 'https://freepngimg.com/download/svg/animal/10081.svg',
  //   },
  // });

  // group.appendChild(image);

  const img = new Image();
  img.onload = () => {
    console.log('onload', img.complete);
    // let image = new GImage({
    //   style: {
    //     x: 0,
    //     y: 0,
    //     src: img,
    //   },
    // });
    // group.appendChild(image);
  };

  let image = new GImage({
    style: {
      x: 0,
      y: 0,
      src: img,
    },
  });
  group.appendChild(image);

  // img.src = 'https://freepngimg.com/download/svg/animal/10081.svg';
  img.src =
    // 'https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*N4ZMS7gHsUIAAAAAAAAAAABkARQnAQ';
    'https://mdn.alipayobjects.com/huamei_fr7vu1/afts/img/A*SqloToP7R9QAAAAAAAAAAAAADkn0AQ/original';

  canvas.appendChild(group);

  // ---
  const $dom = canvas.getContextService().getDomElement() as HTMLCanvasElement;
  let currentZoom = 1;
  let isDragging = false;
  let lastX, lastY;

  $dom.style.border = '1px solid gray';

  $dom.addEventListener('wheel', (event) => {
    event.preventDefault();

    const { deltaX, deltaY } = event;
    const d = -(deltaX || deltaY);

    const ratio = 1 + (Math.min(Math.max(d, -50), 50) * 1) / 100;
    const zoom = canvas.getCamera().getZoom();
    currentZoom = zoom * ratio;

    canvas
      .getCamera()
      .setZoomByViewportPoint(currentZoom, [event.offsetX, event.offsetY]);
  });

  $dom.addEventListener('mousedown', (e) => {
    isDragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
  });
  $dom.addEventListener('mousemove', (e) => {
    if (isDragging) {
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      canvas.getCamera().pan(-dx / currentZoom, -dy / currentZoom);
      lastX = e.clientX;
      lastY = e.clientY;
    }
  });
  $dom.addEventListener('mouseup', () => {
    isDragging = false;
  });

  // ---

  // GUI
  gui
    .add(
      { enableLargeImageOptimization: false },
      'enableLargeImageOptimization',
    )
    .onChange((result) => {
      canvas.context.config.enableLargeImageOptimization = result;
    });
}
