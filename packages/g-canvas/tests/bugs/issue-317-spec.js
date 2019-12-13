const expect = require('chai').expect;
import Group from '../../src/group';

describe('#317', () => {
  it('setClip should work when shape not mounted under canvas', () => {
    const group = new Group({});
    const rect = group.addShape('rect', {
      attrs: {
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        fill: 'red',
      },
    });
    const clipShape = rect.setClip({
      type: 'circle',
      attrs: {
        x: 50,
        y: 50,
        r: 200,
      },
    });
    expect(clipShape).not.eqls(undefined);
    expect(clipShape.get('type')).eqls('circle');
    const bbox = clipShape.getBBox();
    expect(bbox.minX).eqls(-150);
    expect(bbox.minY).eqls(-150);
    expect(bbox.maxX).eqls(250);
    expect(bbox.maxY).eqls(250);
  });
});
