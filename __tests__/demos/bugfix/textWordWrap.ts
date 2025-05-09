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
      maxLines: 1,
      opacity: 1,
      // text: '哈哈哈哈哈哈哈哈',
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
      y: 140,
      fill: '#000000',
      fontFamily: 'Roboto, PingFangSC, Microsoft YaHei, Arial, sans-serif',
      // bold 12px Roboto, PingFangSC, "Microsoft YaHei", Arial, sans-serif
      fontSize: 20,
      fontWeight: 'normal',
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
      x: 100,
      y: 180,
      fill: '#000000',
      fontFamily: 'Roboto, PingFangSC, Microsoft YaHei, Arial, sans-serif',
      // bold 12px Roboto, PingFangSC, "Microsoft YaHei", Arial, sans-serif
      fontSize: 12,
      fontWeight: 'normal',
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
      x: 100,
      y: 220,
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
      textBaseline: 'top',
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

  // long text
  const text4 = new Text({
    style: {
      x: 100,
      y: 300,
      wordWrap: true,
      wordWrapWidth: 510,
      maxLines: 10,
      textOverflow: 'ellipsis',
      fontFamily:
        'Roboto, PingFangSC, BlinkMacSystemFont, Microsoft YaHei, Arial, sans-serif',
      fontSize: 12,
      lineHeight: 20,
      fontWeight: 700,
      fill: '#000000',
      opacity: 1,
      // textAlign: 'center',
      // textBaseline: 'middle',
      textBaseline: 'top',
      text: '{"courseId":"C12345","courseName":{"chinese":"Python 数据科学入门","english":"Introduction to Python Data Science"},"instructor":{"name":"张教授","title":"数据科学教授","introduction":"张教授是知名的数据科学家，拥有多年的教学经验。He has a deep understanding of Python programming and data analysis."},"description":"本课程旨在帮助学员从零基础开始学习 Python 编程，掌握数据分析的基本技能。通过本课程，您将能够使用 Python 进行数据清洗、探索性数据分析、机器学习等。This course is designed to help learners start from scratch and learn Python programming and master the basic skills of data analysis.","curriculum":[{"module":"Python 基础","topics":["变量与数据类型","控制流","函数"]},{"module":"NumPy 和 Pandas","topics":["NumPy 数组操作","Pandas 数据框","数据清洗"]},{"module":"数据可视化","topics":["Matplotlib","Seaborn","数据可视化案例"]}],"duration":"12周","price":999,"ratings":[{"rating":4.5,"comment":"课程内容丰富，老师讲得很清楚。The course content is comprehensive and the teacher explains very clearly."},{"rating":5,"comment":"非常适合初学者入门，强烈推荐！Highly recommended for beginners!"}],"enrollment":500}',
    },
  });
  const rect4 = new Rect({
    style: {
      x: text4.style.x,
      y: text4.style.y,
      width: text4.style.wordWrapWidth,
      height: +text4.style.lineHeight * text4.style.maxLines,
      stroke: '#000000',
    },
  });

  // BUG: https://github.com/antvis/G/issues/1932
  const text5 = new Text({
    style: {
      x: 100,
      y: 520,
      wordWrap: true,
      maxLines: 2,
      textOverflow: 'ellipsis',
      fontFamily: 'Roboto, PingFangSC, Microsoft YaHei, Arial, sans-serif',
      fontSize: 50,
      lineHeight: 50,
      fontWeight: 'normal',
      fill: '#000000',
      opacity: 1,
      textBaseline: 'top',
      textAlign: 'left',
      text: '杭州杭州杭州杭州杭州杭州',
      wordWrapWidth: 80,
    },
  });
  const rect5 = new Rect({
    style: {
      x: text5.style.x,
      y: text5.style.y,
      width: text5.style.wordWrapWidth,
      height: +text5.style.lineHeight * text5.style.maxLines,
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
  canvas.appendChild(text5);
  canvas.appendChild(rect5);

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
