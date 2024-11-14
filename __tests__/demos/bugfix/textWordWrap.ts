import { Canvas, Text, Rect } from '@antv/g';

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
      maxLines: 3,
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

  canvas.appendChild(text0);
  canvas.appendChild(rect0);
  canvas.appendChild(text1);
  canvas.appendChild(rect1);
  canvas.appendChild(text2);
  canvas.appendChild(rect2);
}
