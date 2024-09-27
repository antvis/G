import { Text } from '@antv/g';

export async function text(context) {
  const { canvas } = context;
  await canvas.ready;

  const text1 = new Text({
    style: {
      x: 10,
      y: 10,
      text: 'test',
      fill: 'red',
    },
  });
  canvas.appendChild(text1);

  // CJK
  const text2 = text1.cloneNode();
  text2.style.text = '中文';
  text2.style.textAlign = 'center';
  text2.style.textBaseline = 'middle';
  text2.setPosition(100, 100);
  canvas.appendChild(text2);

  // word wrap
  const text3 = text1.cloneNode();
  text3.style.text = 'aaaaaaaaaaaaaaaaaaaaa';
  text3.style.wordWrap = true;
  text3.style.wordWrapWidth = 80;
  text3.setPosition(100, 80);
  canvas.appendChild(text3);

  // with stroke
  const text4 = text1.cloneNode();
  text4.style.stroke = 'white';
  text4.style.lineWidth = 2;
  text4.setPosition(10, 80);
  canvas.appendChild(text4);

  // text transform
  const text5 = text1.cloneNode();
  text5.style.textTransform = 'capitalize';
  text5.setPosition(10, 60);
  canvas.appendChild(text5);
  const text6 = text1.cloneNode();
  text6.style.textTransform = 'uppercase';
  text6.setPosition(10, 40);
  canvas.appendChild(text6);

  // letter spacing
  const text7 = text1.cloneNode();
  text7.style.letterSpacing = 2;
  text7.setPosition(10, 100);
  canvas.appendChild(text7);

  // dx/dy
  const text8 = text1.cloneNode();
  text8.style.dx = 20;
  text8.style.dy = 10;
  text8.setPosition(10, 120);
  canvas.appendChild(text8);

  // dx/dy use relative units
  // const text9 = text1.cloneNode();
  // text9.style.dx = '1rem';
  // text9.style.dy = '1em';
  // text9.setPosition(10, 140);
  // canvas.appendChild(text9);

  // text overflow
  const text10 = text1.cloneNode();
  text10.style.text = 'aaaaaaaaaaaaaaaaaaaaa';
  text10.style.wordWrap = true;
  text10.style.wordWrapWidth = 80;
  text10.style.maxLines = 1;
  text10.style.textOverflow = 'ellipsis';
  text10.setPosition(100, 140);
  canvas.appendChild(text10);
}
