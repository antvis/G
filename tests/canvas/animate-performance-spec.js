var $ = require('jquery');
var Util = require('../../src/util/util');
var expect = require('@ali/expect.js');
var Matrix = require('@ali/g-matrix');
var Canvas = require('../../src/canvas');

$('<div id="c1"></div>').appendTo('body');

xdescribe('动画', function() {
  // var canvas = new Canvas({
  //   containerId: 'c1',
  //   width: 500,
  //   height: 500
  // });
  // it('停止动画', function() {
  //   var callBack = sinon.spy();
  //   var matrix = new Matrix.Matrix3();
  //   matrix.translate(400,400);
  //   var circle = canvas.addShape("Circle", {
  //     attrs: {
  //       x: 100,
  //       y: 0,
  //       r: 100,
  //       fill: '#FED23C'
  //     }
  //   });
  //   circle.animate({
  //     x: 20,
  //     matrix: matrix
  //   },1000, 'linear', callBack);
  //   setTimeout(function(){
  //     canvas.clear();
  //   }, 400);
  // });
});
