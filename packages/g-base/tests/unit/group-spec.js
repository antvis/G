const expect = require('chai').expect;
import Group from '../../src/abstract/group';
import Shape from '../../src/abstract/shape';

class MyShape extends Shape {
  calculateBBox() {
    const { x, y, width, height } = this.attrs;

    return {
      minX: x,
      minY: y,
      maxX: x + width,
      maxY: y + height,
    };
  }
}

class MyGroup extends Group {
  getShapeBase() {
    return MyShape;
  }

  getGroupBase() {
    return MyGroup;
  }
}

class MyCircle extends MyShape {
  calculateBBox() {
    const { x, y, r } = this.attrs;
    return {
      minX: x - r,
      minY: y - r,
      maxX: x + r,
      maxY: y + r,
    };
  }
}

MyShape.Circle = MyCircle;

describe('test group', () => {
  const group = new MyGroup({});
  it('init', () => {
    expect(group.getChildren().length).eqls(0);
  });
  it('add group', () => {
    const subGroup = group.addGroup({
      id: '2',
      capture: false,
    });
    expect(group.getChildren().length).eqls(1);
    expect(subGroup.get('id')).eqls('2');
    subGroup.addShape({
      type: 'circle',
      attrs: {
        x: 20,
        y: 20,
        r: 10,
      },
    });
  });
  it('add shape', () => {
    const shape = group.addShape('circle', {
      attrs: {
        x: 10,
        y: 10,
        r: 10,
      },
    });
    expect(shape.getBBox()).eqls({
      minX: 0,
      minY: 0,
      maxX: 20,
      maxY: 20,
    });
  });

  it('bbox', () => {
    group.addShape({
      type: 'circle',
      attrs: {
        x: -10,
        y: -10,
        r: 10,
      },
    });

    const bbox = group.getBBox();
    expect(bbox.minX).eqls(-20);
    expect(bbox.minY).eqls(-20);
    expect(bbox.maxX).eqls(30);
    expect(bbox.maxY).eqls(30);
    const canvasBox = group.getCanvasBBox();
    expect(canvasBox).eqls(bbox);
  });

  it('remove shape', () => {
    const count = group.getChildren().length;
    const shape = group.addShape({
      type: 'circle',
      attrs: {
        x: 30,
        y: 30,
        r: 10,
      },
    });
    expect(group.getChildren().length).eqls(count + 1);
    shape.remove();
    expect(shape.destroyed).eqls(true);
    expect(group.getChildren().length).eqls(count);
  });

  it('clone', () => {
    const newGroup = group.clone();
    expect(newGroup.getChildren().length).eqls(group.getChildren().length);
    expect(newGroup.getChildren()[0].get('capture')).eqls(false);
  });

  it('clear', () => {
    group.clear();
    expect(group.getChildren().length).eqls(0);
    const bbox = group.getBBox();
    expect(bbox.minX).eqls(0);
    expect(bbox.minY).eqls(0);
    expect(bbox.maxX).eqls(0);
    expect(bbox.maxY).eqls(0);
    expect(group.getCanvasBBox()).eqls(group.getBBox());
  });
});

describe('test with matrix', () => {
  const group = new MyGroup({});
  const group1 = group.addGroup();
  // const group2 = group.addGroup();
  const group11 = group1.addGroup();
  let shape;
  const m = [1, 0, 0, 0, 1, 0, 0, 0, 1];
  const m1 = [2, 0, 0, 0, 2, 0, 0, 0, 1];
  const m2 = [2, 0, 0, 0, 3, 0, 0, 0, 1];
  const m3 = [4, 0, 0, 0, 6, 0, 0, 0, 1];

  it('matrix', () => {
    expect(group.getTotalMatrix()).eqls(undefined);
    expect(group1.getTotalMatrix()).eqls(undefined);

    group.setMatrix(m);
    expect(group.getTotalMatrix()).eqls(m);
    expect(group1.getTotalMatrix()).eqls(m);
    expect(group11.getTotalMatrix()).eqls(m);
    group1.attr('matrix', m1);
    expect(group1.getTotalMatrix()).eqls(m1);
    expect(group11.getTotalMatrix()).eqls(m1);

    group11.attr('matrix', m2);
    expect(group11.getTotalMatrix()).eqls(m3);
  });

  it('add group', () => {
    const group3 = group.addGroup();
    expect(group3.getTotalMatrix()).eqls(m);
    const group12 = group1.addGroup();
    expect(group12.getTotalMatrix()).eqls(m1);
    group1.resetMatrix();
    expect(group1.getTotalMatrix()).eqls(m);
    expect(group11.getTotalMatrix()).eqls(m2);
    group11.resetMatrix();
    expect(group11.getTotalMatrix()).eqls(m);
  });

  it('add shape', () => {
    shape = group11.addShape({
      type: 'circle',
      attrs: {
        x: 20,
        y: 20,
        r: 10,
      },
    });
    expect(shape.getTotalMatrix()).eqls(m);
    group1.attr('matrix', m1);
    expect(shape.getTotalMatrix()).eqls(m1);
    group11.attr('matrix', m2);
    expect(shape.getTotalMatrix()).eqls(m3);

    shape.attr('matrix', m1);
    expect(shape.getTotalMatrix()).eqls([8, 0, 0, 0, 12, 0, 0, 0, 1]);
    shape.attr('matrix', null);
    expect(shape.getTotalMatrix()).eqls(m3);

    group1.attr('matrix', null);
    expect(shape.getTotalMatrix()).eqls(m2);
    const bbox = shape.getBBox();
    expect(bbox.minX).equal(10);
    expect(bbox.minY).equal(10);
    expect(bbox.maxX).equal(30);
    expect(bbox.maxY).equal(30);
    const shapeCanvasBBox = shape.getCanvasBBox();
    expect(shapeCanvasBBox.minX).equal(20);
    expect(shapeCanvasBBox.minY).equal(30);
    expect(shapeCanvasBBox.maxX).equal(60);
    expect(shapeCanvasBBox.maxY).equal(90);
    expect(group.getCanvasBBox()).eqls(shapeCanvasBBox);
  });

  it('applyToMatrix, invertFromMatrix', () => {
    group.attr('matrix', m);
    const v = [10, 5];
    expect(group.applyToMatrix(v)).eqls(v);
    expect(group.invertFromMatrix(v)).eqls(v);
    group1.attr('matrix', m1);
    expect(group1.applyToMatrix(v)).eqls([20, 10]);
    expect(group1.invertFromMatrix(v)).eqls([5, 2.5]);
    group11.attr('matrix', m2);
    expect(group11.applyToMatrix(v)).eqls([20, 15]);
    expect(group11.invertFromMatrix([20, 15])).eqls(v);
    group.attr('matrix', null);
    expect(group.applyToMatrix(v)).eqls(v);
    expect(group.invertFromMatrix(v)).eqls(v);
  });
});

describe('test group member function', () => {
  const group = new Group({
    children: [
      new MyShape({ id: '01', name: 'shape', text: '01' }),
      new MyShape({ id: '02', name: 'shape', text: '02' }),
      new Group({
        children: [
          new MyShape({ id: '04', name: 'shape', text: '04' }),
          new MyShape({ id: 'test', name: 'shape', text: '02' }),
        ],
      }),
      new MyShape({ id: '03', name: 'shape', text: '03' }),
    ],
  });

  it('getFirst', () => {
    expect(group.getFirst().get('id')).eqls('01');
  });

  it('getLast', () => {
    expect(group.getLast().get('id')).eqls('03');
  });

  it('getCount', () => {
    expect(group.getCount()).eqls(group.getChildren().length);
  });

  it('findAll', () => {
    expect(
      group.findAll((item) => {
        return item.get('text') === '02';
      }).length
    ).eqls(2);

    expect(
      group.findAll((item) => {
        return item.get('text') === '05';
      }).length
    ).eqls(0);
  });

  it('find', () => {
    expect(
      group
        .find((item) => {
          return item.get('text') === '02';
        })
        .get('id')
    ).eqls('02');
    expect(
      group.find((item) => {
        return item.get('text') === '05';
      })
    ).eqls(null);
  });

  it('findById', () => {
    expect(group.findById('01')).not.eqls(null);
    expect(group.findById('05')).eqls(null);
    expect(group.findById('04')).not.eqls(null);
  });

  it('findAllByName', () => {
    expect(group.findAllByName('shape').length).eqls(5);
  });
});
