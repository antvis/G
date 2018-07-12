/**
 * Created by Elaine on 2018/5/7.
 */
const expect = require('chai').expect;
const {
  resolve
} = require('path');
const G = require('../../../../src/index');
const Canvas = G.Canvas;

const div = document.createElement('div');
div.id = 'canvas-img';
document.body.appendChild(div);

describe('Image', () => {

  const can1 = document.createElement('canvas');
  can1.id = 'img1';
  can1.width = 800;
  can1.height = 800;
  const ctx = can1.getContext('2d');
  ctx.lineWidth = 5;
  ctx.rect(20, 20, 150, 100);
  ctx.stroke();

  const canvas = new Canvas({
    containerId: 'canvas-img',
    width: 800,
    height: 800,
    pixelRatio: 1,
    renderer: 'svg'
  });

  const image = new G.Image({
    attrs: {
      x: 0,
      y: 0,
      width: 0,
      height: 0
    }
  });
  it('init attr', () => {
    expect(image.attr('x')).to.equal(0);
    expect(image.attr('y')).to.equal(0);
    expect(image.attr('img')).to.be.undefined;
    expect(image.attr('width')).to.equal(0);
    expect(image.attr('height')).to.equal(0);
    expect(image.attr('sx')).to.be.undefined;
    expect(image.attr('sy')).to.be.undefined;
    expect(image.attr('swidth')).to.be.undefined;
    expect(image.attr('sheight')).to.be.undefined;
    const box = image.getBBox();
    expect(box.minX).to.equal(0);
    expect(box.maxX).to.equal(0);
    expect(box.minY).to.equal(0);
    expect(box.maxY).to.equal(0);
  });

  it('img', done => {
    const img = new Image();
    img.onload = () => {
      image.attr('img', img);
      canvas.add(image);
      canvas.draw();
      const box = image.getBBox();
      expect(box.minX).to.equal(0);
      expect(box.minY).to.equal(0);
      expect(box.maxX).to.equal(768);
      expect(box.maxY).to.equal(1024);
      done();
    };
    img.src = resolve(process.cwd(), './test/fixtures/test1.jpg'); // relative to test/unit
  });


  // todo 是否需要支持直接引用一个canvas的场景
    /* it('canvas', () => {
    const image = new G.Image({
      attrs: {
        x: 0,
        y: 0
      }
    });
    const img = can1;
    image.attr('img', img);
    canvas.add(image);
    canvas.draw();
    const box = image.getBBox();
    expect(box.minX).to.equal(0);
    expect(box.minY).to.equal(0);
    expect(box.maxX).to.equal(800);
    expect(box.maxY).to.equal(800);

  });*/

  it('imageData', done => {
    const image = new G.Image({
      attrs: {
        x: 0,
        y: 0
      }
    });
    const img = can1.getContext('2d').getImageData(0, 0, 800, 800);
    image.attr('img', img);
    canvas.add(image);
    canvas.draw();
    const box = image.getBBox();
    expect(box.minX).to.equal(0);
    expect(box.minY).to.equal(0);
    expect(box.maxX).to.equal(800);
    expect(box.maxY).to.equal(800);

    done();
  });

  it('width', () => {
    expect(image.attr('width')).to.equal(768);
    image.attr('width', 200);
    expect(image.attr('width')).to.equal(200);
    const box = image.getBBox();
    expect(box.minX).to.equal(0);
    expect(box.maxX).to.equal(200);
    canvas.draw();
  });

  it('height', () => {
    expect(image.attr('height')).to.equal(1024);
    image.attr('height', 200);
    expect(image.attr('height')).to.equal(200);
    const box = image.getBBox();
    expect(box.minY).to.equal(0);
    expect(box.maxY).to.equal(200);
    canvas.draw();
  });

  it('x', () => {
    image.attr('x', 10);
    expect(image.attr('x')).to.equal(10);
    const box = image.getBBox();
    expect(box.minX).to.equal(10);
    expect(box.maxX).to.equal(210);
    canvas.draw();
  });

  it('y', () => {
    image.attr('y', 10);
    expect(image.attr('y')).to.equal(10);
    const box = image.getBBox();
    expect(box.minY).to.equal(10);
    expect(box.maxY).to.equal(210);
    canvas.draw();
  });

  // todo 是否需要支持子图和位移功能？
  /* it('sx, sy, swidth, sheight', () => {
    image.attr({
      sx: 20,
      sy: 20,
      swidth: 100,
      sheight: 200
    });
    canvas.draw();
  });

  it('normal use', () => {
    const image1 = new G.Image({
      attrs: {
        x: 300,
        y: 300,
        width: 300,
        height: 300,
        // img: '../fixtures/test2.jpg' // relative to test/unit
        img: resolve(process.cwd(), './test/fixtures/test1.jpg') // relative to test/unit
      }
    });
    canvas.add(image1);
    canvas.draw();
  });
*/
  it('image onload && image.remove(true)', () => {
    const image = new G.Image({
      attrs: {
        img: 'http://alipay-rmsdeploy-assets-private.cn-hangzhou.alipay.aliyun-inc.com/rmsportal/IHJtPedUbTUPQCx.png'
      }
    });
    canvas.add(image);
    image.remove(true);
    canvas.draw();
  });
});
