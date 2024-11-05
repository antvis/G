import { Rect, runtime } from '@antv/g';

export async function massiveAttrs(context) {
  const { canvas, gui } = context;

  runtime.enableMassiveParsedStyleAssignOptimization = true;

  await canvas.ready;

  console.time('massiveAttrs');

  for (let i = 0; i < 10000; i++) {
    const rect = new Rect({
      style: {
        x: Math.random() * 640,
        y: Math.random() * 640,
        width: 10 + Math.random() * 40,
        height: 10 + Math.random() * 40,
        fill: '#1890FF',
        stroke: '#F04864',
        lineWidth: 4,

        // extra attrs
        'attr-a': 1,
        'attr-b': 2,
        'attr-c': 3,
        'attr-d': 4,
        'attr-e': 5,
        'attr-f': 6,
        'attr-g': 7,
        'attr-h': 8,
        'attr-i': 9,
        'attr-j': 10,
        'attr-k': 11,
        'attr-l': 12,
        'attr-m': 13,
        'attr-n': 14,
        'attr-o': 15,
        'attr-p': 16,
        'attr-q': 17,
        'attr-r': 18,
        'attr-s': 19,
        'attr-t': 20,
        'attr-u': 21,
        'attr-v': 22,
        'attr-w': 23,
        'attr-x': 24,
        'attr-y': 25,
        'attr-z': 26,
      },
    });

    canvas.appendChild(rect);
  }

  canvas.addEventListener('rerender', () => {
    console.timeEnd('massiveAttrs');
  });
}
