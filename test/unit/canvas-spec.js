const $ = require('jquery');
const expect = require('chai').expect;
const Matrix = require('@ali/g-matrix');
const sinon = require('spm-sinon');
const Canvas = require('../../src/canvas');
const G = require('../../src/g/index');

$('<div id="c1"></div>').appendTo('body');

describe('Layer', function() {
  it('新建图层 new Layer', function() {
    const canvas = new Canvas({
      containerId: 'c1',
      width: 500,
      height: 500
    });
    expect(canvas).to.be.an.instanceof(Canvas);
  });

  it('改变尺寸 change size', function() {
    const canvas = new Canvas({
      containerId: 'c1',
      width: 500,
      height: 500
    });
    canvas.changeSize(200, 200);
    expect(canvas.get('widthStyle')).to.equal('200px');
    expect(canvas.get('heightStyle')).to.equal('200px');
  });


  it('清空图层 clear layer', function() {
    const canvas = new Canvas({
      containerId: 'c1',
      width: 500,
      height: 500
    });
    canvas.clear();
    expect(canvas.get('children')).to.be.an('array').that.is.empty;
  });

});

describe('拓展图形 标记 Marker', function() {
  const canvas = new Canvas({
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
  it('circle', function() {
    canvas.addShape('Marker', {
      attrs: {
        symbol: 'circle',
        stroke: 'red',
        x: 30,
        y: 20,
        r: 10
      }

    });
    canvas.draw();
  });
  it('square', function() {
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
  it('triangle', function() {
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
  it('triangle-down', function() {
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
  it('custom', function() {
    canvas.addShape('Marker', {
      attrs: {
        symbol(x, y, r) {
          return [
            [ 'M', x - r, y ],
            [ 'L', x, y - r * 4 ],
            [ 'L', x + r, y ],
            [ 'L', x, y + r ],
            [ 'z' ]
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
  const canvas = new Canvas({
    containerId: 'c1',
    width: 500,
    height: 500
  });
  const circle = new G.Circle({
    attrs: {
      x: 10,
      y: 332,
      r: 30,
      fill: '#231'
    }
  });
  describe('查找元素', function() {
    // const canvasRect = canvas.addShape('Rect', {
    //   attrs: {
    //     x: 0,
    //     y: 0,
    //     width: 21,
    //     height: 33,
    //     stroke: '#ff00ff'
    //   }
    // });
    /* it('通过type 查找 findByType', function() {
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
      expect(rect === findedShape).to.be.true;
    });*/
    it('通过方法查找元素 findAllBy', function() {
      const group = canvas.addGroup();
      const group1 = group.addGroup();
      const rect = group1.addShape('rect', {
        cls: 'heh',
        attrs: {
          x: 0,
          y: 0,
          width: 21,
          height: 33,
          stroke: '#ff00ff'
        }
      });
      const rst = group.findAllBy(function(item) {
        if (item.get('cls') === 'heh') {
          return true;
        }
        return false;

      });
      expect(rect === rst[0]).to.be.true;
    });
  });
  /*
  describe('新增元素', function(){
    it('添加图形 add Shape 无cfg', function() {
      var rect = canvas.addShape('Rect');
      expect(rect).not.to.be.undefined;
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
      expect(Util.isObject(plotback)).to.be.true;
    });
    it('添加图组 add Group 参数undefined', function() {
      var plotback = canvas.addGroup();
      expect(Util.isObject(plotback)).to.be.true;
    });
    it('添加图组 add Group 参数cfg', function() {
      var plotback = canvas.addGroup({
        attrs:{
          fill: 'red'
        }
      });
      expect(Util.isObject(plotback)).to.be.true;
    });
    it('添加图组 add Group 参数其它', function() {
      var plotback = canvas.addGroup([]);
      expect(Util.isObject(plotback)).not.to.be.true;
      var plotback = canvas.addGroup(null);
      expect(Util.isObject(plotback)).not.to.be.true;
      var plotback = canvas.addGroup(false);
      expect(Util.isObject(plotback)).not.to.be.true;
    });
  });
  */
  describe('判断是否是子元素', function() {
    // it('是子元素', function() {
    //   expect(canvas.contain(canvasRect)).to.be.true;
    // });
    it('非子元素', function() {
      expect(canvas.contain(circle)).to.be.false;
    });
    it('非元素', function() {
      expect(canvas.contain(12)).to.be.false;
    });
    canvas.draw();
  });
  describe('查找子元素', function() {
    const children = canvas.get('children');
    // it('第一个子元素', function() {
    //   expect(canvas.getFirst(rect)).to.be(children[0]);
    // });
    it('第N个子元素', function() {
      expect(canvas.getChildByIndex(2)).to.eql(children[2]);
    });
    // it('最后一个子元素', function() {
    //   expect(canvas.getLast(circle)).to.be(children[children.length - 1]);
    // });
    canvas.draw();
  });
});

describe('元素拓展方法', function() {
  const canvas = new Canvas({
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
    const rect = canvas.addShape('Rect', {
      attrs: {
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        fill: '#FED23C',
        lineWidth: 0
      }
    });
    const bbox = rect.getBBox();
    expect(bbox.x).to.equal(0);
    expect(bbox.y).to.equal(0);
    expect(bbox.width).to.equal(100);
    expect(bbox.height).to.equal(100);
  });
  it('测试BBox方法－无bbox', function() {
    const text = canvas.addShape('Text', {
      attrs: {
        x: 0,
        y: 0,
        text: ''
      }
    });
    const bbox = text.getBBox();
    expect(bbox.x).to.equal(0);
    expect(bbox.y).to.equal(0);
    expect(bbox.width).to.equal(0);
    expect(bbox.height).to.equal(0);
  });
  /* it('获取宽', function() {
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
    const rect = canvas.addShape('Rect', {
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
    expect(rect.attr('rotate')).to.equal(45 / 180 * Math.PI);
  });
  it('图形动画、属性动画 Props animate', function() {
    const callBack = sinon.spy();
    const rect = canvas.addShape('Rect', {
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
    }, 200, 'linear', callBack);
    setTimeout(function() {
      expect(callBack.called).to.be.true;
    }, 1050);
  });
  it('图形、图组动画、矩阵动画 Matrix animate', function(done) {
    const callBack = sinon.spy();
    const matrix = new Matrix.Matrix3();
    matrix.translate(100, 100);
    const circle = canvas.addShape('Circle', {
      attrs: {
        x: 0,
        y: 0,
        r: 100,
        fill: '#FED23C'
      },
      name: 'circle1'
    });
    circle.animate({
      matrix
    }, 200, 'linear', callBack);
    setTimeout(function() {
      done();
      expect(callBack.called).to.be.true;
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

