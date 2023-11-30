import { Circle, Group } from '../../../packages/g-lite/src/display-objects';
import {
  findClosestClipPathTarget,
  getHeight,
  getWidth,
  setDOMSize,
  sortByZIndex,
} from '../../../packages/g-lite/src/utils';

describe.skip('DOM utils', () => {
  it('should setDOMSize correctly.', () => {
    const $el = document.createElement('canvas');
    window.document.body.appendChild($el);
    setDOMSize($el, 100, 100);
    expect($el.style.width).toBe('100px');
    expect($el.style.height).toBe('100px');
  });

  it('should getWidth/Height correctly.', () => {
    const $el = document.createElement('div');
    window.document.body.appendChild($el);

    $el.style.height = '100px';
    $el.style.width = '100px';
    expect(getWidth($el)).toBe(100);
    expect(getHeight($el)).toBe(100);

    $el.style.height = 'auto';
    $el.style.width = 'auto';

    expect(getWidth($el)).toBeGreaterThan(0);
    expect(getHeight($el)).toBe(0);
  });

  it('should sort by zIndex correctly.', () => {
    const g1 = new Group();
    const g2 = new Group();

    g1.style.zIndex = 1;
    g2.style.zIndex = 2;

    expect(sortByZIndex(g1, g2)).toBe(-1);

    const parent = new Group();
    parent.appendChild(g2);
    parent.appendChild(g1);

    g1.style.zIndex = 1;
    g2.style.zIndex = 1;

    expect(sortByZIndex(g1, g2)).toBe(1);
  });

  it('should findClosestClipPathTarget correctly.', () => {
    const g1 = new Group();
    const g2 = new Group();

    const parent = new Group();
    parent.appendChild(g2);
    parent.appendChild(g1);

    expect(findClosestClipPathTarget(g1)).toBeNull();
    expect(findClosestClipPathTarget(g2)).toBeNull();

    parent.style.clipPath = new Circle();

    expect(findClosestClipPathTarget(g1)).toBe(parent);
    expect(findClosestClipPathTarget(g2)).toBe(parent);
  });
});
