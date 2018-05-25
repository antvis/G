const expect = require('chai').expect;
const G = require('../../../src/index');
const Canvas = require('../../../src/canvas');
const div = document.createElement('div');
div.id = 'canvas-text';
document.body.appendChild(div);


describe('Text', function() {
  const canvas = new Canvas({
    containerId: 'canvas-text',
    width: 200,
    height: 200,
    pixelRatio: 1
  });

  const text = new G.Text({
    attrs: {
      x: 0,
      y: 0,
      fontFamily: 'Arial'
    }
  });

  it('init attrs', function() {
    expect(text.attr('x')).to.equal(0);
    expect(text.attr('y')).to.equal(0);
    expect(text.attr('text')).to.be.undefined;
    expect(text.attr('textAlign')).to.equal('start');
    expect(text.attr('fontSize')).to.equal(12);
    expect(text.attr('fontFamily')).to.equal('Arial');
    expect(text.attr('fontStyle')).to.equal('normal');
    expect(text.attr('fontWeight')).to.equal('normal');
    expect(text.attr('fontVariant')).to.equal('normal');
    expect(text.attr('font')).to.equal('normal normal normal 12px Arial');
    expect(text.attr('textBaseline')).to.equal('bottom');
    expect(text.attr('lineWidth')).to.equal(1);
    expect(text.getBBox()).to.eql({ minX: 0,
      minY: 0,
      maxX: 0,
      maxY: 0,
      x: 0,
      y: 0,
      width: 0,
      height: 0
    });
  });

  xit('text', function() {
    text.attr('text', '你好啊');
    let box = text.getBBox();
    expect(box).not.to.be.undefined;
    expect(box.minX).to.equal(-0.5);
    expect(box.minY).to.equal(-12.5);
    expect(box.maxX).to.equal(36.5);
    expect(box.maxY).to.equal(0.5);
    const text1 = new G.Text({
      attrs: {
        x: 0,
        y: 0,
        text: '你好啊'
      }
    });
    box = text1.getBBox();
    expect(box).not.to.be.undefined;
    expect(box.minX).to.equal(-0.5);
    expect(box.minY).to.equal(-12.5);
    expect(box.maxX).to.equal(36.5);
    expect(box.maxY).to.equal(0.5);
  });

  xit('x', function() {
    text.attr('x', 10);
    let box = text.getBBox();
    expect(box.minX).to.equal(9.5);
    expect(box.minY).to.equal(-12.5);
    expect(box.maxX).to.equal(46.5);
    expect(box.maxY).to.equal(0.5);
    const text1 = new G.Text({
      attrs: {
        x: 10,
        y: 0
      }
    });
    expect(text1.attr('x')).to.equal(10);
    box = text1.getBBox();
    expect(box).to.eql({ minX: 10,
      minY: 0,
      maxX: 10,
      maxY: 0,
      x: 10,
      y: 0,
      width: 0,
      height: 0
    });
    const text2 = new G.Text({
      attrs: {
        x: 10,
        y: 0,
        text: '你好啊'
      }
    });
    expect(text2.attr('x')).to.equal(10);
    box = text2.getBBox();
    expect(box.minX).to.equal(9.5);
    expect(box.minY).to.equal(-12.5);
    expect(box.maxX).to.equal(46.5);
    expect(box.maxY).to.equal(0.5);
  });

  xit('y', function() {
    text.attr('y', 20);
    let box = text.getBBox();
    expect(box.minX).to.equal(9.5);
    expect(box.minY).to.equal(7.5);
    expect(box.maxX).to.equal(46.5);
    expect(box.maxY).to.equal(20.5);
    const text1 = new G.Text({
      attrs: {
        x: 0,
        y: 20
      }
    });
    expect(text1.attr('y')).to.equal(20);
    box = text1.getBBox();
    expect(box).to.eql({ minX: 0,
      minY: 20,
      maxX: 0,
      maxY: 20,
      x: 0,
      y: 20,
      width: 0,
      height: 0
    });
    text1.attr({
      x: 0,
      y: 20,
      text: '你好啊'
    });
    expect(text1.attr('y')).to.equal(20);
    box = text1.getBBox();
    expect(box.minX).to.equal(-0.5);
    expect(box.minY).to.equal(7.5);
    expect(box.maxX).to.equal(36.5);
    expect(box.maxY).to.equal(20.5);
  });

  it('stroke', function() {
    text.attr({
      stroke: 'l (0) 0:#ffff00 1:rgb(0, 255, 255)'
    });
    expect(text.attr('stroke')).to.equal('l (0) 0:#ffff00 1:rgb(0, 255, 255)');
    canvas.add(text);
    canvas.draw();
  });

  it('fill', function() {
    const text1 = new G.Text({
      attrs: {
        x: 50,
        y: 150,
        text: 'fill测试',
        font: '40px Arial',
        fill: 'r (0.5, 0.5, 0) 0:rgb(255, 0, 255) 0.5:#dddddd'
      }
    });
    expect(text1.attr('fill')).to.equal('r (0.5, 0.5, 0) 0:rgb(255, 0, 255) 0.5:#dddddd');
    canvas.add(text1);


    canvas.draw();
  });


  it('fontSize', function() {
    expect(text.attr('fontSize')).to.equal(12);
    expect(text.attr('font')).to.equal('normal normal normal 12px Arial');
    text.attr('fontSize', 20);
    expect(text.attr('fontSize')).to.equal(20);
    expect(text.attr('font')).to.equal('normal normal normal 20px Arial');
    const text1 = new G.Text({
      attrs: {
        fontSize: 20,
        text: '你好啊啊',
        x: 20,
        y: 180,
        stroke: '#000'
      }
    });
    expect(text1.attr('fontSize')).to.equal(20);
    expect(text1.attr('font')).to.equal('normal normal normal 20px sans-serif');
    canvas.add(text1);
    canvas.draw();
  });

  it('fontSize < 12', function() {
    const text = new G.Text({
      attrs: {
        fontSize: 10,
        text: '你好啊啊',
        x: 100,
        y: 180,
        stroke: '#000'
      }
    });
    expect(text.attr('fontSize')).to.equal(10);
    expect(text.attr('font')).to.equal('normal normal normal 10px sans-serif');
    expect(text.getMatrix()).not.eql([ 1, 0, 0, 0, 1, 0, 0, 0, 1 ]);
    canvas.add(text);
    canvas.draw();
  });

  it('fontStyle', function() {
    expect(text.attr('fontStyle')).to.equal('normal');
    text.attr('fontStyle', 'italic');
    expect(text.attr('fontStyle')).to.equal('italic');
    expect(text.attr('font')).to.equal('italic normal normal 20px Arial');
    canvas.draw();
    text.attr('fontStyle', 'oblique');
    expect(text.attr('fontStyle')).to.equal('oblique');
    expect(text.attr('font')).to.equal('oblique normal normal 20px Arial');
    canvas.draw();
  });

  it('fontWeight', function() {
    expect(text.attr('fontWeight')).to.equal('normal');
    text.attr('fontWeight', 'bolder');
    expect(text.attr('fontWeight')).to.equal('bolder');
    expect(text.attr('font')).to.equal('oblique normal bolder 20px Arial');
    canvas.draw();
  });

  it('fontVariant', function() {
    expect(text.attr('fontVariant')).to.equal('normal');
    text.attr('fontVariant', 'small-caps');
    expect(text.attr('fontVariant')).to.equal('small-caps');
    expect(text.attr('font')).to.equal('oblique small-caps bolder 20px Arial');
    canvas.draw();
  });

  it('fontFamily', function() {
    text.attr('fontFamily', '宋体');
    expect(text.attr('fontFamily')).to.equal('宋体');
    expect(text.attr('font')).to.equal('oblique small-caps bolder 20px 宋体');
    canvas.draw();
  });

  xit('textAlign', function() {
    expect(text.attr('textAlign')).to.equal('start');
    text.attr('textAlign', 'right');
    let box = text.getBBox();
    expect(box.minX, -50.5);
    expect(box.maxX, 10.5);
    text.attr('textAlign', 'left');
    box = text.getBBox();
    expect(box.minX, 9.5);
    expect(box.maxX, 70.5);
    text.attr('textAlign', 'end');
    box = text.getBBox();
    expect(box.minX, -50.5);
    expect(box.maxX, 10.5);
    text.attr('textAlign', 'center');
    box = text.getBBox();
    expect(box.minX, -20.5);
    expect(box.maxX, 40.5);
    text.attr('textAlign', 'start');
    box = text.getBBox();
    expect(box.minX, 9.5);
    expect(box.maxX, 70.5);


    const text1 = new G.Text({
      attrs: {
        x: 0,
        y: 0,
        textAlign: 'center'
      }
    });
    expect(text1.attr('textAlign')).to.equal('center');
    expect(text1.getBBox()).eql({ minX: 0,
      minY: 0,
      maxX: 0,
      maxY: 0,
      x: 0,
      y: 0,
      width: 0,
      height: 0
    });

    const text2 = new G.Text({
      attrs: {
        x: 0,
        y: 0,
        textAlign: 'center',
        text: '你好啊'
      }
    });
    expect(text2.attr('textAlign')).to.equal('center');
    box = text2.getBBox();
    expect(box.minX).to.equal(-18.5);
    expect(box.maxX).to.equal(18.5);
  });

  xit('textBaseline', function() {
    expect(text.attr('textBaseline')).to.equal('bottom');
    text.attr('textBaseline', 'top');
    let box = text.getBBox();
    expect(box.minY).to.equal(19.5);
    expect(box.maxY).to.equal(40.5);
    text.attr('textBaseline', 'middle');
    box = text.getBBox();
    expect(box.minY).to.equal(9.5);
    expect(box.maxY).to.equal(30.5);
    text.attr('textBaseline', 'bottom');
    box = text.getBBox();
    expect(box.minY).to.equal(-0.5);
    expect(box.maxY).to.equal(20.5);

    const text1 = new G.Text({
      attrs: {
        x: 0,
        y: 0,
        textBaseline: 'middle'
      }
    });
    expect(text1.attr('textBaseline')).to.equal('middle');
    expect(text1.getBBox()).eql({ minX: 0,
      minY: 0,
      maxX: 0,
      maxY: 0,
      x: 0,
      y: 0,
      width: 0,
      height: 0
    });

    const text2 = new G.Text({
      attrs: {
        x: 0,
        y: 0,
        textBaseline: 'middle',
        text: '你好啊'
      }
    });
    expect(text2.attr('textBaseline')).to.equal('middle');
    box = text2.getBBox();
    expect(box.minY).to.equal(-6.5);
    expect(box.maxY).to.equal(6.5);
  });

  xit('lineWidth', function() {
    expect(text.attr('lineWidth')).to.equal(1);
    text.attr('lineWidth', 4);
    expect(text.attr('lineWidth')).to.equal(4);
    const box = text.getBBox();
    expect(box.minX).to.equal(8);
    expect(box.maxX).to.equal(72);
    expect(box.maxY).to.equal(22);
    expect(box.minY).to.equal(-2);
  });

  xit('isHit', function() {
    expect(text.isHit(48, 0)).to.be.true;
    expect(text.isHit(48, 24)).to.be.false;
  });


  it('normal use', function() {
    const text = new G.Text({
      attrs: {
        text: 'hello world',
        x: 50,
        y: 50,
        fill: 'red'
      }
    });
    canvas.add(text);
    canvas.draw();
  });

  it('add text fontFamily', function() {
    const text1 = canvas.addShape('text', {
      attrs: {
        x: 0,
        y: 0,
        text: 'abc'
      }
    });
    expect(text1.attr('fontFamily')).to.equal('sans-serif');
    const text2 = canvas.addShape('text', {
      attrs: {
        x: 0,
        y: 0,
        fontFamily: 'Arial',
        text: 'bcd'
      }
    });
    expect(text2.attr('fontFamily')).to.equal('Arial');

    canvas.set('fontFamily', '宋体');
    const text3 = canvas.addShape('text', {
      attrs: {
        x: 0,
        y: 0,
        text: 'bde'
      }
    });
    expect(text3.attr('fontFamily')).to.equal('宋体');

    canvas.set('fontFamily', null);
    const text4 = canvas.addShape('text', {
      attrs: {
        x: 0,
        y: 0,
        text: 'bde'
      }
    });

    expect(text4.attr('fontFamily')).to.equal('sans-serif');
  });

});

describe('Text \n', function() {

  const canvas = new Canvas({
    containerId: 'canvas-text',
    width: 200,
    height: 200
  });

  const text = new G.Text({
    attrs: {
      x: 50,
      y: 50,
      text: '你好\nHello\nworld',
      fill: 'black',
      stroke: 'red',
      textBaseline: 'top'
    }
  });
  const bbox = text.getBBox();
  const rect = new G.Rect({
    attrs: {
      x: bbox.minX,
      y: bbox.minY,
      width: bbox.maxX - bbox.minX,
      height: bbox.maxY - bbox.minY,
      stroke: 'red'
    }
  });

  it('text outline', () => {
    const text = new G.Text({
      attrs: {
        x: 100,
        y: 100,
        fontSize: 20,
        text: 'outline',
        fill: 'peachpuff',
        stroke: 'crimson'
      }
    });
    canvas.add(text);
    canvas.draw();
  });
  it('text /n', function() {
    expect(text.attr('x')).to.equal(50);
    expect(text.attr('y')).to.equal(50);
    expect(text.attr('text')).to.equal('你好\nHello\nworld');
    expect(text.attr('textAlign')).to.equal('start');
    expect(text.attr('fontSize')).to.equal(12);
    expect(text.attr('fill')).to.equal('black');
    expect(text.attr('fontFamily')).to.equal('sans-serif');
    expect(text.attr('fontStyle')).to.equal('normal');
    expect(text.attr('fontWeight')).to.equal('normal');
    expect(text.attr('fontVariant')).to.equal('normal');
    expect(text.attr('font')).to.equal('normal normal normal 12px sans-serif');
    expect(text.attr('textBaseline')).to.equal('top');
    expect(text.attr('lineWidth')).to.equal(1);
  });
  canvas.add(rect);
  canvas.add(text);
  canvas.draw();
});

describe('Text 不存在', function() {

  const canvas = new Canvas({
    containerId: 'canvas-text',
    width: 200,
    height: 200
  });

  const text = new G.Text({
    attrs: {
      x: 50,
      y: 50,
      text: '',
      fill: 'black',
      stroke: 'red',
      textBaseline: 'top'
    }
  });
  const bbox = text.getBBox();
  const rect = new G.Rect({
    attrs: {
      x: bbox.minX,
      y: bbox.minY,
      width: bbox.maxX - bbox.minX,
      height: bbox.maxY - bbox.minY,
      stroke: 'red'
    }
  });


  it('text 空 "" ', function() {
    expect(text.attr('x')).to.equal(50);
    expect(text.attr('y')).to.equal(50);
    expect(text.attr('text')).to.equal('');
    expect(text.attr('textAlign')).to.equal('start');
    expect(text.attr('fontSize')).to.equal(12);
    expect(text.attr('fill')).to.equal('black');
    expect(text.attr('fontFamily')).to.equal('sans-serif');
    expect(text.attr('fontStyle')).to.equal('normal');
    expect(text.attr('fontWeight')).to.equal('normal');
    expect(text.attr('fontVariant')).to.equal('normal');
    expect(text.attr('font')).to.equal('normal normal normal 12px sans-serif');
    expect(text.attr('textBaseline')).to.equal('top');
    expect(text.attr('lineWidth')).to.equal(1);
    expect(text.getBBox()).to.eql({ minX: 50,
      minY: 50,
      maxX: 50,
      maxY: 50,
      x: 50,
      y: 50,
      width: 0,
      height: 0
    });
  });
  canvas.add(rect);
  canvas.add(text);
  canvas.draw();
  it('text null ', function() {
    text.attr('text', null);
    expect(text.attr('x')).to.equal(50);
    expect(text.attr('y')).to.equal(50);
    expect(text.attr('text')).to.be.null;
    expect(text.attr('textAlign')).to.equal('start');
    expect(text.attr('fontSize')).to.equal(12);
    expect(text.attr('fill')).to.equal('black');
    expect(text.attr('fontFamily')).to.equal('sans-serif');
    expect(text.attr('fontStyle')).to.equal('normal');
    expect(text.attr('fontWeight')).to.equal('normal');
    expect(text.attr('fontVariant')).to.equal('normal');
    expect(text.attr('font')).to.equal('normal normal normal 12px sans-serif');
    expect(text.attr('textBaseline')).to.equal('top');
    expect(text.attr('lineWidth')).to.equal(1);
    expect(text.getBBox()).to.eql({ minX: 50,
      minY: 50,
      maxX: 50,
      maxY: 50,
      x: 50,
      y: 50,
      width: 0,
      height: 0
    });
  });
  canvas.add(rect);
  canvas.add(text);
  canvas.draw();
  it('text undefined ', function() {
    text.attr('text', undefined);
    expect(text.attr('x')).to.equal(50);
    expect(text.attr('y')).to.equal(50);
    expect(text.attr('text')).to.be.undefined;
    expect(text.attr('textAlign')).to.equal('start');
    expect(text.attr('fontSize')).to.equal(12);
    expect(text.attr('fill')).to.equal('black');
    expect(text.attr('fontFamily')).to.equal('sans-serif');
    expect(text.attr('fontStyle')).to.equal('normal');
    expect(text.attr('fontWeight')).to.equal('normal');
    expect(text.attr('fontVariant')).to.equal('normal');
    expect(text.attr('font')).to.equal('normal normal normal 12px sans-serif');
    expect(text.attr('textBaseline')).to.equal('top');
    expect(text.attr('lineWidth')).to.equal(1);
    expect(text.getBBox()).to.eql({ minX: 50,
      minY: 50,
      maxX: 50,
      maxY: 50,
      x: 50,
      y: 50,
      width: 0,
      height: 0
    });
  });
  canvas.add(rect);
  canvas.add(text);
  canvas.draw();
});
