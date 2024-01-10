import { runtime } from '../../../packages/g';
import { loadAnimation } from '../../../packages/g-lottie-player';
import * as d3 from 'd3';

export async function spring(context) {
  runtime.enableCSSParsing = true;

  const { canvas } = context;
  await canvas.ready;

  const data = await d3.json('/lottie/spring.json');
  const animation = loadAnimation(data, { loop: true, autoplay: true });
  const wrapper = animation.render(canvas);
}
