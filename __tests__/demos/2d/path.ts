import { Path } from '../../../packages/g';

export async function path(context) {
  const { canvas } = context;
  await canvas.ready;

  const path = new Path({
    style: {
      d: 'M 356.37480026152645,56.68941288616037 Q 175.87317171217347 171.6466314112769,48.07084808243172 1.4210854715202004e-14 A 213.99999999999997 213.99999999999997 0 0 0 0 49.72605286975126 Q 175.87317171217347 171.6466314112769,383.6126929339904 120.2628662462923 A 213.99999999999997 213.99999999999997 0 0 0 356.37480026152645 56.68941288616044 Z',
      fill: 'rgb(23, 131, 255)',
      fillOpacity: 0.95,
      stroke: 'rgb(23, 131, 255)',
      opacity: 0.5,
      lineWidth: 1,
    },
  });
  canvas.appendChild(path);
}
