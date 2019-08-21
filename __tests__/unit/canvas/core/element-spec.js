const mat3 = require('@antv/gl-matrix/lib/gl-matrix/mat3');
import { expect } from 'chai';
import { Element } from '../../../../src/index';

describe('Element', function() {
  it('constructor', function() {
    const e = new Element({
      id: 'aaa',
      attrs: {
        width: 20,
        height: 30,
        stroke: '#231',
      },
    });

    expect(e.cfg).not.to.be.undefined;
    expect(e.cfg.id).to.equal('aaa');
    expect(e.attrs).not.to.be.undefined;
    expect(e.attrs.width).to.equal(20);
    expect(e.attrs.height).to.equal(30);
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
    expect(ele.emit).to.be.a('function');
  });

  it('add event listener', function() {
    const ele = new Element();
    let count = 1;
    ele.on('test', function(v1, v2) {
      count += v1 + v2;
    });
    ele.emit('test', 12, 13);
    expect(count).to.equal(26);
    expect(ele.getEvents()).to.have.own.property('test');

    ele.destroy();
    expect(ele.getEvents()).to.eql({});
  });
});
