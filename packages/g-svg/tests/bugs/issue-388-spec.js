const expect = require('chai').expect;
import Canvas from '../../../g-svg/src/canvas';

const dom = document.createElement('div');
document.body.appendChild(dom);
dom.id = 'c1';

describe('#388', () => {
  const canvas = new Canvas({
    container: dom,
    width: 400,
    height: 400,
  });

  it('remove for clipShape should work', (done) => {
    const group = canvas.addGroup();
    group.addShape({
      type: 'rect',
      attrs: {
        x: 10,
        y: 10,
        width: 50,
        height: 150,
        fill: 'rgba(220, 0, 150, .5)',
      },
    });

    const clipShape = group.setClip({
      type: 'rect',
      attrs: {
        x: 0,
        y: 0,
        width: 60,
        height: 0,
      },
    });

    clipShape.animate(
      {
        height: 160,
      },
      {
        duration: 500,
        easing: 'easeQuadOut',
        callback: () => {
          group.setClip(null);
        },
      }
    );
    setTimeout(() => {
      const groupEl = group.get('el');
      const clipShapeEl = clipShape.get('el');
      expect(groupEl.getAttribute('clip-path')).eqls(null);
      expect(clipShapeEl).not.eqls(undefined);
      done();
    }, 600);
  });

  it('matrix animation for group should work', (done) => {
    const group = canvas.addGroup();
    group.addShape({
      type: 'rect',
      attrs: {
        x: 0,
        y: 0,
        width: 50,
        height: 150,
        fill: 'rgba(220, 0, 150, .5)',
      },
    });

    group.setMatrix([1, 0, 0, 0, 0.01, 0, 0, 148.5, 1]);
    group.animate(
      {
        matrix: [1, 0, 0, 0, 1, 0, 0, 0, 1],
      },
      {
        duration: 100,
        easing: 'easeQuadOut',
      }
    );

    const groupEl = group.get('el');

    expect(groupEl.getAttribute('transform')).eqls('matrix(1,0,0,0.01,0,148.5)');
    setTimeout(() => {
      expect(groupEl.getAttribute('transform')).eqls('matrix(1,0,0,1,0,0)');
      done();
    }, 120);
  });

  it('opacity attr for Rect should work', () => {
    const group = canvas.addGroup();
    const rect = group.addShape('rect', {
      attrs: {
        x: 10,
        y: 10,
        width: 50,
        height: 150,
        fill: 'rgba(220, 0, 150, .5)',
        opacity: 0.3,
      },
    });
    const el = rect.get('el');
    expect(el.getAttribute('opacity')).eqls('0.3');
  });

  it('null for fill and stroke attr should work', (done) => {
    const group = canvas.addGroup();
    const rect = group.addShape('rect', {
      attrs: {
        x: 10,
        y: 10,
        width: 50,
        height: 150,
        fill: 'red',
      },
    });
    setTimeout(() => {
      rect.attr('fill', null);
    }, 200);
    setTimeout(() => {
      done();
    }, 300);
  });

  it('should not generate svg elements repeatedly when canvas.draw()', () => {
    // 将之前测试用例生成的子元素清空
    canvas.clear();
    const group = canvas.addGroup();
    const circle = group.addShape('circle', {
      attrs: {
        x: 100,
        y: 100,
        r: 50,
        fill: 'red',
      },
    });
    circle.setClip({
      type: 'rect',
      attrs: {
        x: 75,
        y: 75,
        width: 50,
        height: 50,
      },
    });
    canvas.draw();
    // <defs> 元素 + <g> 元素
    expect(canvas.get('el').childNodes.length).eqls(2);
  });

  it('should work when autoDraw is false', () => {
    canvas.set('autoDraw', false);
    const group = canvas.addGroup();
    const circle = group.addShape('circle', {
      attrs: {
        x: 100,
        y: 100,
        r: 50,
        fill: 'red',
      },
    });
    circle.translate(20, 20);
    canvas.draw();
    expect(circle.get('el').getAttribute('transform')).eqls('matrix(1,0,0,1,20,20)');
    // 重置 autoDraw，避免影响其他的测试用例
    canvas.set('autoDraw', true);
  });
});
