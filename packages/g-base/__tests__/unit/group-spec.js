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
    expect(bbox).eqls({
      minX: -20,
      minY: -20,
      maxX: 30,
      maxY: 30,
      width: 50,
      height: 50,
    });
  });
  it('clone', () => {
    const newGroup = group.clone();
    expect(newGroup.getChildren().length).eqls(group.getChildren().length);
    expect(newGroup.getChildren()[0].get('capture')).eqls(false);
  });
});
