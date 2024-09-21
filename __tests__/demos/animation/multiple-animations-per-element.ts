import { Rect } from '@antv/g';

export async function multipleAnimationsPerElement(context) {
  const { canvas } = context;

  await canvas.ready;

  const timings: KeyframeAnimationOptions = {
    easing: 'ease-in-out',
    iterations: Infinity,
    direction: 'alternate',
    fill: 'both',
    delay: 0,
    duration: 0,
  };

  for (let i = 0; i < 20; i++) {
    const rect = new Rect({
      style: {
        x: i * 30,
        y: 100,
        width: 30,
        height: 10,
        radius: 2,
        fill: 'rgb(239, 239, 255)',
      },
    });
    canvas.appendChild(rect);

    timings.delay = i * 98;
    timings.duration = 2500;
    rect.animate(
      [
        { transform: 'translateY(0) scaleX(.8)' },
        { transform: 'translateY(300) scaleX(1)' },
      ],
      timings,
    );

    timings.duration = 2000;
    rect.animate([{ opacity: 1 }, { opacity: 0 }], timings);

    timings.duration = 3000;
    rect.animate(
      [{ fill: 'rgb(239, 239, 255)' }, { fill: '#e4c349' }],
      timings,
    );
  }
}
