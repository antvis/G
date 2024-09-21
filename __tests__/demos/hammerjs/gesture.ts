import { Circle, Text } from '@antv/g';
import Hammer from 'hammerjs';

export async function gesture(context) {
  const { canvas } = context;
  await canvas.ready;

  // add a circle to canvas
  const circle = new Circle({
    id: 'circle',
    style: {
      fill: 'rgb(239, 244, 255)',
      fillOpacity: 1,
      lineWidth: 1,
      opacity: 1,
      r: 100,
      stroke: 'rgb(95, 149, 255)',
      strokeOpacity: 1,
      cursor: 'pointer',
    },
  });

  const text = new Text({
    id: 'text',
    style: {
      fill: '#000',
      fillOpacity: 0.9,
      // font: `normal normal normal 12px Avenir, -apple-system, system-ui, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"`,
      fontFamily: 'Avenir',
      fontSize: 22,
      fontStyle: 'normal',
      fontVariant: 'normal',
      fontWeight: 'normal',
      lineWidth: 1,
      opacity: 1,
      strokeOpacity: 1,
      text: 'Try to tap/press/pan me',
      textAlign: 'center',
      textBaseline: 'middle',
    },
  });

  circle.appendChild(text);
  canvas.appendChild(circle);
  circle.setPosition(300, 200);

  // use hammer.js
  const hammer = new Hammer(circle, {
    inputClass: Hammer.PointerEventInput,
  });
  hammer.on('panleft panright tap press', (ev) => {
    text.attr('text', `${ev.type} gesture detected.`);
  });
}
