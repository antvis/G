var expect = require('@ali/expect.js');
var Elements = require('../../src/g/core/element');
describe('Attributes', function() {
  it ('init', function() {
    var e = new Elements({
      attrs: {
        width: 100,
        height: 50
      }
    });


    expect(e.__attrs.width).to.be(100);
    expect(e.__attrs.height).to.be(50);
  });

  it('attr get', function(){
    var e = new Elements({
      attrs: {
        width: 100,
        height: 50
      }
    });

    expect(e.attr('width')).to.be(100);
    expect(e.attr('height')).to.be(50);
  });

  it('attr set', function() {
    var e = new Elements();

    e.attr('width', 300);
    expect(e.attr('width')).to.be(300);
    e.attr('height', 40);
    expect(e.attr('height')).to.be(40);
    e.attr({
      width: 100,
      text: '123'
    });
    expect(e.attr('width')).to.be(100);
    expect(e.attr('text')).to.be('123');
  });

  it('attr fill', function() {
    var e = new Elements({
      attrs: {
        fill: '#333333'
      }
    });
    e.attr('fill', '#333333')
    expect(e.attr('fill')).to.be('#333333');
    expect(e.__attrs['fillStyle']).to.be('#333333');

    e.attr('fill', 'red');
    expect(e.attr('fill')).to.be('red');
    expect(e.__attrs['fillStyle']).to.be('red');
  });

  it('attr stroke', function() {
    var e = new Elements({
      attrs: {
        stroke: 'black'
      }
    });
    e.attr('stroke', 'black');
    expect(e.attr('stroke')).to.be('black');
    expect(e.__attrs['strokeStyle']).to.be('black');

    e.attr('stroke', '#999');
    expect(e.attr('stroke')).to.be('#999');
    expect(e.__attrs['strokeStyle']).to.be('#999');
  });

  it('attr opacity', function() {
    var e = new Elements({
      attrs: {
        opacity: 0.1
      }
    });

    expect(e.attr('opacity')).to.be(0.1);
    expect(e.__attrs['globalAlpha']).to.be(0.1);

    e.attr('opacity', 0.3);

    expect(e.attr('opacity')).to.be(0.3);
    expect(e.__attrs['globalAlpha']).to.be(0.3);
  });

  it('attrAll', function() {
    var e = new Elements({
      attrs: {
        width: 100,
        opacity: 0.2,
        stroke: '#222',
        fill: '#444'
      }
    });

    var attrs = e.attr();
    expect(attrs.opacity).to.be(0.2);
    expect(attrs.stroke).to.be('#222');
    expect(attrs.fill).to.be('#444');
    expect(attrs.width).to.be(100);
  });
});
