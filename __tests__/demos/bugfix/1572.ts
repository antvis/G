import { Text, Rect } from '@antv/g';

export async function gradient_text(context) {
  const { canvas } = context;
  await canvas.ready;

  const rect = new Rect({
    style: {
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      fill: 'linear-gradient(90deg, red 0%, green 100%)',
    },
  });
  canvas.appendChild(rect);

  const text = new Text({
    style: {
      text: `两种渐变都有一个叫做 gradientUnits（渐变单元）的属性，它描述了用来描述渐变的大小和方向的单元系统。该属性有两个值：userSpaceOnUse 、objectBoundingBox。默认值为 objectBoundingBox，我们目前看到的效果都是在这种系统下的，它大体上定义了对象的渐变大小范围，所以你只要指定从 0 到 1 的坐标值，渐变就会自动的缩放到对象相同大小。userSpaceOnUse 使用绝对单元，所以你必须知道对象的位置，并将渐变放在同样地位置上。在每个.shp,.shx与.dbf文件之中，图形在每个文件的排序是一致的。也就是说，.shp的第一条记录与.shx及.dbf之中的第一条记录相对应，如此类推。此外，在.shp与.shx之中，有许多字段的字节序是不一样的。因此用户在编写读取这些文件格式的程序时，必须十分小心地处理不同文件的不同字节序。`,
      x: 0,
      y: 0,
      //   dy: 10,
      textBaseline: 'top',
      wordWrap: true,
      wordWrapWidth: 800,
      fill: 'linear-gradient(90deg, red 0%, green 100%)',
    },
  });
  canvas.appendChild(text);

  const rect2 = new Rect({
    style: {
      x: 0,
      y: 200,
      width: 100,
      height: 100,
      fill: 'linear-gradient(90deg, red 0.1%, green 100%)',
    },
  });
  canvas.appendChild(rect2);
  const text2 = new Text({
    style: {
      text: `两种渐变都有一个叫做 gradientUnits（渐变单元）的属性，它描述了用来描述渐变的大小和方向的单元系统。该属性有两个值：userSpaceOnUse 、objectBoundingBox。默认值为 objectBoundingBox，我们目前看到的效果都是在这种系统下的，它大体上定义了对象的渐变大小范围，所以你只要指定从 0 到 1 的坐标值，渐变就会自动的缩放到对象相同大小。userSpaceOnUse 使用绝对单元，所以你必须知道对象的位置，并将渐变放在同样地位置上。在每个.shp,.shx与.dbf文件之中，图形在每个文件的排序是一致的。也就是说，.shp的第一条记录与.shx及.dbf之中的第一条记录相对应，如此类推。此外，在.shp与.shx之中，有许多字段的字节序是不一样的。因此用户在编写读取这些文件格式的程序时，必须十分小心地处理不同文件的不同字节序。`,
      x: 0,
      y: 200,
      //   dy: 10,
      textBaseline: 'top',
      wordWrap: true,
      wordWrapWidth: 800,
      fill: 'linear-gradient(90deg, red 0.1%, green 100%)',
    },
  });
  canvas.appendChild(text2);
}
