const expect = require('chai').expect;
const DOMUtil = require('../../../src/util/dom');

describe('DomUtils', () => {
  const nodeNotExist = null;

  it('getBoundingClientRect(node, defaultValue)', () => {
    expect(() => {
      DOMUtil.getBoundingClientRect(nodeNotExist);
    }).to.not.throw();
  });

  it('getStyle(node, name, defaultValue)', () => {
    expect(() => {
      DOMUtil.getStyle(nodeNotExist, 'width');
    }).to.not.throw();
    expect(DOMUtil.getStyle(nodeNotExist, 'width', 450)).to.equal(450);
  });

  it('modifyCSS(node, css)', () => {
    expect(() => {
      DOMUtil.modifyCSS(nodeNotExist, {
        width: '500px'
      });
    }).to.not.throw();
  });

  it('getWidth(node, defaultValue)', () => {
    expect(() => {
      DOMUtil.getWidth(nodeNotExist, 500);
    }).to.not.throw();
    expect(DOMUtil.getWidth(nodeNotExist, 450)).to.equal(450);
  });

  it('getHeight(node, defaultValue)', () => {
    expect(() => {
      DOMUtil.getHeight(nodeNotExist, 500);
    }).to.not.throw();
    expect(DOMUtil.getHeight(nodeNotExist, 450)).to.equal(450);
  });

  it('getOuterWidth(node, defaultValue)', () => {
    expect(() => {
      DOMUtil.getOuterWidth(nodeNotExist, 500);
    }).to.not.throw();
    expect(DOMUtil.getOuterWidth(nodeNotExist, 450)).to.equal(450);
  });

  it('getOuterHeight(node, defaultValue)', () => {
    expect(() => {
      DOMUtil.getOuterHeight(nodeNotExist, 500);
    }).to.not.throw();
    expect(DOMUtil.getOuterHeight(nodeNotExist, 450)).to.equal(450);
  });

  it('addEventListener(node, eventType, callback)', () => {
    expect(() => {
      DOMUtil.addEventListener(nodeNotExist, 'click', () => {});
    }).to.not.throw();
  });
});
