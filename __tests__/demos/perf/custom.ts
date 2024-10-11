import { Group, runtime, CustomElement } from '@antv/g';
import type { Canvas } from '@antv/g';

runtime.enableCSSParsing = false;

class Node extends CustomElement<any> {}

const type = 'custom';
const Ctor = { custom: Node, group: Group }[type];

export async function customElement(context: { canvas: Canvas }) {
  const { canvas } = context;

  await canvas.ready;

  const group = new Group({});

  console.time('render');

  console.log(type);

  for (let i = 0; i < 50_0000; i++) {
    const node = new Ctor({
      style: {
        transform: [['translate', Math.random() * 640, Math.random() * 640]],
      },
    });

    group.appendChild(node);
  }

  canvas.appendChild(group);

  canvas.addEventListener(
    'rerender',
    () => {
      console.timeEnd('render');
      Object.assign(window, { canvas });
    },
    { once: true },
  );
}
