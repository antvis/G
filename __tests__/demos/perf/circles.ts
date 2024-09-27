import { Circle } from '@antv/g';

export async function circles(context) {
  const { canvas, container } = context;
  await canvas.ready;

  canvas.addEventListener('rerender', () => {
    console.log('rerender');
  });

  for (let i = 0; i < 10000; i++) {
    const circle = new Circle({
      style: {
        cx: Math.random() * 640,
        cy: Math.random() * 640,
        r: 10,
        fill: '#1890FF',
        stroke: '#F04864',
        lineWidth: 4,
      },
    });
    canvas.appendChild(circle);
  }

  // canvas.appendChild(
  //   new Circle({
  //     style: {
  //       cx: 320,
  //       cy: 320,
  //       r: 100,
  //       fill: '#1890FF',
  //       stroke: '#F04864',
  //       lineWidth: 4,
  //     },
  //   }),
  // );
}
