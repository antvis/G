import chai, { expect } from 'chai';
import { LayoutObject, CSS, CSSKeywordValue } from '@antv/g';
import { Layout as BlockLikeLayout } from '@antv/g-layout-blocklike';

describe('BlockLikeLayout', () => {
  it('should compute block layout correctly.', async () => {
    CSS.registerLayout('block', BlockLikeLayout);

    const parent = new LayoutObject();
    parent.setStyle('width', CSS.px(200));
    parent.setStyle('height', CSS.px(200));
    parent.setStyle('display', new CSSKeywordValue('block'));

    const child = new LayoutObject();
    child.setStyle('width', CSS.px(100));
    child.setStyle('height', CSS.px(100));

    parent.addChild(child);

    await parent.computeLayout();

    // const childLayout = child.getComputedLayout();
    // let parentLayout = parent.getComputedLayout();
    // expect(childLayout?.blockSize).to.be.eqls(100);
    // expect(childLayout?.inlineSize).to.be.eqls(100);
    // expect(childLayout?.inlineOffset).to.be.eqls(0);
    // expect(childLayout?.blockOffset).to.be.eqls(0);
    // expect(parentLayout?.blockSize).to.be.eqls(200);
    // expect(parentLayout?.inlineSize).to.be.eqls(200);

    // const child2 = new LayoutObject();
    // child2.setStyle('width', CSS.px(60));
    // child2.setStyle('height', CSS.px(80));

    // parent.addChild(child2);

    // await parent.computeLayout();

    // parentLayout = parent.getComputedLayout();

    // const child1Layout = child.getComputedLayout();

    // const child2Layout = child2.getComputedLayout();

    // expect(parentLayout?.inlineSize).to.be.eqls(200);
    // expect(parentLayout?.blockSize).to.be.eqls(100);

    // expect(child1Layout?.inlineSize).to.be.eqls(100);
    // expect(child1Layout?.blockSize).to.be.eqls(50);

    // expect(child1Layout?.inlineOffset).to.be.eqls(50);
    // expect(child1Layout?.blockOffset).to.be.eqls(0);

    // expect(child2Layout?.inlineSize).to.be.eqls(60);
    // expect(child2Layout?.blockSize).to.be.eqls(80);

    // expect(child2Layout?.inlineOffset).to.be.eqls(70);
    // expect(child2Layout?.blockOffset).to.be.eqls(50);
  });
});
