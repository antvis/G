import { Path } from '@antv/g';

export async function lineDash(context) {
  const { canvas } = context;

  await canvas.ready;

  const path = new Path({
    style: {
      stroke: 'black',
      d:
        'M 100,300' +
        'l 50,-25' +
        'a25,25 -30 0,1 50,-25' +
        'l 50,-25' +
        'a25,50 -30 0,1 50,-25' +
        'l 50,-25' +
        'a25,75 -30 0,1 50,-25' +
        'l 50,-25' +
        'a25,100 -30 0,1 50,-25' +
        'l 50,-25' +
        'l 0, 200,' +
        'z',
    },
  });

  canvas.appendChild(path);

  const length = path.getTotalLength();
  // @ts-ignore
  path.animate([{ lineDash: [0, length] }, { lineDash: [length, 0] }], {
    duration: 3500,
    easing: 'cubic-bezier(0.250, 0.460, 0.450, 0.940)',
    iterations: Infinity,
    direction: 'alternate',
  });
}
