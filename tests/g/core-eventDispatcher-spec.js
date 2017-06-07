var expect = require('@ali/expect.js');
var Util = require('@ali/g-util');
var Dispatcher = require('../../src/event/eventDispatcher');
var Element = function() {
  this.initEventDispatcher();
};

Util.augment(Element, Dispatcher);


describe('EventDispatcher', function() {

  it('trigger', function() {
    var element = new Element();
    element.on('test', function(e) {
      expect(e.target).to.be(element);
      expect(e.type).to.be('test');
    });
    element.trigger({type: 'test'});
  });

  it('on', function() {
    var element = new Element();
    var test1 = function(e) {
      expect(e.target).to.be(element);
      expect(e.type).to.be('test');
      expect(e.target).to.be(this);
    };

    var test2 = function(e) {
      expect(e.target).to.be(element);
      expect(e.type).to.be('test');
      expect(e.target).to.be(this);
    };

    var exe1 = function(e) {
      expect(e.target).to.be(element);
      expect(e.type).to.be('exe');
      expect(e.target).to.be(this);
    };

    var exe2 = function(e) {
      expect(e.target).to.be(element);
      expect(e.type).to.be('exe');
      expect(e.target).to.be(this);
    };

    element.on('test', test1);
    element.on('test', test2);
    element.on('exe', exe1);
    element.on('exe', exe2);
    element.trigger({type: 'test'});
    element.trigger({type: 'exe'});
  });

  it('has', function() {
    var element = new Element();

    var test1 = function() {};
    var test2 = function() {};
    var test3 = function() {};
    element.on('test', test2);
    element.on('test', test1);
    expect(element.has('test', test1)).to.be(true);
    expect(element.has('test', test2)).to.be(true);
    expect(element.has('test', test3)).to.be(false);
  });

  it('off', function() {
    var element = new Element();

    var test1 = function() {};
    var test2 = function() {};
    var exe1 = function() {};
    var exe2 = function() {};
    var fun1 = function() {};
    var fun2 = function() {};

    element.on('test', test1);
    element.on('test', test2);
    element.on('exe', exe1);
    element.on('exe', exe2);
    element.on('fun', fun1);
    element.on('fun', fun2);


    expect(element.has('test', test1)).to.be(true);
    expect(element.has('test', test2)).to.be(true);
    expect(element.has('exe', exe1)).to.be(true);
    expect(element.has('exe', exe2)).to.be(true);
    expect(element.has('fun', fun1)).to.be(true);
    expect(element.has('fun', fun2)).to.be(true);
    expect(element.has()).to.be(true);
    expect(element.has('fun')).to.be(true);
    element.off('test', test1);
    expect(element.has('test', test1)).to.be(false);
    element.off('exe');
    expect(element.has('exe', exe1)).to.be(false);
    expect(element.has('exe', exe2)).to.be(false);
    element.off();
    expect(element.has('test', test2)).to.be(false);
    expect(element.has('fun', fun1)).to.be(false);
    expect(element.has('fun', fun2)).to.be(false);
    expect(element.has()).to.be(false);
    expect(element.has('fun')).to.be(false);
  });
});
