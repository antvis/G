const expect = require('chai').expect;
const Element = require('../../../../src/core/element');
const mat3 = require('@antv/gl-matrix/lib/gl-matrix/mat3');

describe('Element', function() {
  it('constructor', function() {
    const e = new Element({
      id: 'aaa',
      attrs: {
        width: 20,
        height: 30,
        stroke: '#231'
      }
    });

    expect(e._cfg).not.to.be.undefined;
    expect(e._cfg.id).to.equal('aaa');
    expect(e._attrs).not.to.be.undefined;
    expect(e._attrs.width).to.equal(20);
    expect(e._attrs.height).to.equal(30);
    expect(e.attr('matrix')).not.to.be.undefined;
    const m = mat3.create();
    expect(mat3.exactEquals(e.attr('matrix'), m)).to.be.true;
  });

  /* @deprecated
  it('set and get', () => {
    const e = new Element();
    let a = 123;
    expect(a).to.equal(123);
    e._beforeSetTest = function(v) {
      a = 321;
      return v - 1;
    };
    e.set('test', 1111);
    expect(e.get('test')).to.equal(1110);
    expect(a).to.equal(321);
  });*/

  it('eventEmitter', function() {
    const ele = new Element();
    expect(ele.on).to.be.a('function');
    expect(ele.off).to.be.a('function');
    expect(ele.trigger).to.be.a('function');
  });

  it('add event listener', function() {
    const ele = new Element();
    let count = 1;
    ele.on('test', function(v1, v2) {
      count += (v1 + v2);
    });
    ele.trigger('test', 12, 13);
    expect(count).to.equal(26);
    expect(ele._cfg._events).to.have.own.property('test');

    ele.destroy();
    expect(ele._cfg._events).to.be.undefined;
  });
});
