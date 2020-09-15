const expect = require('chai').expect;
import Canvas from '../../src/canvas';

const dom = document.createElement('div');
document.body.appendChild(dom);

function simulateMouseEvent(dom, type, cfg) {
  const event = new MouseEvent(type, cfg);
  dom.dispatchEvent(event);
}

describe('long path event', () => {
  it('long path event', () => {
    const canvas = new Canvas({
      container: dom,
      width: 2400,
      height: 2400,
    });
    const group = canvas.addGroup();
    const nodeGroup = group.addGroup();

    const path = nodeGroup.addShape('path', {
      attrs: {
        stroke: '#f00',
        lineWidth: 50,
        lineAppendWidth: 50,
        path: [["M", 120, 200], ["C", 200, -500, 200, -10000, 120, 5420]]
      },
      name: 'path-name'
    });



    let hit = false;
    canvas.on('path-name:click', e => {
      hit = true;
    });

    // 点击
    const el = canvas.get('el');
    simulateMouseEvent(el, 'mousedown', {
      clientX: 156,
      clientY: 488,
    });
    simulateMouseEvent(el, 'mouseup', {
      clientX: 156,
      clientY: 488,
    });
    
    expect(hit).eql(true);
    
  });
});
