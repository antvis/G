import { Canvas, Text, Rect } from '@antv/g';
import * as tinybench from 'tinybench';

/**
 * @link https://github.com/antvis/G/issues/1833
 */
export async function textWordWrap(context: { canvas: Canvas }) {
  const { canvas } = context;
  await canvas.ready;

  // fontSize: 12
  const text0 = new Text({
    style: {
      x: 100,
      y: 100,
      fill: '#000000',
      fontFamily: 'Roboto, PingFangSC, Microsoft YaHei, Arial, sans-serif',
      // bold 12px Roboto, PingFangSC, "Microsoft YaHei", Arial, sans-serif
      fontSize: 12,
      fontWeight: 'normal',
      linkTextFill: '#326EF4',
      maxLines: 1,
      opacity: 1,
      // text: "哈哈哈哈哈哈哈哈",
      text: '11111111',
      // textAlign: "right",
      textBaseline: 'top',
      textOverflow: 'ellipsis',
      wordWrap: true,
      wordWrapWidth: 52,
    },
  });
  const rect0 = new Rect({
    style: {
      x: text0.style.x,
      y: text0.style.y,
      width: text0.style.wordWrapWidth,
      height: text0.style.fontSize,
      stroke: '#000000',
    },
  });

  // fontSize: 20
  const text1 = new Text({
    style: {
      x: 100,
      y: 300,
      fill: '#000000',
      fontFamily: 'Roboto, PingFangSC, Microsoft YaHei, Arial, sans-serif',
      // bold 12px Roboto, PingFangSC, "Microsoft YaHei", Arial, sans-serif
      fontSize: 20,
      fontWeight: 'normal',
      linkTextFill: '#326EF4',
      maxLines: 1,
      opacity: 1,
      // text: '哈哈哈哈哈哈哈哈',
      text: '11111111111111111',
      // textAlign: "right",
      textBaseline: 'top',
      textOverflow: 'ellipsis',
      wordWrap: true,
      wordWrapWidth: 167,
    },
  });
  const rect1 = new Rect({
    style: {
      x: text1.style.x,
      y: text1.style.y,
      width: text1.style.wordWrapWidth,
      height: text1.style.fontSize,
      stroke: '#000000',
    },
  });

  // BUG: If there is a line break, no ellipsis will appear
  const text2 = new Text({
    style: {
      x: 200,
      y: 200,
      fill: '#000000',
      fontFamily: 'Roboto, PingFangSC, Microsoft YaHei, Arial, sans-serif',
      // bold 12px Roboto, PingFangSC, "Microsoft YaHei", Arial, sans-serif
      fontSize: 12,
      fontWeight: 'normal',
      linkTextFill: '#326EF4',
      maxLines: 1,
      opacity: 1,
      text: '哈哈哈哈\n哈哈哈哈\n哈哈哈哈\n',
      // textAlign: 'right',
      textBaseline: 'top',
      textOverflow: 'ellipsis',
      wordWrap: true,
      wordWrapWidth: 84,
    },
  });
  const rect2 = new Rect({
    style: {
      x: text2.style.x,
      y: text2.style.y,
      width: text2.style.wordWrapWidth,
      height: +text2.style.fontSize * text2.style.maxLines,
      stroke: '#000000',
    },
  });

  const text3 = new Text({
    style: {
      x: 300,
      y: 300,
      wordWrap: true,
      wordWrapWidth: 2,
      maxLines: 5,
      textOverflow: 'ellipsis',
      fontFamily: 'Roboto, PingFangSC, Microsoft YaHei, Arial, sans-serif',
      fontSize: 12,
      fontWeight: 700,
      fill: '#000000',
      opacity: 1,
      textAlign: 'center',
      textBaseline: 'middle',
      linkTextFill: '#326EF4',
      text: '千亿数据',
    },
  });
  const rect3 = new Rect({
    style: {
      x: text3.style.x,
      y: text3.style.y,
      width: text3.style.wordWrapWidth,
      height: +text3.style.fontSize * text3.style.maxLines,
      stroke: '#000000',
    },
  });

  const text4 = new Text({
    style: {
      x: 100,
      y: 400,
      wordWrap: true,
      wordWrapWidth: 2210,
      maxLines: 10,
      textOverflow: 'ellipsis',
      fontFamily:
        'Roboto, PingFangSC, BlinkMacSystemFont, Microsoft YaHei, Arial, sans-serif',
      fontSize: 12,
      fontWeight: 700,
      fill: '#000000',
      opacity: 1,
      textAlign: 'center',
      textBaseline: 'middle',
      linkTextFill: '#326EF4',
      text: '{"acodeList":"[4419, 4413]","roadList":"[122702094, 121224203, 122702115, 98717265, 122702113, 98718278, 98718270, 98718271, 124670851, 98719406, 122702114, 98719557, 121323912, 122702093, 98718269]","高低标准标签":"高普","isFilter":"否","质量标准":"模型类","标准编号":"","客户标签":"","高速误报率":"","普通路误报率":"","cityName":"东莞市","adcode":"441302","hfc":"3","errorOriginLabel":"虚拟"}',
    },
  });
  console.log(text4);
  const rect4 = new Rect({
    style: {
      x: text4.style.x,
      y: text4.style.y,
      width: text4.style.wordWrapWidth,
      height: +text4.style.fontSize * text4.style.maxLines,
      stroke: '#000000',
    },
  });

  canvas.appendChild(text0);
  canvas.appendChild(rect0);
  canvas.appendChild(text1);
  canvas.appendChild(rect1);
  canvas.appendChild(text2);
  canvas.appendChild(rect2);
  canvas.appendChild(text3);
  canvas.appendChild(rect3);
  canvas.appendChild(text4);
  canvas.appendChild(rect4);

  // benchmark
  // ----------
  const bench = new tinybench.Bench({
    name: 'canvas text benchmark',
    time: 100,
  });

  const canvasEl = document.createElement('canvas');
  const testText = 'Hello, World!';
  bench.add('Measure the entire text at once', async () => {
    canvasEl.getContext('2d').measureText(testText);
  });
  bench.add('Character-by-character measurement', async () => {
    const ctx = canvasEl.getContext('2d');
    Array.from(testText).forEach((char) => {
      ctx.measureText(char);
    });
  });

  const testText1 =
    'In G, text line break detection is currently done by iteratively measuring the width of each character and then adding them up to determine whether a line break is needed. External users may configure wordWrapWidth by directly measuring the width of the entire text. The two different text measurement methods will lead to visual inconsistencies.';
  bench.add('(long txt) Measure the entire text at once', async () => {
    canvasEl.getContext('2d').measureText(testText1);
  });
  bench.add('(long txt) Character-by-character measurement', async () => {
    const ctx = canvasEl.getContext('2d');
    Array.from(testText1).forEach((char) => {
      ctx.measureText(char);
    });
  });

  await bench.run();

  console.log(bench.name);
  console.table(bench.table());
  console.log(bench.results);
  console.log(bench.tasks);

  // ----------
}
