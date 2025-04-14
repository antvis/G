import { Canvas, Text, CanvasEvent } from '@antv/g';
import { Renderer } from '@antv/g-canvas';

// const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
// const randomLetter = () => letters.charAt(Math.floor(Math.random() * 26));

/**
 * @see https://github.com/antvis/G/issues/1910
 */
export async function issue_1910(context: { canvas: Canvas }) {
  const { canvas } = context;
  console.log(canvas);

  canvas.setRenderer(
    new Renderer({
      enableAutoRendering: false,
    }),
  );

  const canvasDom = canvas
    .getContextService()
    .getDomElement() as unknown as HTMLCanvasElement;
  const btnDom = document.createElement('button');
  btnDom.style.cssText =
    'position: absolute; top: 0px; left: 600px; width: 120px; height: 32px';
  btnDom.textContent = 'trigger render';

  canvasDom.parentElement.appendChild(btnDom);

  const text1 = new Text({
    style: {
      x: 100,
      y: 200,
      text: 'A',
      fontSize: 16,
      fill: '#f00',
      zIndex: 1, // zIndex 为 0 或不配置时，一切正常
    },
  });

  const text2 = new Text({
    style: {
      x: 100,
      y: 300,
      text: 'B',
      fontSize: 16,
      fill: '#000',
    },
  });

  canvas.addEventListener(CanvasEvent.READY, () => {
    canvas.appendChild(text1);
    canvas.appendChild(text2);
    canvas.render();

    btnDom.onclick = () => {
      canvas.removeChild(text1);
      // canvas.removeChild(text2);
      console.log('removed');

      canvas.render(); // 添加这行代码后不会出现锯齿，但会有图元丢失问题

      // text1.style.text = randomLetter();
      text1.style.zIndex = Math.round(Math.random());
      // text2.style.text = randomLetter();
      // console.log(text1.style.zIndex);

      canvas.appendChild(text1);
      // canvas.appendChild(text2);
      console.log('appended');

      canvas.render();
    };
  });
}
