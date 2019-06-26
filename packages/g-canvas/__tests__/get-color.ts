function pixelToColor(r, g, b) {
  const rColor = fixWidth(r.toString(16));
  const gColor = fixWidth(g.toString(16));
  const bColor = fixWidth(b.toString(16));
  // 本来一行代码的问题，必须使用字符串模板，写成丑陋的 4行
  return `#${rColor}${gColor}${bColor}`;
}

function fixWidth(str) {
  if (str.length < 2) {
    return `0${str}`;
  }
  return str;
}

export function getColor(ctx, x, y) {
  const data = ctx.getImageData(x, y, 1, 1).data;
  return pixelToColor(data[0], data[1], data[2]);
}

export function colorToValue(color) {
  const str = color.substr(1);
  return parseInt(str, 16);
}
