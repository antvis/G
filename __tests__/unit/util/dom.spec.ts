import chai, { expect } from 'chai';
import chaiAlmost from 'chai-almost';
import sinonChai from 'sinon-chai';
import {
  getWidth,
  getHeight,
  setDOMSize,
  sortByZIndex,
  findClosestClipPathTarget,
} from '../../../packages/g-lite/src/utils';
import { Group, Circle } from '../../../packages/g-lite/src/display-objects';

chai.use(chaiAlmost());
chai.use(sinonChai);

describe('DOM utils', () => {
  it('should setDOMSize correctly.', () => {
    const $el = document.createElement('canvas');
    window.document.body.appendChild($el);
    setDOMSize($el, 100, 100);
    expect($el.style.width).to.be.eqls('100px');
    expect($el.style.height).to.be.eqls('100px');
  });

  it('should getWidth/Height correctly.', () => {
    const $el = document.createElement('div');
    window.document.body.appendChild($el);

    $el.style.height = '100px';
    $el.style.width = '100px';
    expect(getWidth($el)).to.be.eqls(100);
    expect(getHeight($el)).to.be.eqls(100);

    $el.style.height = 'auto';
    $el.style.width = 'auto';

    expect(getWidth($el)).to.be.greaterThan(0);
    expect(getHeight($el)).to.be.eqls(0);
  });

  it('should sort by zIndex correctly.', () => {
    const g1 = new Group();
    const g2 = new Group();

    g1.style.zIndex = 1;
    g2.style.zIndex = 2;

    expect(sortByZIndex(g1, g2)).to.be.eqls(-1);

    const parent = new Group();
    parent.appendChild(g2);
    parent.appendChild(g1);

    g1.style.zIndex = 1;
    g2.style.zIndex = 1;

    expect(sortByZIndex(g1, g2)).to.be.eqls(1);
  });

  it('should findClosestClipPathTarget correctly.', () => {
    const g1 = new Group();
    const g2 = new Group();

    const parent = new Group();
    parent.appendChild(g2);
    parent.appendChild(g1);

    expect(findClosestClipPathTarget(g1)).to.be.null;
    expect(findClosestClipPathTarget(g2)).to.be.null;

    parent.style.clipPath = new Circle();

    expect(findClosestClipPathTarget(g1)).to.be.eqls(parent);
    expect(findClosestClipPathTarget(g2)).to.be.eqls(parent);
  });
});
