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
  // setInterval(function(){
  //   canvas.clear();
  //   for (var i = 0; i < 5000; i++) {
  //     canvas.addShape('circle',{
  //       attrs: {
  //         x: Math.random() * 500,
  //         y: Math.random() * 500,
  //         r: 4,
  //         fill: '#FB7A6B'
  //       }
  //     })
  //   }
  //   canvas.draw();
  // }, 200);
});
