const expect = require('chai').expect;
const DOMUtil = require('../../../src/util/dom');

describe('DomUtils', function() {
  const nodeNotExist = null;

  it('getBoundingClientRect(node, defaultValue)', function() {
    expect(function() {
      DOMUtil.getBoundingClientRect(nodeNotExist);
    }).to.not.throw();
  });

  it('getStyle(node, name, defaultValue)', function() {
    expect(function() {
      DOMUtil.getStyle(nodeNotExist, 'width');
    }).to.not.throw();
    expect(DOMUtil.getStyle(nodeNotExist, 'width', 450)).to.equal(450);
  });

  it('modifyCSS(node, css)', function() {
    expect(function() {
      DOMUtil.modifyCSS(nodeNotExist, {
        width: '500px'
      });
    }).to.not.throw();
  });

  it('getWidth(node, defaultValue)', function() {
    expect(function() {
      DOMUtil.getWidth(nodeNotExist, 500);
    }).to.not.throw();
    expect(DOMUtil.getWidth(nodeNotExist, 450)).to.equal(450);
  });

  it('getHeight(node, defaultValue)', function() {
    expect(function() {
      DOMUtil.getHeight(nodeNotExist, 500);
    }).to.not.throw();
    expect(DOMUtil.getHeight(nodeNotExist, 450)).to.equal(450);
  });

  it('getOuterWidth(node, defaultValue)', function() {
    expect(function() {
      DOMUtil.getOuterWidth(nodeNotExist, 500);
    }).to.not.throw();
    expect(DOMUtil.getOuterWidth(nodeNotExist, 450)).to.equal(450);
  });

  it('getOuterHeight(node, defaultValue)', function() {
    expect(function() {
      DOMUtil.getOuterHeight(nodeNotExist, 500);
    }).to.not.throw();
    expect(DOMUtil.getOuterHeight(nodeNotExist, 450)).to.equal(450);
  });

  it('addEventListener(node, eventType, callback)', function() {
    expect(function() {
      DOMUtil.addEventListener(nodeNotExist, 'click', function() {});
    }).to.not.throw();
  });
});
