import { Circle, Text } from '@antv/g';

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
      transformOrigin: 'left bottom',
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
      transformOrigin: 'left bottom',
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

  const circle3 = new Circle({
    style: {
      cx: 500,
      cy: 100,
      r: 5,
      fill: 'green',
    },
  });
  canvas.appendChild(circle3);
  const text7 = new Text({
    style: {
      x: 500,
      y: 100,
      fontSize: 20,
      text: 'Hello World',
      fill: 'red',
      textAlign: 'right',
      textBaseline: 'middle',
    },
  });
  canvas.appendChild(text7);
  const text8 = new Text({
    style: {
      x: 500,
      y: 100,
      fontSize: 20,
      text: 'Hello World',
      fill: 'red',
      textAlign: 'right',
      textBaseline: 'middle',
      transform: 'rotate(45deg)',
      transformOrigin: 'right center',
    },
  });
  canvas.appendChild(text8);
  const text9 = new Text({
    style: {
      x: 500,
      y: 100,
      fontSize: 20,
      text: 'Hello World',
      fill: 'red',
      textAlign: 'right',
      textBaseline: 'middle',
      transform: 'rotate(90deg)',
      transformOrigin: 'right center',
    },
  });
  canvas.appendChild(text9);
}
