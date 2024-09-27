import { Path } from '@antv/g';

export async function transform_path(context) {
  const { canvas, container } = context;
  await canvas.ready;

  const path = new Path({
    style: {
      d: 'M304,42A168,168,0,0,1,459.4210205078125,273.78399658203125L352.5690002441406,229.93299865722656A52.5,52.5,0,0,0,304,157.5Z',
      // transform: 'translate(10, 10)',
      stroke: 'green',
    },
  });
  canvas.appendChild(path);

  // path.style.transform = 'translate(100, 10)';
}
