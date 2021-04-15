const expect = require('chai').expect;
import Text from '../../../src/shape/text';
import { getColor } from '../../get-color';
const canvas = document.createElement('canvas');
canvas.width = 500;
canvas.height = 500;
document.body.appendChild(canvas);
const ctx = canvas.getContext('2d');

function drawGrid() {
  for (let i = 0; i < 5; i++) {
    const value = i * 100 + 20;
    ctx.moveTo(0, value);
    ctx.lineTo(500, value);
    ctx.moveTo(value, 0);
    ctx.lineTo(value, 500);
    ctx.stroke();
  }
}

// 验证文字是否绘制出来，扫描一条线，看看是否有对应的颜色
function getColorCount(x, y, length, color) {
  let count = 0;
  for (let i = x; i < x + length; i++) {
    if (getColor(ctx, i, y) === color) {
      count++;
    }
  }
  return count;
}

function equal(v1, v2) {
  return Math.abs(v1 - v2) < 0.001;
}

function drawBox(bbox) {
  ctx.save();
  ctx.rect(bbox.x, bbox.y, bbox.width, bbox.height);
  ctx.stroke();
  ctx.restore();
}
// 绘制栅格
drawGrid();

describe('single line text test', () => {
  const text = new Text({
    type: 'text',
    attrs: {
      x: 10,
      y: 20,
      text: 'first',
      fill: 'red',
    },
  });
  it('init', () => {
    expect(text.attr('fontSize')).eqls(12);
    expect(text.attr('text')).eqls('first');
    expect(text.get('textArr')).eqls(null);
    expect(text.attr('font')).eqls('normal normal normal 12px sans-serif');
  });

  it('change font', () => {
    text.attr('fontFamily', 'Arial');
    expect(text.attr('font')).eqls('normal normal normal 12px Arial');
  });

  it('bbox default textBaseline and align', () => {
    const bbox = text.getBBox();
    expect(bbox.minX).eqls(10);
    expect(bbox.minY).eqls(20 - 12);
  });
  it('bbox, textBaseline middle', () => {
    text.attr('textBaseline', 'middle');
    const bbox = text.getBBox();
    expect(bbox.minX).eqls(10);
    expect(bbox.minY).eqls(20 - 12 / 2);
  });

  it('bbox, textBaseline top', () => {
    text.attr('textBaseline', 'top');
    const bbox = text.getBBox();
    expect(bbox.minX).eqls(10);
    expect(bbox.minY).eqls(20);
  });

  it('bbox, textAlign right', () => {
    text.attr('textAlign', 'right');
    const bbox = text.getBBox();
    expect(bbox.minX).eqls(10 - bbox.width);
  });

  it('bbox, textAlign center', () => {
    text.attr('textAlign', 'center');
    const bbox = text.getBBox();
    expect(bbox.minX).eqls(10 - bbox.width / 2);
  });

  it('draw', () => {
    text.attr({
      x: 20,
      y: 20,
      textAlign: 'left',
      textBaseline: 'bottom',
    });
    text.draw(ctx);
    const bbox = text.getBBox();
    drawBox(bbox);
    // 通过检测颜色来判定文本的绘制情况
    expect(getColorCount(20, 12, 20, '#ff0000') > 0).eqls(true);
    expect(getColorCount(20, 20, 20, '#ff0000') > 0).eqls(false);
  });

  it('draw align right', () => {
    text.attr({
      x: 120,
      textAlign: 'right',
      text: 'align right',
    });
    text.draw(ctx);
    drawBox(text.getBBox());

    expect(getColorCount(120, 12, 20, '#ff0000') > 0).eqls(false);
    expect(getColorCount(110, 12, 10, '#ff0000') > 0).eqls(true);
    expect(getColorCount(120, 20, 20, '#ff0000') > 0).eqls(false);
  });

  it('draw align center', () => {
    text.attr({
      x: 220,
      textAlign: 'center',
      text: 'align center',
    });
    text.draw(ctx);
    drawBox(text.getBBox());
    expect(getColorCount(220, 12, 20, '#ff0000') > 0).eqls(true);
    expect(getColorCount(210, 12, 10, '#ff0000') > 0).eqls(true);
  });

  it('draw baseline default', () => {
    text.attr({
      x: 20,
      y: 120,
      textAlign: 'left',
      text: 'baseline default',
    });
    text.draw(ctx);
    drawBox(text.getBBox());

    expect(getColorCount(20, 112, 10, '#ff0000') > 0).eqls(true);
    expect(getColorCount(21, 120, 10, '#ff0000') > 0).eqls(false);
  });

  it('draw baseline middle', () => {
    text.attr({
      x: 120,
      y: 120,
      textAlign: 'left',
      textBaseline: 'middle',
      text: 'baseline middle',
    });
    text.draw(ctx);
    drawBox(text.getBBox());

    expect(getColorCount(120, 121, 20, '#ff0000') > 0).eqls(true);
    expect(getColorCount(120, 118, 20, '#ff0000') > 0).eqls(true);
    expect(getColorCount(120, 112, 20, '#ff0000') > 0).eqls(false);
  });

  it('draw baseline top', () => {
    text.attr({
      x: 220,
      y: 120,
      textAlign: 'left',
      textBaseline: 'top',
      text: 'baseline top',
    });
    text.draw(ctx);
    drawBox(text.getBBox());

    expect(getColorCount(220, 118, 20, '#ff0000') > 0).eqls(false);
    expect(getColorCount(220, 125, 20, '#ff0000') > 0).eqls(true);
    expect(getColorCount(220, 130, 20, '#ff0000') > 0).eqls(true);
  });

  it('hit', () => {
    text.attr({
      x: 20,
      y: 20,
      textAlign: 'left',
      textBaseline: 'bottom',
    });
    expect(text.isHit(21, 12)).eqls(true);
    expect(text.isHit(22, 6)).eqls(false);
    expect(text.isHit(19, 12)).eqls(false);

    text.attr('textAlign', 'right');
    expect(text.isHit(21, 12)).eqls(false);
    expect(text.isHit(19, 12)).eqls(true);
  });
});

describe('multiple lines text test', () => {
  const text = new Text({
    type: 'text',
    attrs: {
      x: 20,
      y: 220,
      text: 'defualt\ntext',
      fill: 'blue',
    },
  });

  it('init', () => {
    expect(text.get('textArr').length).eqls(2);
  });

  it('bbox two lines', () => {
    const bbox = text.getBBox();
    expect(equal(bbox.minX, 20)).eqls(true);
    expect(equal(bbox.minY, 220 - 12 * 2 - 1.68)).eqls(true);
    expect(equal(bbox.height, 12 * 2 + 1.68)).eqls(true);
  });

  it('bbox three lines', () => {
    text.attr('text', 'three\nlines\ntext');
    const bbox = text.getBBox();
    expect(equal(bbox.minX, 20)).eqls(true);
    expect(equal(bbox.minY, 220 - 12 * 3 - 1.68 * 2)).eqls(true);
    expect(equal(bbox.height, 12 * 3 + 1.68 * 2)).eqls(true);
  });

  it('draw default', () => {
    text.attr({
      text: 'default\ntext',
    });
    text.draw(ctx);
    drawBox(text.getBBox());
    expect(getColorCount(20, 215, 20, '#0000ff') > 0).eqls(true);
    expect(getColorCount(20, 221, 20, '#0000ff') > 0).eqls(false);
  });

  it('draw baseline middle', () => {
    text.attr({
      x: 120,
      text: 'three\nlines\ntext',
      textBaseline: 'middle',
    });
    text.draw(ctx);
    drawBox(text.getBBox());
    expect(getColorCount(120, 218, 20, '#0000ff') > 0).eqls(true);
    expect(getColorCount(120, 221, 20, '#0000ff') > 0).eqls(true);
  });

  it('draw null', () => {
    text.attr({
      x: 240,
      text: null,
    });
    text.draw(ctx);
    drawBox(text.getBBox());
    // 因为 null 不绘制了
    expect(getColorCount(240, 218, 20, '#0000ff') > 0).eqls(false);
    expect(getColorCount(240, 221, 20, '#0000ff') > 0).eqls(false);
  });

  it('clear', () => {
    text.destroy();
    expect(text.destroyed).eqls(true);
    canvas.parentNode.removeChild(canvas);
  });
});
