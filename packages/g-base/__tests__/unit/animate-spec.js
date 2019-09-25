import { expect } from 'chai';
import Canvas from '../../src/abstract/canvas';
import Shape from '../../src/abstract/shape';

const dom = document.createElement('div');
document.body.appendChild(dom);

class MyCanvas extends Canvas {
  getShapeBase() {}

  createDom() {
    const el = document.createElement('canvas');
    return el;
  }

  getGroupBase() {}
}

describe('animate', () => {
  const div = document.createElement('div');
  div.id = 'canvas-animate';
  document.body.appendChild(div);
  const canvas = new MyCanvas({
    container: 'canvas-animate',
    width: 1000,
    height: 1000,
  });

  it('animate(toAttrs, duration, easing, callback, delay)', (done) => {
    const shape = new Shape({
      attrs: {
        x: 50,
        y: 50,
      },
    });
    canvas.add(shape);
    let flag = false;
    shape.animate(
      {
        x: 100,
        y: 100,
      },
      500,
      'easeLinear',
      () => {
        flag = true;
      },
      100
    );
    expect(shape.attr('x')).eqls(50);
    expect(shape.attr('y')).eqls(50);
    expect(flag).eqls(false);
    setTimeout(() => {
      expect(flag).eqls(false);
    }, 550);
    setTimeout(() => {
      expect(shape.attr('x')).eqls(100);
      expect(shape.attr('y')).eqls(100);
      expect(flag).eqls(true);
      done();
    }, 700);
  });

  it('animate(onFrame, duration, easing, callback, delay)', (done) => {
    const shape = new Shape({
      attrs: {
        x: 50,
        y: 50,
      },
    });
    canvas.add(shape);
    let flag = false;
    shape.animate(
      (ratio) => {
        return {
          x: 50 + ratio * (100 - 50),
          y: 50 + ratio * (100 - 50),
        };
      },
      500,
      'easeLinear',
      () => {
        flag = true;
      },
      100
    );
    expect(shape.attr('x')).eqls(50);
    expect(shape.attr('y')).eqls(50);
    expect(flag).eqls(false);
    setTimeout(() => {
      expect(flag).eqls(false);
    }, 550);
    setTimeout(() => {
      expect(shape.attr('x')).eqls(100);
      expect(shape.attr('y')).eqls(100);
      expect(flag).eqls(true);
      done();
    }, 700);
  });

  it('animate(toAttrs, duration, callback, delay)', (done) => {
    const shape = new Shape({
      attrs: {
        x: 50,
        y: 50,
      },
    });
    canvas.add(shape);
    let flag = false;
    shape.animate(
      {
        x: 100,
        y: 100,
      },
      500,
      () => {
        flag = true;
      },
      100
    );
    expect(shape.attr('x')).eqls(50);
    expect(shape.attr('y')).eqls(50);
    expect(flag).eqls(false);
    setTimeout(() => {
      expect(flag).eqls(false);
    }, 550);
    setTimeout(() => {
      expect(shape.attr('x')).eqls(100);
      expect(shape.attr('y')).eqls(100);
      expect(flag).eqls(true);
      done();
    }, 700);
  });

  it('animate(onFrame, duration, callback, delay)', (done) => {
    const shape = new Shape({
      attrs: {
        x: 50,
        y: 50,
      },
    });
    canvas.add(shape);
    let flag = false;
    shape.animate(
      (ratio) => {
        return {
          x: 50 + ratio * (100 - 50),
          y: 50 + ratio * (100 - 50),
        };
      },
      500,
      () => {
        flag = true;
      },
      100
    );
    expect(shape.attr('x')).eqls(50);
    expect(shape.attr('y')).eqls(50);
    expect(flag).eqls(false);
    setTimeout(() => {
      expect(flag).eqls(false);
    }, 550);
    setTimeout(() => {
      expect(shape.attr('x')).eqls(100);
      expect(shape.attr('y')).eqls(100);
      expect(flag).eqls(true);
      done();
    }, 700);
  });

  it('animate(toAttrs, animateCfg)', (done) => {
    const shape = new Shape({
      attrs: {
        x: 50,
        y: 50,
      },
    });
    canvas.add(shape);
    let flag = false;
    shape.animate(
      {
        x: 100,
        y: 100,
      },
      {
        duration: 500,
        easing: 'easeLinear',
        delay: 100,
        callback: () => {
          flag = true;
        },
      }
    );
    expect(shape.attr('x')).eqls(50);
    expect(shape.attr('y')).eqls(50);
    expect(flag).eqls(false);
    setTimeout(() => {
      expect(flag).eqls(false);
    }, 550);
    setTimeout(() => {
      expect(shape.attr('x')).eqls(100);
      expect(shape.attr('y')).eqls(100);
      expect(flag).eqls(true);
      done();
    }, 700);
  });

  it('animate(onFrame, animateCfg)', (done) => {
    const shape = new Shape({
      attrs: {
        x: 50,
        y: 50,
      },
    });
    canvas.add(shape);
    let flag = false;
    shape.animate(
      (ratio) => {
        return {
          x: 50 + ratio * (100 - 50),
          y: 50 + ratio * (100 - 50),
        };
      },
      {
        duration: 500,
        easing: 'easeLinear',
        delay: 100,
        callback: () => {
          flag = true;
        },
      }
    );
    expect(shape.attr('x')).eqls(50);
    expect(shape.attr('y')).eqls(50);
    expect(flag).eqls(false);
    setTimeout(() => {
      expect(flag).eqls(false);
    }, 550);
    setTimeout(() => {
      expect(shape.attr('x')).eqls(100);
      expect(shape.attr('y')).eqls(100);
      expect(flag).eqls(true);
      done();
    }, 700);
  });

  it('repeat', (done) => {
    const shape = new Shape({
      attrs: {
        x: 50,
        y: 50,
      },
    });
    canvas.add(shape);
    let flag = false;
    shape.animate(
      {
        x: 100,
        y: 100,
      },
      {
        duration: 500,
        easing: 'easeLinear',
        delay: 100,
        repeat: true, // 动画重复执行
        callback: () => {
          flag = true;
        },
      }
    );
    setTimeout(() => {
      expect(shape.attr('x')).not.eqls(100);
      expect(shape.attr('y')).not.eqls(100);
      expect(shape.get('animating')).eqls(true); // 动画仍然在执行
      expect(flag).eqls(false); // callback 回调一直得不到执行
      done();
    }, 700);
  });

  it('stopAnimate(toEnd = true)', (done) => {
    const shape = new Shape({
      attrs: {
        x: 50,
        y: 50,
      },
    });
    canvas.add(shape);
    let flag = false;
    shape.animate(
      {
        x: 100,
        y: 100,
      },
      {
        duration: 500,
        easing: 'easeLinear',
        delay: 100,
        callback: () => {
          flag = true;
        },
      }
    );
    setTimeout(() => {
      expect(shape.attr('x')).not.eqls(100);
      expect(shape.attr('y')).not.eqls(100);
      expect(shape.get('animating')).eqls(true);
      expect(flag).eqls(false);
      shape.stopAnimate(true);
      expect(shape.attr('x')).eqls(100);
      expect(shape.attr('y')).eqls(100);
      expect(shape.get('animating')).eqls(false);
      expect(flag).eqls(true);
      done();
    }, 300);
  });

  it('stopAnimate(toEnd = false)', (done) => {
    const shape = new Shape({
      attrs: {
        x: 50,
        y: 50,
      },
    });
    canvas.add(shape);
    let flag = false;
    shape.animate(
      {
        x: 100,
        y: 100,
      },
      {
        duration: 500,
        easing: 'easeLinear',
        delay: 100,
        callback: () => {
          flag = true;
        },
      }
    );
    setTimeout(() => {
      expect(shape.attr('x')).not.eqls(100);
      expect(shape.attr('y')).not.eqls(100);
      expect(shape.get('animating')).eqls(true);
      expect(flag).eqls(false);
      shape.stopAnimate(false);
      expect(shape.attr('x')).not.eqls(100);
      expect(shape.attr('y')).not.eqls(100);
      expect(shape.get('animating')).eqls(false);
      expect(flag).eqls(true);
      done();
    }, 300);
  });

  it.only('pauseAnimate & resumeAnimate', (done) => {
    const shape = new Shape({
      attrs: {
        x: 50,
        y: 50,
      },
    });
    canvas.add(shape);
    let flag = 0;
    shape.animate(
      {
        x: 100,
        y: 100,
      },
      {
        duration: 500,
        easing: 'easeLinear',
        delay: 100,
        // 动画暂停时的回调
        pauseCallback: () => {
          flag = 1;
        },
        // 动画恢复时的回调
        resumeCallback: () => {
          flag = 2;
        },
      }
    );
    setTimeout(() => {
      expect(shape.attr('x')).not.eqls(100);
      expect(shape.attr('y')).not.eqls(100);
      expect(flag).eqls(0);
      // 暂停动画
      shape.pauseAnimate();
      // 缓存暂停时的绘图属性
      const pauseAttrs = {
        x: shape.attr('x'),
        y: shape.attr('y'),
      };
      expect(shape.attr('x')).not.eqls(100);
      expect(shape.attr('y')).not.eqls(100);
      // 暂停中
      expect(shape.isAnimatePaused()).eqls(true);
      // 动画暂停时，animating 仍然为 true
      expect(shape.get('animating')).eqls(true);
      expect(flag).eqls(1);
      // 恢复动画
      shape.resumeAnimate();
      expect(shape.attr('x')).eqls(pauseAttrs.x);
      expect(shape.attr('y')).eqls(pauseAttrs.y);
      expect(shape.isAnimatePaused()).eqls(false);
      expect(flag).eqls(2);
      done();
    }, 300);
  });

  it.only('autoDraw = false', (done) => {
    const newCanvas = new MyCanvas({
      container: 'canvas-animate',
      width: 1000,
      height: 1000,
      autoDraw: false, // 手动更新
    });
    const shape = new Shape({
      attrs: {
        x: 50,
        y: 50,
      },
    });
    newCanvas.add(shape);
    let flag = false;
    shape.animate(
      {
        x: 100,
        y: 100,
      },
      {
        duration: 500,
        easing: 'easeLinear',
        delay: 100,
        callback: () => {
          flag = true;
        },
      }
    );
    expect(shape.attr('x')).eqls(50);
    expect(shape.attr('y')).eqls(50);
    expect(flag).eqls(false);
    setTimeout(() => {
      expect(shape.attr('x')).not.eqls(50);
      expect(shape.attr('x')).not.eqls(100);
      expect(shape.attr('y')).not.eqls(50);
      expect(shape.attr('y')).not.eqls(100);
      expect(flag).eqls(false);
    }, 550);
    setTimeout(() => {
      expect(shape.attr('x')).eqls(100);
      expect(shape.attr('y')).eqls(100);
      expect(flag).eqls(true);
      done();
    }, 700);
  });
});
