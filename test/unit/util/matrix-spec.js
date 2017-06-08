const $ = require('jquery');
const expect = require('chai').expect;
const MatrixUtil = require('../../../src/util/matrix');
const Matrix = require('@ali/g-matrix');
const Matrix3 = Matrix.Matrix3;
const Canvas = require('../../../src/canvas');

$('<div id="test_matrixUtil"></div>').appendTo('body');

const canvas = new Canvas({
  containerId: 'test_matrixUtil',
  width: 500,
  height: 500
});

describe('测试矩阵工具', function() {
  it('基于某点缩放', function() {
    const group = canvas.addGroup();
    const circle = group.addShape('circle', {
      attrs: {
        x: 250,
        y: 250,
        r: 50,
        fill: '#FED443'
      }
    });
    // const animPoint = canvas.addShape('circle', {
    //   attrs: {
    //     x: 250,
    //     y: 250,
    //     r: 3,
    //     fill: 'blue'
    //   }
    // });
    let matrix = new Matrix3();
    // const bboxOrigin = circle.getBBox();
    matrix = MatrixUtil.scale(matrix, 2, 2, 250, 250);
    circle.setMatrix(matrix);
    const bbox = group.getBBox();
    expect(bbox.x + bbox.width / 2).to.equal(250);
    expect(bbox.y + bbox.height / 2).to.equal(250);
    expect(bbox.width).to.equal(202); // 边框有值 ＋2
    expect(bbox.height).to.equal(202); // 边框有值 ＋2
    canvas.draw();
  });
  it('基于某点旋转', function() {
    const matrix = new Matrix3();
    const rst = MatrixUtil.rotate(matrix, parseFloat(10) / 180 * Math.PI, 300, 300);
    matrix.translate(-300, -300);
    matrix.rotate(parseFloat(10) / 180 * Math.PI);
    matrix.translate(300, 300);
    expect(Matrix3.equal(matrix, rst)).to.be.true;
  });
  it('变换 transform', function() {
    const matrix = new Matrix3();
    const rst = MatrixUtil.transform(matrix, [
      [ 't', 100, 200 ],
      [ 's', 0.2, 0.3 ],
      [ 'r', Math.PI ],
      [ 'm', new Matrix3() ],
      [ 'null', 10101010101 ]
    ]);
    matrix.translate(100, 200);
    matrix.scale(0.2, 0.3);
    matrix.rotate(Math.PI);
    matrix.multiply(new Matrix3());
    expect(Matrix3.equal(matrix, rst)).to.be.true;
  });
  it('判断是否是3阶矩阵', function() {
    const matrix = new Matrix3();
    expect(MatrixUtil.isMatrix3(matrix)).to.be.true;
    expect(MatrixUtil.isMatrix3(9999)).to.be.false;
  });
});
