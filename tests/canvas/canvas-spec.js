var $ = require('jquery');
var Matrix = require('@ali/g-matrix');
var expect = require('@ali/expect.js');
var sinon = require('spm-sinon');
var Canvas = require('../../src/canvas');
// var Components = require('../../src/components/index');
var G = require('../../src/g/index');
// var PlotBack = Components.PlotBack;

$('<div id="c1"></div>').appendTo('body');

describe('Layer', function() {

  it('新建图层 new Layer', function() {
    var canvas = new Canvas({
      containerId: 'c1',
      width: 500,
      height: 500
    });
  });

  it('通过CSS 参数新建图层 new Layer by css', function() {
    var canvas = new Canvas({
      containerId: 'c1',
      widthStyle: "500px",
      heightStyle: "500px"
    });
  });

  var canvas = new Canvas({
    containerId: 'c1',
    widthStyle: '500px',
    heightStyle: '500px'
  });

  it('改变尺寸 change size', function() {
    canvas.changeSize(200, 200);
  });

  it('通过CSS 改变尺寸 change size by css', function() {
    canvas.changeSizeByCss('10em', '10em');
  });

  it('清空图层 clear layer', function() {
    canvas.clear();
  });

});

describe('拓展图形 标记 Marker', function(){
  var canvas = new Canvas({
    containerId: 'c1',
    width: 500,
    height: 500
  });
  it('diamond', function() {
    canvas.addShape('Marker', {
      attrs: {
        symbol: 'diamond',
        stroke: 'red',
        x: 10,
        y: 20,
        r: 10
      }
    });
    canvas.draw();
  });
  it('circle',  function(){
    canvas.addShape('Marker', {
      attrs: {
        symbol: 'circle',
        stroke: 'red',
        x: 30,
        y: 20,
        r: 10
      },

    });
    canvas.draw();
  });
  it('square',  function(){
    canvas.addShape('Marker', {
      attrs: {
        symbol: 'square',
        stroke: 'red',
        x: 50,
        y: 20,
        r: 10
      }
    });
    canvas.draw();
  });
  it('triangle',  function(){
    canvas.addShape('Marker', {
      attrs: {
        symbol: 'triangle',
        stroke: 'red',
        x: 70,
        y: 20,
        r: 10
      }
    });
    canvas.draw();
  });
  it('triangle-down',  function(){
    canvas.addShape('Marker', {
      attrs: {
        symbol: 'triangle-down',
        stroke: 'red',
        x: 90,
        y: 20,
        r: 10
      }
    });
    canvas.draw();
  });
  it('custom',  function(){
    canvas.addShape('Marker', {
      attrs: {
        symbol: function(x, y, r){
          return [
            ['M', x - r, y],
            ['L', x, y - r*4],
            ['L', x + r, y],
            ['L', x, y + r],
            ['z']
          ];
        },
        stroke: 'red',
        x: 90,
        y: 20,
        r: 10
      }
    });
    canvas.draw();
  });
  // it('not support type',  function(){
  //   function addWrongMarker(){
  //     canvas.addShape('Marker', {
  //       attrs: {
  //         symbol: 'null',
  //         stroke: 'red',
  //         x: 90,
  //         y: 20,
  //         r: 10
  //       }
  //     });
  //     canvas.draw();
  //   }
  //   expect(addWrongMarker).to.throwError();
  // });
});

describe('组拓展方法', function() {
  var canvas = new Canvas({
    containerId: 'c1',
    width: 500,
    height: 500
  });
  var circle = new G.Circle({
    attrs: {
      x: 10,
      y: 332,
      r: 30,
      fill: '#231'
    }
  });
  var rect = canvas.addShape('Rect', {
    attrs: {
      x: 0,
      y: 0,
      width: 21,
      height: 33,
      stroke: '#ff00ff'
    }
  });
  describe('查找元素', function(){
    /*it('通过type 查找 findByType', function() {
      var group = canvas.addGroup();
      var rect = group.addShape('rect', {
        attrs: {
          x: 0,
          y: 0,
          width: 21,
          height: 33,
          stroke: '#ff00ff'
        }
      });
      var findedShape = group.findByType('rect');
      expect(rect === findedShape).to.be(true);
    });*/
    it('通过方法查找元素 findAllBy', function() {
      var group = canvas.addGroup();
      var group1 = group.addGroup();
      var rect = group1.addShape('rect', {
        cls: 'heh',
        attrs: {
          x: 0,
          y: 0,
          width: 21,
          height: 33,
          stroke: '#ff00ff'
        }
      });
      var rst = group.findAllBy(function(item){
        if (item.get('cls') === 'heh') {
          return true;
        }else{
          return false;
        }
      });
      expect(rect === rst[0]).to.be(true);
    });
  });
  /*
  describe('新增元素', function(){
    it('添加图形 add Shape 无cfg', function() {
      var rect = canvas.addShape('Rect');
      expect(rect).not.to.be(undefined);
    });
    it('添加图形 add Shape', function() {
      var width = canvas.get('width');
      var height = canvas.get('height');
      var rect = canvas.addShape('Rect', {
        attrs: {
          x: 0,
          y: 0,
          width: width,
          height: height,
          stroke: '#ff00ff'
        }
      });
      canvas.draw();
    });
    it('添加图组 add Group', function() {
      var plotback = canvas.addGroup(PlotBack, {
        margin : 30,
        border : {
          stroke : '#ededed'
        },
        background : {
          fill : '#eee',
          border : '#fff'
        }
      });
      canvas.draw();
      expect(Util.isObject(plotback)).to.be(true);
    });
    it('添加图组 add Group 参数undefined', function() {
      var plotback = canvas.addGroup();
      expect(Util.isObject(plotback)).to.be(true);
    });
    it('添加图组 add Group 参数cfg', function() {
      var plotback = canvas.addGroup({
        attrs:{
          fill: 'red'
        }
      });
      expect(Util.isObject(plotback)).to.be(true);
    });
    it('添加图组 add Group 参数其它', function() {
      var plotback = canvas.addGroup([]);
      expect(Util.isObject(plotback)).not.to.be(true);
      var plotback = canvas.addGroup(null);
      expect(Util.isObject(plotback)).not.to.be(true);
      var plotback = canvas.addGroup(false);
      expect(Util.isObject(plotback)).not.to.be(true);
    });
  });
  */
  describe('判断是否是子元素', function(){
    it('是子元素', function() {
      expect(canvas.contain(rect)).to.be(true);
    });
    it('非子元素', function() {
      expect(canvas.contain(circle)).to.be(false);
    });
    it('非元素', function() {
      expect(canvas.contain(12)).to.be(false);
    });
    canvas.draw();
  })
  describe('查找子元素', function(){
    var children = canvas.get('children');
    // it('第一个子元素', function() {
    //   expect(canvas.getFirst(rect)).to.be(children[0]);
    // });
    it('第N个子元素', function() {
      expect(canvas.getChildByIndex(2)).to.be(children[2]);
    });
    // it('最后一个子元素', function() {
    //   expect(canvas.getLast(circle)).to.be(children[children.length - 1]);
    // });
    canvas.draw();
  })
});

describe('元素拓展方法', function() {
  var canvas = new Canvas({
    containerId: 'c1',
    width: 500,
    height: 500
  });
  canvas.addShape('Circle', {
    attrs: {
      x: 100,
      y: 100,
      r: 5,
      fill: 'red'
    }
  });
  it('测试BBox方法', function() {
    var rect = canvas.addShape("Rect", {
      attrs: {
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        fill: '#FED23C',
        lineWidth: 0
      }
    });
    var bbox = rect.getBBox();
    expect(bbox.x).to.be(0);
    expect(bbox.y).to.be(0);
    expect(bbox.width).to.be(100);
    expect(bbox.height).to.be(100);
  });
  it('测试BBox方法－无bbox', function() {
    var text = canvas.addShape("Text", {
      attrs: {
        x: 0,
        y: 0,
        text: ''
      }
    });
    var bbox = text.getBBox();
    expect(bbox.x).to.be(0);
    expect(bbox.y).to.be(0);
    expect(bbox.width).to.be(0);
    expect(bbox.height).to.be(0);
  });
  /*it('获取宽', function() {
    var rect = canvas.addShape("Rect", {
      attrs: {
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        fill: '#FED23C',
        lineWidth: 0
      }
    });
    expect(rect.getWidth()).to.be(100);
  });
  it('获取长', function() {
    var rect = canvas.addShape("Rect", {
      attrs: {
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        fill: '#FED23C',
        lineWidth: 0
      }
    });
    expect(rect.getHeight()).to.be(100);
  });
  it('获取中心', function() {
    var rect = canvas.addShape("Rect", {
      attrs: {
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        fill: '#FED23C'
      }
    });
    var center = rect.getCenter();
    expect(center.x).to.be(50);
    expect(center.y).to.be(50);
  });*/
  it('属性旋转', function() {
    var rect = canvas.addShape("Rect", {
      attrs: {
        x: 300,
        y: 10,
        width: 20,
        height: 20,
        rotate: 45 / 180 * Math.PI,
        fill: '#FED23C'
      }
    });
    canvas.draw();
  });
  it('图形动画、属性动画 Props animate', function() {
    var callBack = sinon.spy();
    var rect = canvas.addShape("Rect", {
      attrs: {
        x: 0,
        y: 0,
        width: 200,
        height: 200,
        fill: '#FED23C'
      },
      name: 'rect2'
    });
    rect.animate({
      x: 100,
      y: 200,
      fill: '#4794CA'
    },200, 'linear', callBack);
    setTimeout(function(){
      expect(callBack.called).to.be(true);
    }, 1050);
  });
  it('图形、图组动画、矩阵动画 Matrix animate', function(done) {
    var callBack = sinon.spy();
    var matrix = new Matrix.Matrix3();
    matrix.translate(100,100);
    var circle = canvas.addShape("Circle", {
      attrs: {
        x: 0,
        y: 0,
        r: 100,
        fill: '#FED23C'
      },
      name: 'circle1'
    });
    circle.animate({
      matrix: matrix
    },200, 'linear', callBack);
    setTimeout(function(){
      done();
      expect(callBack.called).to.be(true);
    }, 1050);
  });
});

/*
describe('属性名适配', function() {
  var canvas = new Canvas({
    containerId: 'c1',
    width: 500,
    height: 500
  });
  var rect = canvas.addShape("Rect", {
    attrs: {
      x: 20,
      y: 20,
      width: 200,
      height: 200,
      'fill-opacity': 0.3,
      stroke: '#FED23C',
      'stroke-width': 10,
    }
  });
  var text = canvas.addShape("Text", {
    attrs: {
      'text-anchor': 'start',
      'font-size': 19
    }
  });
  canvas.draw();
  it('fill-opacity fillOpacity', function(){
    expect(rect.attr('fillOpacity')).to.be(0.3);
  });
  it('stroke-width lineWidth', function(){
    expect(rect.attr('lineWidth')).to.be(10);
  });
  it('text-anchor textAlign', function(){
    expect(text.attr('textAlign')).to.be('left');
  });
  it('font-size fontSize', function(){
    expect(text.attr('fontSize')).to.be(19);
  });
});
*/

