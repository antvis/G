import Base from '../../src/abstract/base';
const expect = require('chai').expect;

describe('base test', () => {
  it('init', () => {
    const base = new Base({
      a: 'a',
      b: 'b',
    });
    expect(base.cfg).eqls({
      a: 'a',
      b: 'b',
    });
  });
  it('get', () => {
    const base = new Base({
      a: 'a',
      b: 'b',
    });
    expect(base.get('a')).equal('a');
    expect(base.get('b')).equal('b');
    expect(base.get('c')).equal(undefined);
  });
  it('set', () => {
    const base = new Base({
      a: 'a',
      b: 'b',
    });
    base.set('a', 'a1');
    base.set('c', 'c1');
    expect(base.get('a')).equal('a1');
    expect(base.get('b')).equal('b');
    expect(base.get('c')).equal('c1');
  });
  it('destroy', () => {
    const base = new Base({
      a: 'a',
      b: 'b',
    });
    base.on('click', () => {});
    expect(base.destroyed).equal(false);
    base.destroy();
    expect(base.cfg).eqls({ destroyed: true });
    expect(base.destroyed).equal(true);
    expect(base.getEvents().click).equal(undefined);
  });

  it('on', () => {
    const base = new Base({
      a: 'a',
      b: 'b',
    });
    function callback() {}
    base.on('click', callback);

    expect(base.getEvents().click.length).equal(1);
    expect(base.getEvents().click[0].callback).equal(callback);
  });

  it('trigger, emit', () => {
    const base = new Base({});

    let called = 0;
    function callback() {
      called++;
    }

    base.on('click', callback);
    base.emit('click');
    expect(called).equal(1);
    base.emit('click');
    expect(called).equal(2);
    base.on('click', () => {
      called = called + 2;
    });
    base.emit('click');
    expect(called).equal(5);
    expect(base.getEvents().click.length).equal(2);
    base.emit('test');
    expect(called).equal(5);
  });

  xit('trigger with args', () => {
    const base = new Base({});
    let p1;
    let p2;
    function callback(params) {
      p1 = params.p1;
      p2 = params.p2;
    }

    base.on('click', callback);
    base.emit('click', { p1: 1, p2: 2 });
    expect(p1).equal(1);
    expect(p2).equal(2);
  });

  it('off', () => {
    const base = new Base({});
    const callback = function() {};
    base.on('click', callback);
    base.on('click', () => {});

    base.on('test', () => {});
    expect(base.getEvents().click.length).equal(2);
    base.off('click', callback);
    expect(base.getEvents().click.length).equal(1);
    expect(base.getEvents().test.length).equal(1);
    // 移除不存在的事件
    base.off('test', callback);
    expect(base.getEvents().test.length).equal(1);

    base.off('test');
    expect(base.getEvents().test).equal(undefined);
    base.off();
    expect(base.getEvents().click).equal(undefined);
  });
});
