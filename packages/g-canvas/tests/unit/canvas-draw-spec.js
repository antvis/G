const expect = require('chai').expect;
import Canvas from '../../src/canvas';
import Group from '../../src/group';
import { getColor } from '../get-color';

const DELAY = 60; // 本来应该 16ms，但是测试时需要适当调大这个值

const dom = document.createElement('div');
document.body.appendChild(dom);
dom.id = 'cd1';

describe('test canvas draw', () => {
  const canvas = new Canvas({
    container: dom,
    width: 500,
    pixelRatio: 1,
    height: 500,
    autoDraw: false, // 初始禁用自动更新
    localRefresh: false, // 初始禁用局部更新
  });
  const context = canvas.get('context');

  canvas.addShape({
    type: 'circle',
    attrs: {
      x: 10,
      y: 10,
      r: 5,
      fill: 'red',
    },
  });

  it('delay draw', (done) => {
    // 不自动绘制
    expect(getColor(context, 10, 10)).eql('#000000');

    setTimeout(() => {
      expect(getColor(context, 10, 10)).eql('#000000');
      canvas.draw();
      // 由于绘制后延迟，所以不马上绘制
      expect(getColor(context, 10, 10)).eql('#000000');
      setTimeout(() => {
        expect(getColor(context, 10, 10)).eql('#ff0000');
        done();
      }, DELAY);
    }, DELAY);
  });

  it('auto draw', (done) => {
    canvas.set('autoDraw', true);
    canvas.addShape({
      type: 'circle',
      attrs: {
        x: 30,
        y: 30,
        r: 5,
        fill: 'blue',
      },
    });
    const shape1 = canvas.get('children')[0];
    shape1.attrs.fill = 'blue'; // 不通过接口改变，测试是否是全局绘制

    setTimeout(() => {
      expect(getColor(context, 10, 10)).eql('#0000ff');
      expect(getColor(context, 30, 30)).eql('#0000ff');
      expect(shape1.get('hasChanged')).eql(false);
      done();
    }, DELAY);
  });

  it('auto draw and local refresh', (done) => {
    canvas.set('localRefresh', true);
    const shape1 = canvas.get('children')[0];
    const shape2 = canvas.get('children')[1];
    shape1.attrs.fill = 'red'; // 不通过接口改变，测试是否是全局绘制
    expect(shape1.get('hasChanged')).eql(false);
    expect(shape2.get('hasChanged')).eql(false);

    shape2.attr('fill', 'red');
    expect(shape2.get('hasChanged')).eql(true);

    setTimeout(() => {
      expect(getColor(context, 10, 10)).eql('#0000ff');
      expect(getColor(context, 30, 30)).eql('#ff0000');
      done();
    }, DELAY);
  });

  describe('test local refresh', () => {
    let shape1;
    let shape2;
    let shape3;
    let group1;
    it('add shape', (done) => {
      canvas.clear(); // 把之前的清理掉，开始新的测试
      canvas.set('localRefresh', true);
      canvas.set('autoDraw', true);
      shape1 = canvas.addShape({
        type: 'circle',
        attrs: {
          x: 10,
          y: 10,
          r: 5,
          fill: '#00ffff',
        },
      });

      shape2 = canvas.addShape({
        type: 'circle',
        attrs: {
          x: 20,
          y: 20,
          r: 5,
          fill: 'red',
        },
      });
      setTimeout(() => {
        expect(getColor(context, 10, 10)).eql('#00ffff');
        expect(getColor(context, 20, 20)).eql('#ff0000');
        done();
      }, DELAY);
    });
    it('add shape and clear', (done) => {
      canvas.addShape({
        type: 'circle',
        attrs: {
          x: 20,
          y: 20,
          r: 5,
          fill: 'blue',
        },
      });
      canvas.clear();
      setTimeout(() => {
        expect(getColor(context, 10, 10)).eql('#000000');
        expect(getColor(context, 30, 30)).eql('#000000');
        done();
      }, DELAY);
    });

    it('add and change attr', (done) => {
      shape1 = canvas.addShape({
        type: 'circle',
        attrs: {
          x: 10,
          y: 10,
          r: 5,
          fill: '#00ffff',
        },
      });

      shape2 = canvas.addShape({
        type: 'circle',
        attrs: {
          x: 20,
          y: 20,
          r: 5,
          fill: 'red',
        },
      });
      shape1.attr('fill', '#ffff00');
      setTimeout(() => {
        expect(getColor(context, 10, 10)).eql('#ffff00');
        expect(getColor(context, 20, 20)).eql('#ff0000');
        shape2.attr('fill', 'blue');
        setTimeout(() => {
          expect(getColor(context, 20, 20)).eql('#0000ff');
          done();
        }, DELAY);
      }, DELAY);
    });

    it('matrix', (done) => {
      // 平移 20， 20
      const matrix = [1, 0, 0, 0, 1, 0, 20, 20, 1];
      shape1.attr('matrix', matrix);
      setTimeout(() => {
        expect(getColor(context, 10, 10)).eql('#000000');
        expect(getColor(context, 30, 30)).eql('#ffff00');
        shape1.resetMatrix(); // 重置矩阵
        setTimeout(() => {
          expect(getColor(context, 10, 10)).eql('#ffff00');
          expect(getColor(context, 30, 30)).eql('#000000');
          done();
        }, DELAY);
      }, DELAY);
    });

    it('hide', (done) => {
      shape2.hide();
      setTimeout(() => {
        expect(getColor(context, 20, 20)).eql('#000000');
        done();
      }, DELAY);
    });

    it('show', (done) => {
      shape2.show();
      setTimeout(() => {
        expect(getColor(context, 20, 20)).eql('#0000ff');
        done();
      }, DELAY);
    });

    it('tofront', (done) => {
      shape3 = canvas.addShape({
        type: 'circle',
        attrs: {
          x: 20,
          y: 20,
          r: 5,
          fill: 'red',
        },
      });
      setTimeout(() => {
        expect(getColor(context, 20, 20)).eql('#ff0000');
        shape2.toFront();
        setTimeout(() => {
          expect(getColor(context, 20, 20)).eql('#0000ff');
          done();
        }, DELAY);
      }, DELAY);
    });

    it('toback', (done) => {
      shape2.toBack();
      setTimeout(() => {
        expect(getColor(context, 20, 20)).eql('#ff0000');
        done();
      }, DELAY);
    });

    it('remove shape', (done) => {
      shape3.remove();
      setTimeout(() => {
        expect(getColor(context, 20, 20)).eql('#0000ff');
        done();
      }, DELAY);
    });

    it('add exist shape', (done) => {
      shape3 = shape2.clone();
      shape3.attr({
        x: 40,
        y: 40,
        r: 5,
        fill: '#00ff00',
      });
      canvas.add(shape3);
      setTimeout(() => {
        expect(getColor(context, 40, 40)).eql('#00ff00');
        done();
      }, DELAY);
    });

    it('shape clip', (done) => {
      shape3.setClip({
        type: 'rect',
        attrs: {
          x: 41,
          y: 41,
          width: 5,
          height: 5,
        },
      });
      setTimeout(() => {
        expect(getColor(context, 40, 40)).eql('#000000');
        done();
      }, DELAY);
    });

    it('add empty group', () => {
      // 添加分组，不会导致重绘，但是需要考虑 add 已经存在子元素的 group的场景
      // 由于目前还没有这样使用，所以可以不考虑这种场景
      // 为了简化，也计入 changed 范畴，便于后面的优化
      group1 = canvas.addGroup();
      expect(group1.get('hasChanged')).eql(true);
      expect(canvas.get('refreshElements').length).eql(1);
    });

    it('add new group', (done) => {
      const group2 = new Group({});
      group2.addShape({
        type: 'circle',
        attrs: {
          x: 50,
          y: 50,
          r: 5,
          fill: '#fff000',
        },
      });
      canvas.add(group2);
      setTimeout(() => {
        expect(getColor(context, 50, 50)).eql('#fff000');
        done();
      }, DELAY);
    });

    it('group add shape', (done) => {
      group1.addShape({
        type: 'circle',
        attrs: {
          x: 60,
          y: 60,
          r: 5,
          fill: '#00ffff',
        },
      });
      setTimeout(() => {
        expect(getColor(context, 60, 60)).eql('#00ffff');
        done();
      }, DELAY);
    });

    it('group matrix', (done) => {
      // 平移 20， 0
      const matrix = [1, 0, 0, 0, 1, 0, 20, 0, 1];
      group1.setMatrix(matrix);
      setTimeout(() => {
        expect(getColor(context, 60, 60)).eql('#000000');
        expect(getColor(context, 80, 60)).eql('#00ffff');
        done();
      }, DELAY);
    });

    it('clear group', (done) => {
      group1.clear();
      expect(canvas.get('refreshElements').length).eql(1);
      setTimeout(() => {
        expect(getColor(context, 60, 60)).eql('#000000');
        expect(getColor(context, 80, 60)).eql('#000000');
        done();
      }, DELAY);
    });

    it('group sort', (done) => {
      group1.resetMatrix();
      group1.addShape({
        type: 'circle',
        zIndex: 1,
        attrs: {
          x: 60,
          y: 60,
          r: 5,
          fill: '#000fff',
        },
      });
      group1.addShape({
        type: 'circle',
        zIndex: -1,
        attrs: {
          x: 62,
          y: 62,
          r: 5,
          fill: '#fff000',
        },
      });
      setTimeout(() => {
        expect(getColor(context, 60, 60)).eql('#fff000');
        group1.sort();
        setTimeout(() => {
          expect(getColor(context, 60, 60)).eql('#000fff');
          done();
        }, DELAY);
      }, DELAY);
    });

    it('group remove', (done) => {
      group1.remove();
      expect(canvas.get('refreshElements').length).eql(1);
      setTimeout(() => {
        expect(getColor(context, 60, 60)).eql('#000000');
        expect(getColor(context, 80, 60)).eql('#000000');
        done();
      }, DELAY);
    });

    it('canvas clear', () => {
      canvas.clear();
      expect(canvas.get('refreshElements').length).eql(0);
    });

    it('canvas sort', (done) => {
      shape1 = canvas.addShape({
        type: 'circle',
        zIndex: 1,
        attrs: {
          x: 10,
          y: 10,
          r: 5,
          fill: '#00ffff',
        },
      });

      shape2 = canvas.addShape({
        type: 'circle',
        zIndex: -1,
        attrs: {
          x: 12,
          y: 12,
          r: 5,
          fill: 'red',
        },
      });
      setTimeout(() => {
        expect(getColor(context, 10, 10)).eql('#ff0000');
        canvas.sort();
        setTimeout(() => {
          expect(getColor(context, 10, 10)).eql('#00ffff');
          done();
        }, DELAY);
      }, DELAY);
    });

    it('changeSize', (done) => {
      shape3 = canvas.addShape({
        type: 'circle',
        attrs: {
          x: 600,
          y: 600,
          r: 5,
          fill: '#eee000',
        },
      });
      setTimeout(() => {
        expect(getColor(context, 600, 600)).eql('#000000');
        canvas.changeSize(610, 610);
        setTimeout(() => {
          expect(getColor(context, 600, 600)).eql('#eee000');
          done();
        }, DELAY);
      }, DELAY);
    });

    it('bbox NaN', (done) => {
      shape3.attr({
        r: NaN,
      });
      setTimeout(() => {
        expect(getColor(context, 600, 600)).eql('#000000');
        done();
      }, DELAY);
    });

    it('out region', () => {
      canvas.addShape({
        type: 'circle',
        attrs: {
          x: -100,
          y: -100,
          r: 10,
        },
      });
      // @ts-ignore
      expect(canvas._getRefreshRegion()).eqls(null);
    });

    it('canvas destroy', () => {
      canvas.sort();
      canvas.destroy();
      expect(canvas.get('refreshElements')).eql(undefined);
    });
  });
});
