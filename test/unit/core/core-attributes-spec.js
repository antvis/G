const expect = require('chai').expect;
const Elements = require('../../../src/core/element');
describe('Attributes', function() {
  it('init', function() {
    const e = new Elements({
      attrs: {
        width: 100,
        height: 50
      }
    });


    expect(e.__attrs.width).to.equal(100);
    expect(e.__attrs.height).to.equal(50);
  });

  it('attr get', function() {
    const e = new Elements({
      attrs: {
        width: 100,
        height: 50
      }
    });

    expect(e.attr('width')).to.equal(100);
    expect(e.attr('height')).to.equal(50);
  });

  it('attr set', function() {
    const e = new Elements();

    e.attr('width', 300);
    expect(e.attr('width')).to.equal(300);
    e.attr('height', 40);
    expect(e.attr('height')).to.equal(40);
    e.attr({
      width: 100,
      text: '123'
    });
    expect(e.attr('width')).to.equal(100);
    expect(e.attr('text')).to.equal('123');
  });

  it('attr fill', function() {
    const e = new Elements({
      attrs: {
        fill: '#333333'
      }
    });
    e.attr('fill', '#333333');
    expect(e.attr('fill')).to.equal('#333333');
    expect(e.__attrs.fillStyle).to.equal('#333333');

    e.attr('fill', 'red');
    expect(e.attr('fill')).to.equal('red');
    expect(e.__attrs.fillStyle).to.equal('red');
  });

  it('attr stroke', function() {
    const e = new Elements({
      attrs: {
        stroke: 'black'
      }
    });
    e.attr('stroke', 'black');
    expect(e.attr('stroke')).to.equal('black');
    expect(e.__attrs.strokeStyle).to.equal('black');

    e.attr('stroke', '#999');
    expect(e.attr('stroke')).to.equal('#999');
    expect(e.__attrs.strokeStyle).to.equal('#999');
  });

  it('attr opacity', function() {
    const e = new Elements({
      attrs: {
        opacity: 0.1
      }
    });

    expect(e.attr('opacity')).to.equal(0.1);
    expect(e.__attrs.globalAlpha).to.equal(0.1);

    e.attr('opacity', 0.3);

    expect(e.attr('opacity')).to.equal(0.3);
    expect(e.__attrs.globalAlpha).to.equal(0.3);
  });

  it('attrAll', function() {
    const e = new Elements({
      attrs: {
        width: 100,
        opacity: 0.2,
        stroke: '#222',
        fill: '#444'
      }
    });

    const attrs = e.attr();
    expect(attrs.opacity).to.equal(0.2);
    expect(attrs.stroke).to.equal('#222');
    expect(attrs.fill).to.equal('#444');
    expect(attrs.width).to.equal(100);
  });
});
