var expect = require('@ali/expect.js');
var G = require('../../src/g/index');
var Util = require('@ali/g-util');
var Canvas = require('../../src/canvas');
var div = document.createElement('div');
div.id = 'canvas-img';
document.body.appendChild(div);

describe('Image', function() {
  
  var can1 = document.createElement('canvas');
  can1.id = 'img1';
  can1.width = 800;
  can1.height = 800;
  var canvas = new Canvas({
    containerId: 'canvas-img',
    width: 200,
    height: 200,
    pixelRatio: 1
  });
  G.debug(true);
  var image = new G.Image({
    attrs: {
      x: 0,
      y: 0,
      width: 0,
      height: 0
    }
  });
  it('init attr', function(){
    expect(image.attr('x')).to.be(0);
    expect(image.attr('y')).to.be(0);
    expect(image.attr('img')).to.be(undefined);
    expect(image.attr('width')).to.be(0);
    expect(image.attr('height')).to.be(0);
    expect(image.attr('sx')).to.be(undefined);
    expect(image.attr('sy')).to.be(undefined);
    expect(image.attr('swidth')).to.be(undefined);
    expect(image.attr('sheight')).to.be(undefined);
    var box = image.getBBox();
    expect(box.minX).to.be(0);
    expect(box.maxX).to.be(0);
    expect(box.minY).to.be(0);
    expect(box.maxY).to.be(0);
  });

  it('img', function(done) {
    var img = new Image();
    img.onload = function() {
      image.attr('img', img);
      var box = image.getBBox();
      expect(box.minX).to.be(0);
      expect(box.minY).to.be(0);
      expect(box.maxX).to.be(768);
      expect(box.maxY).to.be(1024);
      canvas.add(image);
      canvas.draw();
      done();
    };
    img.src = '../examples/test1.jpg';
  });

  it('canvas', function() {
    var image = new G.Image({
      attrs: {
        x: 0,
        y: 0
      }
    });
    var img = can1;
    image.attr('img', img);
    var box = image.getBBox();
    expect(box.minX).to.be(0);
    expect(box.minY).to.be(0);
    expect(box.maxX).to.be(800);
    expect(box.maxY).to.be(800);
    canvas.add(image);
    canvas.draw();
  });

  it('imageData', function(done) {
    var image = new G.Image({
      attrs: {
        x: 0,
        y: 0
      }
    });
    var img = can1.getContext('2d').getImageData(0,0,800,800);
    image.attr('img', img);
    var box = image.getBBox();
    expect(box.minX).to.be(0);
    expect(box.minY).to.be(0);
    expect(box.maxX).to.be(800);
    expect(box.maxY).to.be(800);
    canvas.add(image);
    canvas.draw();
    done();
  });

  it('width', function() {
    expect(image.attr('width')).to.be(768);
    image.attr('width', 200);
    expect(image.attr('width')).to.be(200);
    var box = image.getBBox();
    expect(box.minX).to.be(0);
    expect(box.maxX).to.be(200);
    canvas.draw();
  });

  it('height', function() {
    expect(image.attr('height')).to.be(1024);
    image.attr('height', 200);
    expect(image.attr('height')).to.be(200);
    var box = image.getBBox();
    expect(box.minY).to.be(0);
    expect(box.maxY).to.be(200);
    canvas.draw();
  });

  it('x', function() {
    image.attr('x', 10);
    expect(image.attr('x')).to.be(10);
    var box = image.getBBox();
    expect(box.minX).to.be(10);
    expect(box.maxX).to.be(210);
    canvas.draw();
  });

  it('y', function() {
    image.attr('y', 10);
    expect(image.attr('y')).to.be(10);
    var box = image.getBBox();
    expect(box.minY).to.be(10);
    expect(box.maxY).to.be(210);
    canvas.draw();
  });

  it('sx, sy, swidth, sheight', function() {
    image.attr({
      sx: 20,
      sy: 20,
      swidth: 100,
      sheight: 200
    });
    canvas.draw();
  });

  it('normal use', function() {
    var image1 = new G.Image({
      attrs: {
        x: 300,
        y: 300,
        width: 300,
        height: 300,
        img: '../examples/test2.jpg'
      }
    });

    canvas.add(image1);
    canvas.draw();
  });

  it('isHit', function() {
    expect(image.isHit(10, 10)).to.be(true);
    expect(image.isHit(210, 210)).to.be(true);
    expect(image.isHit(20, 20)).to.be(true);
    expect(image.isHit(31, 43)).to.be(true);
    expect(image.isHit(300, 300)).to.be(false);
  });

  it('image onload && image.remove(true)', function() {
    var image = new G.Image({
      attrs: {
        img: 'http://alipay-rmsdeploy-assets-private.cn-hangzhou.alipay.aliyun-inc.com/rmsportal/IHJtPedUbTUPQCx.png'
      }
    });
    canvas.add(image);
    image.remove(true);
    canvas.draw();
  });
});
