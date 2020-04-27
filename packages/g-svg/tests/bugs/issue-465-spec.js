const expect = require('chai').expect;
import Canvas from '../../../g-svg/src/canvas';

const dom = document.createElement('div');
document.body.appendChild(dom);
dom.id = 'c1';

describe('#465', () => {
  const canvas = new Canvas({
    container: dom,
    width: 400,
    height: 400,
  });

  it('text of fontSize < 12 should be rendered', () => {
    const text = canvas.addShape('text', {
      attrs: {
        x: 50,
        y: 100,
        fontFamily: 'PingFang SC',
        text: '文本文本',
        fontSize: 10,
        stroke: 'red',
      },
    });
    const el = text.get('el');
    expect(el.getAttribute('stroke')).eqls('red');
  });
});
