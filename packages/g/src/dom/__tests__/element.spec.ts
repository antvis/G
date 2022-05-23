import { Element, Node } from '@antv/g';
import chai, { expect } from 'chai';
// @ts-ignore
import chaiAlmost from 'chai-almost';
// @ts-ignore
import sinonChai from 'sinon-chai';

chai.use(chaiAlmost());
chai.use(sinonChai);

describe('DOM Element API', () => {
  it('should appendChild with before & after correctly', () => {
    const group1 = new Element();
    const group2 = new Element();
    const group3 = new Element();
    const group4 = new Element();
    const group5 = new Element();
    group5.name = 'group5';
    expect(group1.getAttributeNames()).to.eqls([]);
    expect(group1.hasAttributes()).to.be.false;
    expect(group1.nodeValue).to.be.null;
    expect(group1.textContent).to.eqls('');
    expect(group1.hasChildNodes()).to.false;
    expect(group1.getRootNode()).to.eqls(group1);
    expect(group1.compareDocumentPosition(group1)).to.eqls(0);
    expect(group1.compareDocumentPosition(group2)).to.eqls(
      Node.DOCUMENT_POSITION_DISCONNECTED |
        Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC |
        Node.DOCUMENT_POSITION_PRECEDING,
    );

    // 1 -> 2 -> 3
    // 1 -> 4
    group1.appendChild(group2);
    group2.appendChild(group3);
    group1.appendChild(group4);
    expect(group1.compareDocumentPosition(group2)).to.eqls(
      Node.DOCUMENT_POSITION_CONTAINED_BY | Node.DOCUMENT_POSITION_FOLLOWING,
    );
    expect(group2.compareDocumentPosition(group1)).to.eqls(
      Node.DOCUMENT_POSITION_CONTAINS | Node.DOCUMENT_POSITION_PRECEDING,
    );
    expect(group4.compareDocumentPosition(group2)).to.eqls(Node.DOCUMENT_POSITION_PRECEDING);
    expect(group2.compareDocumentPosition(group4)).to.eqls(Node.DOCUMENT_POSITION_FOLLOWING);

    // query children & parent
    expect(group1.contain(group2)).to.true;
    expect(group1.contains(group3)).to.true;
    expect(group1.hasChildNodes()).to.true;
    expect(group1.childElementCount).to.eqls(2);
    expect(group1.childNodes.length).to.eqls(2);
    expect(group1.children.length).to.eqls(2);
    expect(group1.firstElementChild).to.eqls(group2);
    expect(group1.firstChild).to.eqls(group2);
    expect(group1.lastElementChild).to.eqls(group4);
    expect(group1.lastChild).to.eqls(group4);
    expect(group2.parentNode).to.eqls(group1);
    expect(group2.parentElement).to.eqls(group1);
    expect(group1.parentNode).to.null;
    expect(group3.parentNode).to.eqls(group2);
    expect(group4.firstChild).to.null;
    expect(group4.lastChild).to.null;
    expect(group3.getRootNode()).to.eqls(group1);
    expect(group3.getAncestor(1)).to.eqls(group2);
    expect(group3.getAncestor(2)).to.eqls(group1);
    expect(group3.getAncestor(3)).to.null;

    // 1 -> 5
    group1.appendChild(group5, 1);
    expect(group1.contains(group5)).to.true;
    expect(group1.childNodes.length).to.eqls(3);
    expect(group1.childNodes[1]).to.eqls(group5);
    expect(group1.firstChild).to.eqls(group2);
    expect(group1.lastChild).to.eqls(group4);

    // insert in a batch with after
    const group6 = new Element();
    group6.name = 'group6';
    const group7 = new Element();
    group7.name = 'group7';
    group5.after(group6, group7);
    expect(group1.childNodes.length).to.eqls(5);
    expect(group5.nextSibling).to.eqls(group6);
    expect(group6.previousSibling).to.eqls(group5);
    expect(group6.nextSibling).to.eqls(group7);
    expect(group7.nextSibling).to.eqls(group4);
    // expect(group6.getAttribute('name')).to.be.eqls('group6');
    expect(group6.matches('[name=group6]')).to.be.true;
    expect(group6.matches('[name=group7]')).to.be.false;
    expect(group6.matches('.c')).to.be.false;
    expect(group6.matches('#c')).to.be.false;
    expect(group7.matches('[name=group7]')).to.be.true;
    expect(group6.closest('[name=group6]')).to.be.eqls(group6);

    // remove group6 & group7
    group6.remove(false);
    group7.remove(false);
    expect(group1.childNodes.length).to.eqls(3);
    group5.before(group6, group7);
    expect(group1.childNodes.length).to.eqls(5);
    expect(group6.nextSibling).to.eqls(group7);
    expect(group7.nextSibling).to.eqls(group5);
  });

  it('should append & prepend correctly', () => {
    const group1 = new Element();
    const group2 = new Element();
    const group3 = new Element();
    const group4 = new Element();
    const group5 = new Element();

    group1.append(group2, group3);
    expect(group1.childNodes.length).to.eqls(2);
    expect(group1.firstChild).to.eqls(group2);
    expect(group1.lastChild).to.eqls(group3);

    group1.prepend(group4, group5);
    expect(group1.childNodes.length).to.eqls(4);
    expect(group1.firstChild).to.eqls(group4);
    expect(group1.lastChild).to.eqls(group3);
  });

  it('should replaceWith correctly', () => {
    const group1 = new Element();
    const group2 = new Element();
    const group3 = new Element();
    const group4 = new Element();
    const group5 = new Element();
    const group6 = new Element();
    const group7 = new Element();

    // 1 -> 2 -> 3
    // 1 -> 4
    group1.appendChild(group2);
    group2.appendChild(group3);
    group1.appendChild(group4);

    group2.replaceWith(group5, group6);
    expect(group1.childNodes.length).to.eqls(3);
    expect(group5.nextSibling).to.eqls(group6);
    expect(group6.nextSibling).to.eqls(group4);

    group1.replaceChild(group7, group6, true);
    expect(group6.destroyed).to.true;
    expect(group1.childNodes.length).to.eqls(3);
    expect(group5.nextSibling).to.eqls(group7);
    expect(group7.nextSibling).to.eqls(group4);

    // clear
    group1.replaceChildren();
    expect(group1.childNodes.length).to.eqls(0);
  });
});
