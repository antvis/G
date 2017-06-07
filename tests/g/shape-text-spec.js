var expect = require('@ali/expect.js');
var G = require('../../src/g/index');
var Util = require('@ali/g-util');
var Canvas = require('../../src/canvas');
var div = document.createElement('div');
div.id = 'canvas-text';
document.body.appendChild(div);


describe('Text', function() {
  var canvas = new Canvas({
    containerId: 'canvas-text',
    width: 200,
    height: 200,
    pixelRatio: 1
  });

  var text = new G.Text({
    attrs: {
      x: 0,
      y: 0
    }
  });
  G.debug(true);
  it('init attrs', function() {
    expect(text.attr('x')).to.be(0);
    expect(text.attr('y')).to.be(0);
    expect(text.attr('text')).to.be(undefined);
    expect(text.attr('textAlign')).to.be('start');
    expect(text.attr('fontSize')).to.be(12);
    expect(text.attr('fontFamily')).to.be('sans-serif');
    expect(text.attr('fontStyle')).to.be('normal');
    expect(text.attr('fontWeight')).to.be('normal');
    expect(text.attr('fontVariant')).to.be('normal');
    expect(text.attr('font')).to.be('normal normal normal 12px sans-serif');
    expect(text.attr('textBaseline')).to.be('bottom');
    expect(text.attr('lineWidth')).to.be(1);
    expect(text.getBBox()).eql({ minX: 0,
      minY: 0,
      maxX: 0,
      maxY: 0,
      x: 0,
      y: 0,
      width: 0,
      height: 0
    });
  });

  it('text', function() {
    text.attr('text', '你好啊');
    var box = text.getBBox();
    expect(box).not.to.be(undefined);
    expect(box.minX).to.be(-0.5);
    expect(box.minY).to.be(-12.5);
    expect(box.maxX).to.be(36.5);
    expect(box.maxY).to.be(0.5);
    var text1 = new G.Text({
      attrs: {
        x: 0,
        y: 0,
        text: '你好啊'
      }
    });
    var box = text1.getBBox();
    expect(box).not.to.be(undefined);
    expect(box.minX).to.be(-0.5);
    expect(box.minY).to.be(-12.5);
    expect(box.maxX).to.be(36.5);
    expect(box.maxY).to.be(0.5);
  });

  it('x', function() {
    text.attr('x', 10);
    var box = text.getBBox();
    expect(box.minX).to.be(9.5);
    expect(box.minY).to.be(-12.5);
    expect(box.maxX).to.be(46.5);
    expect(box.maxY).to.be(0.5);
    var text1 = new G.Text({
      attrs: {
        x: 10,
        y: 0
      }
    });
    expect(text1.attr('x')).to.be(10);
    var box = text1.getBBox();
    expect(box).eql({ minX: 10,
      minY: 0,
      maxX: 10,
      maxY: 0,
      x: 10,
      y: 0,
      width: 0,
      height: 0
    });
    var text2 = new G.Text({
      attrs: {
        x: 10,
        y: 0,
        text: '你好啊'
      }
    });
    expect(text2.attr('x')).to.be(10);
    var box = text2.getBBox();
    expect(box.minX).to.be(9.5);
    expect(box.minY).to.be(-12.5);
    expect(box.maxX).to.be(46.5);
    expect(box.maxY).to.be(0.5);
  });

  it('y', function() {
    text.attr('y', 20);
    var box = text.getBBox();
    expect(box.minX).to.be(9.5);
    expect(box.minY).to.be(7.5);
    expect(box.maxX).to.be(46.5);
    expect(box.maxY).to.be(20.5);
    var text1 = new G.Text({
      attrs: {
        x: 0,
        y: 20
      }
    });
    expect(text1.attr('y')).to.be(20);
    var box = text1.getBBox();
    expect(box).eql({ minX: 0,
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
    expect(text1.attr('y')).to.be(20);
    var box = text1.getBBox();
    expect(box.minX).to.be(-0.5);
    expect(box.minY).to.be(7.5);
    expect(box.maxX).to.be(36.5);
    expect(box.maxY).to.be(20.5);
  });

  it('stroke', function() {
    text.attr({
      stroke: 'l (0) 0:#ffff00 1:rgb(0, 255, 255)'
    });
    expect(text.attr('stroke')).to.be('l (0) 0:#ffff00 1:rgb(0, 255, 255)');
    canvas.add(text);
    canvas.draw();
  });

  it('fill', function() {
    var text1 = new G.Text({
      attrs: {
        x: 50,
        y: 150,
        text: 'fill测试',
        font: '40px Arial',
        fill: 'r (0.5, 0.5, 0) 0:rgb(255, 0, 255) 0.5:#dddddd'
      }
    });
    expect(text1.attr('fill')).to.be('r (0.5, 0.5, 0) 0:rgb(255, 0, 255) 0.5:#dddddd');
    canvas.add(text1);


    canvas.draw();
  });


  it('fontSize', function() {
    expect(text.attr('fontSize')).to.be(12);
    expect(text.attr('font')).to.be('normal normal normal 12px sans-serif');
    text.attr('fontSize', 20);
    expect(text.attr('fontSize')).to.be(20);
    expect(text.attr('font')).to.be('normal normal normal 20px sans-serif');
    var text1 = new G.Text({
      attrs: {
        fontSize: 20,
        text: '你好啊啊',
        x: 20,
        y: 180,
        stroke: '#000'
      }
    });
    expect(text1.attr('fontSize')).to.be(20);
    expect(text1.attr('font')).to.be('normal normal normal 20px sans-serif');
    canvas.add(text1);
    canvas.draw();
  });

  it('fontStyle', function() {
    expect(text.attr('fontStyle')).to.be('normal');
    text.attr('fontStyle', 'italic');
    expect(text.attr('fontStyle')).to.be('italic');
    expect(text.attr('font')).to.be('italic normal normal 20px sans-serif');
    canvas.draw();
    text.attr('fontStyle', 'oblique');
    expect(text.attr('fontStyle')).to.be('oblique');
    expect(text.attr('font')).to.be('oblique normal normal 20px sans-serif');
    canvas.draw();
  });

  it('fontWeight', function() {
    expect(text.attr('fontWeight')).to.be('normal');
    text.attr('fontWeight', 'bolder');
    expect(text.attr('fontWeight')).to.be('bolder');
    expect(text.attr('font')).to.be('oblique normal bolder 20px sans-serif');
    canvas.draw();
  });

  it('fontVariant', function() {
    expect(text.attr('fontVariant')).to.be('normal');
    text.attr('fontVariant', 'small-caps');
    expect(text.attr('fontVariant')).to.be('small-caps');
    expect(text.attr('font')).to.be('oblique small-caps bolder 20px sans-serif');
    canvas.draw();
  });

  it('fontFamily', function() {
    text.attr('fontFamily', '宋体');
    expect(text.attr('fontFamily')).to.be('宋体');
    expect(text.attr('font')).to.be('oblique small-caps bolder 20px 宋体');
    canvas.draw();
  });

  it('textAlign', function() {
    expect(text.attr('textAlign')).to.be('start');
    text.attr('textAlign', 'right');
    var box = text.getBBox();
    expect(box.minX, -50.5);
    expect(box.maxX, 10.5);
    text.attr('textAlign', 'left');
    var box = text.getBBox();
    expect(box.minX, 9.5);
    expect(box.maxX, 70.5);
    text.attr('textAlign', 'end');
    var box = text.getBBox();
    expect(box.minX, -50.5);
    expect(box.maxX, 10.5);
    text.attr('textAlign', 'center');
    var box = text.getBBox();
    expect(box.minX, -20.5);
    expect(box.maxX, 40.5);
    text.attr('textAlign', 'start');
    var box = text.getBBox();
    expect(box.minX, 9.5);
    expect(box.maxX, 70.5);


    var text1 = new G.Text({
      attrs: {
        x: 0,
        y: 0,
        textAlign: 'center'
      }
    });
    expect(text1.attr('textAlign')).to.be('center');
    expect(text1.getBBox()).eql({ minX: 0,
      minY: 0,
      maxX: 0,
      maxY: 0,
      x: 0,
      y: 0,
      width: 0,
      height: 0
    });

    var text2 = new G.Text({
      attrs: {
        x: 0,
        y: 0,
        textAlign: 'center',
        text: '你好啊'
      }
    });
    expect(text2.attr('textAlign')).to.be('center');
    var box = text2.getBBox();
    expect(box.minX).to.be(-18.5);
    expect(box.maxX).to.be(18.5);
  });

  it('textBaseline', function() {
    expect(text.attr('textBaseline')).to.be('bottom');
    text.attr('textBaseline', 'top');
    var box = text.getBBox();
    expect(box.minY).to.be(19.5);
    expect(box.maxY).to.be(40.5);
    text.attr('textBaseline', 'middle');
    var box = text.getBBox();
    expect(box.minY).to.be(9.5);
    expect(box.maxY).to.be(30.5);
    text.attr('textBaseline', 'bottom');
    var box = text.getBBox();
    expect(box.minY).to.be(-0.5);
    expect(box.maxY).to.be(20.5);

    var text1 = new G.Text({
      attrs: {
        x: 0,
        y: 0,
        textBaseline: 'middle'
      }
    });
    expect(text1.attr('textBaseline')).to.be('middle');
    expect(text1.getBBox()).eql({ minX: 0,
      minY: 0,
      maxX: 0,
      maxY: 0,
      x: 0,
      y: 0,
      width: 0,
      height: 0
    });

    var text2 = new G.Text({
      attrs: {
        x: 0,
        y: 0,
        textBaseline: 'middle',
        text: '你好啊'
      }
    });
    expect(text2.attr('textBaseline')).to.be('middle');
    var box = text2.getBBox();
    expect(box.minY).to.be(-6.5);
    expect(box.maxY).to.be(6.5);
  });

  it('lineWidth', function() {
    expect(text.attr('lineWidth')).to.be(1);
    text.attr('lineWidth', 4);
    expect(text.attr('lineWidth')).to.be(4);
    var box = text.getBBox();
    expect(box.minX).to.be(8);
    expect(box.maxX).to.be(72);
    expect(box.maxY).to.be(22);
    expect(box.minY).to.be(-2);
  });

  it('isHit', function() {
    expect(text.isHit(48, 0)).to.be(true);
    expect(text.isHit(48, 24)).to.be(false);
  });


  it('normal use', function() {
    var text = new G.Text({
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
    var text1 = canvas.addShape('text', {
      attrs: {
        x: 0,
        y: 0,
        text: 'abc'
      }
    });
    expect(text1.attr('fontFamily')).to.be('sans-serif');
    var text2 = canvas.addShape('text', {
      attrs: {
        x: 0,
        y: 0,
        fontFamily: 'Arial',
        text: 'bcd'
      }
    });
    expect(text2.attr('fontFamily')).to.be('Arial');

    canvas.set('fontFamily', '宋体');
    var text3 = canvas.addShape('text', {
      attrs: {
        x: 0,
        y: 0,
        text: 'bde'
      }
    });
    expect(text3.attr('fontFamily')).to.be('宋体');
    
    canvas.set('fontFamily', null);
    var text4 = canvas.addShape('text', {
      attrs: {
        x: 0,
        y: 0,
        text: 'bde'
      }
    });

    expect(text4.attr('fontFamily')).to.be('sans-serif');
  });

});

describe('Text \n', function() {
  
  var canvas = new Canvas({
    containerId: 'canvas-text',
    width: 200,
    height: 200
  });

  var text = new G.Text({
    attrs:{
      x: 50,
      y: 50,
      text: '你好\nHello\nworkd',
      fill: 'black',
      stroke: 'red',
      textBaseline: 'top'
    }
  });
  var bbox = text.getBBox();
  var rect = new G.Rect({
    attrs: {
      x: bbox.minX,
      y: bbox.minY,
      width: bbox.maxX - bbox.minX,
      height: bbox.maxY - bbox.minY,
      stroke: 'red'
    }
  });

  G.debug(true);
  it('text /n', function() {
    expect(text.attr('x')).to.be(50);
    expect(text.attr('y')).to.be(50);
    expect(text.attr('text')).to.be('你好\nHello\nworkd');
    // expect(text.attr('width')).to.be(35.68794250488281);
    // expect(text.attr('height')).to.be(39.36);
    expect(text.attr('textAlign')).to.be('start');
    expect(text.attr('fontSize')).to.be(12);
    expect(text.attr('fill')).to.be('black');
    expect(text.attr('fontFamily')).to.be('sans-serif');
    expect(text.attr('fontStyle')).to.be('normal');
    expect(text.attr('fontWeight')).to.be('normal');
    expect(text.attr('fontVariant')).to.be('normal');
    expect(text.attr('font')).to.be('normal normal normal 12px sans-serif');
    expect(text.attr('textBaseline')).to.be('top');
    expect(text.attr('lineWidth')).to.be(1);
  });
  canvas.add(rect);
  canvas.add(text);
  canvas.draw();
});

describe('Text 不存在', function() {
  
  var canvas = new Canvas({
    containerId: 'canvas-text',
    width: 200,
    height: 200
  });

  var text = new G.Text({
    attrs:{
      x: 50,
      y: 50,
      text: '',
      fill: 'black',
      stroke: 'red',
      textBaseline: 'top'
    }
  });
  var bbox = text.getBBox();
  var rect = new G.Rect({
    attrs: {
      x: bbox.minX,
      y: bbox.minY,
      width: bbox.maxX - bbox.minX,
      height: bbox.maxY - bbox.minY,
      stroke: 'red'
    }
  });

  G.debug(true);
  it('text 空 "" ', function() {
    expect(text.attr('x')).to.be(50);
    expect(text.attr('y')).to.be(50);
    expect(text.attr('text')).to.be('');
    // expect(text.attr('width')).to.be(35.68794250488281);
    // expect(text.attr('height')).to.be(39.36);
    expect(text.attr('textAlign')).to.be('start');
    expect(text.attr('fontSize')).to.be(12);
    expect(text.attr('fill')).to.be('black');
    expect(text.attr('fontFamily')).to.be('sans-serif');
    expect(text.attr('fontStyle')).to.be('normal');
    expect(text.attr('fontWeight')).to.be('normal');
    expect(text.attr('fontVariant')).to.be('normal');
    expect(text.attr('font')).to.be('normal normal normal 12px sans-serif');
    expect(text.attr('textBaseline')).to.be('top');
    expect(text.attr('lineWidth')).to.be(1);
    expect(text.getBBox()).eql({ minX: 50,
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
    expect(text.attr('x')).to.be(50);
    expect(text.attr('y')).to.be(50);
    expect(text.attr('text')).to.be(null);
    // expect(text.attr('width')).to.be(35.68794250488281);
    // expect(text.attr('height')).to.be(39.36);
    expect(text.attr('textAlign')).to.be('start');
    expect(text.attr('fontSize')).to.be(12);
    expect(text.attr('fill')).to.be('black');
    expect(text.attr('fontFamily')).to.be('sans-serif');
    expect(text.attr('fontStyle')).to.be('normal');
    expect(text.attr('fontWeight')).to.be('normal');
    expect(text.attr('fontVariant')).to.be('normal');
    expect(text.attr('font')).to.be('normal normal normal 12px sans-serif');
    expect(text.attr('textBaseline')).to.be('top');
    expect(text.attr('lineWidth')).to.be(1);
    expect(text.getBBox()).eql({ minX: 50,
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
    expect(text.attr('x')).to.be(50);
    expect(text.attr('y')).to.be(50);
    expect(text.attr('text')).to.be(undefined);
    // expect(text.attr('width')).to.be(35.68794250488281);
    // expect(text.attr('height')).to.be(39.36);
    expect(text.attr('textAlign')).to.be('start');
    expect(text.attr('fontSize')).to.be(12);
    expect(text.attr('fill')).to.be('black');
    expect(text.attr('fontFamily')).to.be('sans-serif');
    expect(text.attr('fontStyle')).to.be('normal');
    expect(text.attr('fontWeight')).to.be('normal');
    expect(text.attr('fontVariant')).to.be('normal');
    expect(text.attr('font')).to.be('normal normal normal 12px sans-serif');
    expect(text.attr('textBaseline')).to.be('top');
    expect(text.attr('lineWidth')).to.be(1);
    expect(text.getBBox()).eql({ minX: 50,
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
