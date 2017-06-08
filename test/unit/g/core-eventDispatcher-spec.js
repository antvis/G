const expect = require('chai').expect;
const Util = require('../../../src/util/index');
const Dispatcher = require('../../../src/g/core/mixin/event-dispatcher');
const Element = function() {
  this.initEventDispatcher();
};

Util.augment(Element, Dispatcher);

describe('EventDispatcher', function() {

  it('trigger', function() {
    const element = new Element();
    element.on('test', function(e) {
      expect(e.target).to.eql(element);
      expect(e.type).to.equal('test');
    });
    element.trigger({ type: 'test' });
  });

  it('on', function() {
    const element = new Element();
    const test1 = function(e) {
      expect(e.target).to.eql(element);
      expect(e.type).to.equal('test');
      expect(e.target).to.eql(this);
    };

    const test2 = function(e) {
      expect(e.target).to.eql(element);
      expect(e.type).to.equal('test');
      expect(e.target).to.eql(this);
    };

    const exe1 = function(e) {
      expect(e.target).to.eql(element);
      expect(e.type).to.equal('exe');
      expect(e.target).to.eql(this);
    };

    const exe2 = function(e) {
      expect(e.target).to.eql(element);
      expect(e.type).to.equal('exe');
      expect(e.target).to.eql(this);
    };

    element.on('test', test1);
    element.on('test', test2);
    element.on('exe', exe1);
    element.on('exe', exe2);
    element.trigger({ type: 'test' });
    element.trigger({ type: 'exe' });
  });

  it('has', function() {
    const element = new Element();

    const test1 = function() {};
    const test2 = function() {};
    const test3 = function() {};
    element.on('test', test2);
    element.on('test', test1);
    expect(element.has('test', test1)).to.be.true;
    expect(element.has('test', test2)).to.be.true;
    expect(element.has('test', test3)).to.be.false;
  });

  it('off', function() {
    const element = new Element();

    const test1 = function() {};
    const test2 = function() {};
    const exe1 = function() {};
    const exe2 = function() {};
    const fun1 = function() {};
    const fun2 = function() {};

    element.on('test', test1);
    element.on('test', test2);
    element.on('exe', exe1);
    element.on('exe', exe2);
    element.on('fun', fun1);
    element.on('fun', fun2);


    expect(element.has('test', test1)).to.be.true;
    expect(element.has('test', test2)).to.be.true;
    expect(element.has('exe', exe1)).to.be.true;
    expect(element.has('exe', exe2)).to.be.true;
    expect(element.has('fun', fun1)).to.be.true;
    expect(element.has('fun', fun2)).to.be.true;
    expect(element.has()).to.be.true;
    expect(element.has('fun')).to.be.true;
    element.off('test', test1);
    expect(element.has('test', test1)).to.be.false;
    element.off('exe');
    expect(element.has('exe', exe1)).to.be.false;
    expect(element.has('exe', exe2)).to.be.false;
    element.off();
    expect(element.has('test', test2)).to.be.false;
    expect(element.has('fun', fun1)).to.be.false;
    expect(element.has('fun', fun2)).to.be.false;
    expect(element.has()).to.be.false;
    expect(element.has('fun')).to.be.false;
  });
});
