import { Circle, Text, runtime } from '../../../packages/g';

runtime.enableCSSParsing = false;

export async function transformText(context) {
  const { canvas } = context;
  await canvas.ready;

  const circle1 = new Circle({
    style: {
      cx: 100,
      cy: 100,
      r: 5,
      fill: 'green',
    },
  });
  canvas.appendChild(circle1);

  const text = new Text({
    style: {
      x: 100,
      y: 100,
      fontSize: 20,
      text: 'Hello World',
      fill: 'red',
      transform: 'rotate(90deg)',
    },
  });
  canvas.appendChild(text);

  const text2 = new Text({
    style: {
      x: 100,
      y: 100,
      fontSize: 20,
      text: 'Hello World',
      fill: 'red',
    },
  });
  canvas.appendChild(text2);

  // Set transformOrigin
  const text3 = new Text({
    style: {
      x: 100,
      y: 100,
      fontSize: 20,
      text: 'Hello World',
      fill: 'red',
      transform: 'rotate(45deg)',
      // transformOrigin: '0 20',
    },
  });
  canvas.appendChild(text3);

  const circle2 = new Circle({
    style: {
      cx: 300,
      cy: 100,
      r: 5,
      fill: 'green',
    },
  });
  canvas.appendChild(circle2);
  const text4 = new Text({
    style: {
      x: 300,
      y: 100,
      fontSize: 20,
      text: 'Hello World',
      fill: 'red',
      textAlign: 'center',
      textBaseline: 'middle',
    },
  });
  canvas.appendChild(text4);
  const text5 = new Text({
    style: {
      x: 300,
      y: 100,
      fontSize: 20,
      text: 'Hello World',
      fill: 'red',
      textAlign: 'center',
      textBaseline: 'middle',
      transform: 'rotate(45deg)',
      transformOrigin: 'center',
    },
  });
  canvas.appendChild(text5);
  const text6 = new Text({
    style: {
      x: 300,
      y: 100,
      fontSize: 20,
      text: 'Hello World',
      fill: 'red',
      textAlign: 'center',
      textBaseline: 'middle',
      transform: 'rotate(90deg)',
      transformOrigin: 'center',
    },
  });
  canvas.appendChild(text6);
}
