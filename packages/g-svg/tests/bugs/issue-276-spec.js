const expect = require('chai').expect;
import Canvas from '../../src/canvas';
import Group from '../../src/group';

const dom = document.createElement('div');
document.body.appendChild(dom);
dom.id = 'c1';

describe('#276', () => {
  const canvas = new Canvas({
    container: dom,
    width: 600,
    height: 600,
  });

  it('should work correctly when group and shape are not mounted under canvas', () => {
    const group = new Group({});
    const shape = group.addShape('marker', {
      attrs: {
        x: 100,
        y: 100,
        r: 30,
        fill: 'red',
        symbol: 'circle',
      },
    });
    expect(shape.attr('fill')).eqls('red');
    expect(shape.get('el')).eqls(undefined);
    expect(canvas.getChildren().length).eqls(0);
    shape.attr('fill', 'blue');
    canvas.add(group);
    expect(shape.get('el')).not.eqls(undefined);
    expect(shape.attr('fill')).eqls('blue');
    expect(canvas.getChildren().length).eqls(1);
  });
});
