import { Text } from '@antv/g';

export async function textDecoration(context) {
  const { canvas } = context;
  await canvas.ready;

  // Test underline
  const text1 = new Text({
    style: {
      x: 50,
      y: 50,
      text: 'Underline Text',
      fontSize: 20,
      fill: 'black',
      textDecorationLine: 'underline',
      textDecorationColor: 'red',
      textDecorationStyle: 'solid',
    },
  });
  canvas.appendChild(text1);

  // Test overline
  const text2 = new Text({
    style: {
      x: 50,
      y: 100,
      text: 'Overline Text',
      fontSize: 20,
      fill: 'black',
      textDecorationLine: 'overline',
      textDecorationColor: 'blue',
      textDecorationStyle: 'solid',
    },
  });
  canvas.appendChild(text2);

  // Test line-through
  const text3 = new Text({
    style: {
      x: 50,
      y: 150,
      text: 'Line-through Text',
      fontSize: 20,
      fill: 'black',
      textDecorationLine: 'line-through',
      textDecorationColor: 'green',
      textDecorationStyle: 'solid',
    },
  });
  canvas.appendChild(text3);

  // Test multiple decorations
  const text4 = new Text({
    style: {
      x: 50,
      y: 200,
      text: 'Underline and Overline',
      fontSize: 20,
      fill: 'black',
      textDecorationLine: 'underline overline',
      textDecorationColor: 'purple',
      textDecorationStyle: 'solid',
    },
  });
  canvas.appendChild(text4);

  // Test dashed underline
  const text5 = new Text({
    style: {
      x: 50,
      y: 250,
      text: 'Dashed Underline',
      fontSize: 20,
      fill: 'black',
      textDecorationLine: 'underline',
      textDecorationColor: 'orange',
      textDecorationStyle: 'dashed',
    },
  });
  canvas.appendChild(text5);

  // Test dotted underline
  const text6 = new Text({
    style: {
      x: 50,
      y: 300,
      text: 'Dotted Underline',
      fontSize: 20,
      fill: 'black',
      textDecorationLine: 'underline',
      textDecorationColor: 'brown',
      textDecorationStyle: 'dotted',
    },
  });
  canvas.appendChild(text6);

  // Test wavy underline
  const text7 = new Text({
    style: {
      x: 50,
      y: 350,
      text: 'Wavy Underline',
      fontSize: 20,
      fill: 'black',
      textDecorationLine: 'underline',
      textDecorationColor: 'pink',
      textDecorationStyle: 'wavy',
    },
  });
  canvas.appendChild(text7);

  // Test none (should remove any decoration)
  const text8 = new Text({
    style: {
      x: 50,
      y: 400,
      text: 'No Decoration',
      fontSize: 20,
      fill: 'black',
      textDecorationLine: 'none',
    },
  });
  canvas.appendChild(text8);

  // Test textDecorationThickness
  const text9 = new Text({
    style: {
      x: 50,
      y: 450,
      text: 'Thick Underline',
      fontSize: 20,
      fill: 'black',
      textDecorationLine: 'underline',
      textDecorationColor: 'red',
      textDecorationStyle: 'solid',
      textDecorationThickness: 3,
    },
  });
  canvas.appendChild(text9);

  // Test textDecorationThickness with dashed style
  const text10 = new Text({
    style: {
      x: 50,
      y: 500,
      text: 'Thick Dashed',
      fontSize: 20,
      fill: 'black',
      textDecorationLine: 'underline',
      textDecorationColor: 'blue',
      textDecorationStyle: 'dashed',
      textDecorationThickness: 4,
    },
  });
  canvas.appendChild(text10);
}
