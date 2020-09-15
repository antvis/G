const expect = require('chai').expect;
import Canvas from '../../src/canvas';
import { simulateMouseEvent, getClientPoint } from '../util';

const dom = document.createElement('div');
document.body.appendChild(dom);
dom.id = 'long-path';


describe('long path event', () => {
  it('long path event', () => {
    const canvas = new Canvas({
      container: dom,
      width: 2400,
      height: 2400,
    });
    const group = canvas.addGroup();
    const nodeGroup = group.addGroup();

    nodeGroup.addShape('path', {
      attrs: {
        stroke: '#f00',
        lineWidth: 50,
        lineAppendWidth: 50,
        path: [["M", 120, 200], ["C", 200, -500, 200, -10000, 120, 5420]]
      },
      name: 'path-name'
    });



    let hit = false;
    canvas.on('path-name:click', () => {
      hit = true;
    });

    const { clientX, clientY } = getClientPoint(canvas, 156, 320);

    // 点击
    const el = canvas.get('el');
    simulateMouseEvent(el, 'mousedown', {
      clientX,
      clientY,
    });
    simulateMouseEvent(el, 'mouseup', {
      clientX,
      clientY,
    });
    
    expect(hit).eql(true);
    
  });
});
