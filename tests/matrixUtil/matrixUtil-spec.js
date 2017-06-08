var $ = require('jquery');

var expect = require('@ali/expect.js');
var matrixUtil = require('../../src/util/matrix');
var Matrix = require('@ali/g-matrix');
var Matrix3 = Matrix.Matrix3;
var Canvas = require('../../src/canvas');

$('<div id="test_matrixUtil"></div>').appendTo('body');

var canvas = new Canvas({
  containerId: 'test_matrixUtil',
  width: 500,
  height: 500
});

describe('测试矩阵工具',function(){
  it('基于某点缩放', function(){
    var group = canvas.addGroup();
    var circle = group.addShape("circle", {
      attrs: {
        x: 250,
        y: 250,
        r: 50,
        fill: '#FED443'
      }
    });
    var animPoint = canvas.addShape("circle", {
      attrs: {
        x: 250,
        y: 250,
        r:3,
        fill: 'blue'
      }
    });
    var matrix = new Matrix3();
    var bboxOrigin = circle.getBBox();
    var bbox;
    matrix = matrixUtil.scale(matrix, 2, 2, 250, 250);
    circle.setMatrix(matrix);
    bbox = group.getBBox();
    expect(bbox.x + bbox.width / 2).to.be(250);
    expect(bbox.y + bbox.height / 2).to.be(250);
    expect(bbox.width).to.be(202); //边框有值 ＋2
    expect(bbox.height).to.be(202); //边框有值 ＋2
    canvas.draw();
  });
  it('基于某点旋转', function(){
    var matrix = new Matrix3();
    var rst = matrixUtil.rotate(matrix, parseFloat(10) / 180 * Math.PI, 300, 300);
    matrix.translate(-300, -300);
    matrix.rotate(parseFloat(10) / 180 * Math.PI);
    matrix.translate(300, 300);
    expect(Matrix3.equal(matrix, rst)).to.be(true);
  });
  it('变换 transform', function(){
    var matrix = new Matrix3();
    var rst = matrixUtil.transform(matrix, [
      ['t', 100, 200],
      ['s', 0.2, 0.3],
      ['r', Math.PI],
      ['m', new Matrix3()],
      ['null', 10101010101]
    ]);
    matrix.translate(100, 200);
    matrix.scale(0.2, 0.3);
    matrix.rotate(Math.PI);
    matrix.multiply(new Matrix3());
    expect(Matrix3.equal(matrix, rst)).to.be(true);
  });
  it('判断是否是3阶矩阵', function(){
    var matrix = new Matrix3();
    expect(matrixUtil.isMatrix3(matrix)).to.be(true);
    expect(matrixUtil.isMatrix3(9999)).to.be(false);
  });
});
