import { Circle, Text } from '@antv/g';

export async function dblClick(context) {
  const { canvas } = context;
  await canvas.ready;

  let DELAY = 200;
  canvas.dblClickSpeed = DELAY;

  const circle0 = new Circle({
    style: {
      cx: 100,
      cy: 100,
      r: 50,
      fill: 'red',
      cursor: 'pointer',
    },
  });
  const circle1 = new Circle({
    style: {
      cx: 300,
      cy: 100,
      r: 50,
      fill: 'red',
      cursor: 'pointer',
    },
  });
  const circle2 = new Circle({
    style: {
      cx: 500,
      cy: 100,
      r: 50,
      fill: 'red',
      cursor: 'pointer',
    },
  });
  const text0 = new Text({
    style: { x: 0, y: 200, text: `current dblclick delay: ${DELAY}ms` },
  });
  const text1 = new Text({
    style: { x: 0, y: 220, text: `action: ` },
  });

  circle0.addEventListener('mouseenter', () => {
    DELAY = 200;
    canvas.dblClickSpeed = DELAY;

    text0.attr({ text: `current dblclick delay: ${DELAY}ms` });
    text1.attr({
      text: `action: `,
    });
  });
  circle1.addEventListener('mouseenter', () => {
    DELAY = 500;
    canvas.dblClickSpeed = DELAY;

    text0.attr({ text: `current dblclick delay: ${DELAY}ms` });
    text1.attr({
      text: `action: `,
    });
  });
  circle2.addEventListener('mouseenter', () => {
    DELAY = 1000;
    canvas.dblClickSpeed = DELAY;

    text0.attr({ text: `current dblclick delay: ${DELAY}ms` });
    text1.attr({
      text: `action: `,
    });
  });

  canvas.addEventListener('click', (event) => {
    text1.attr({
      text: `action: ${event.detail === 2 ? 'dblclick' : 'click'}`,
    });
  });

  canvas.appendChild(circle0);
  canvas.appendChild(circle1);
  canvas.appendChild(circle2);
  canvas.appendChild(text0);
  canvas.appendChild(text1);
}
