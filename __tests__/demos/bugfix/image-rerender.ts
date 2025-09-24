import { Image, type Canvas } from '@antv/g';
import type { GUI } from 'lil-gui';

const IMAGE_URL =
  'https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*N4ZMS7gHsUIAAAAAAAAAAABkARQnAQ';

export async function imageRerender(context: { canvas: Canvas; gui: GUI }) {
  const { canvas, gui } = context;
  await canvas.ready;

  const image = new Image({
    style: {
      x: 100,
      y: 100,
      width: 200,
      height: 200,
      src: IMAGE_URL,
    },
  });
  canvas.appendChild(image);

  const actions = {
    'Re-set Same Src': () => {
      console.log('Re-setting src to the same URL...');
      image.setAttribute('src', IMAGE_URL);
      console.log('Done.');
    },
    'Remove and Re-add': () => {
      console.log('Removing and re-adding image...');
      canvas.removeChild(image);
      // Re-add after a short delay to make the effect visible
      setTimeout(() => {
        canvas.appendChild(image);
        console.log('Done.');
      }, 100);
    },
  };

  gui.add(actions, 'Re-set Same Src');
  gui.add(actions, 'Remove and Re-add');
}
