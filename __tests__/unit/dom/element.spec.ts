import { Element, Node, resetEntityCounter } from '../../../packages/g/src';

describe('DOM Element API', () => {
  it('should reset EntityCounter', () => {
    resetEntityCounter();
    let group1 = new Element();
    let group2 = new Element();
    expect(group1.entity).toBe(0);
    expect(group2.entity).toBe(1);

    resetEntityCounter();
    group1 = new Element();
    group2 = new Element();
    expect(group1.entity).toBe(0);
    expect(group2.entity).toBe(1);
  });

  it('should appendChild with before & after correctly', () => {
    const group1 = new Element();
    const group2 = new Element();
    const group3 = new Element();
    const group4 = new Element();
    const group5 = new Element();
    group5.name = 'group5';
    expect(group1.getAttributeNames()).toStrictEqual([]);
    expect(group1.hasAttributes()).toBeFalsy();
    expect(group1.nodeValue).toBeNull();
    expect(group1.textContent).toBe('');
    expect(group1.hasChildNodes()).toBeFalsy();
    expect(group1.getRootNode()).toBe(group1);
    expect(group1.compareDocumentPosition(group1)).toBe(0);
    expect(group1.compareDocumentPosition(group2)).toBe(
      Node.DOCUMENT_POSITION_DISCONNECTED |
        Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC |
        Node.DOCUMENT_POSITION_PRECEDING,
    );

    // 1 -> 2 -> 3
    // 1 -> 4
    group1.appendChild(group2);
    group2.appendChild(group3);
    group1.appendChild(group4);
    expect(group1.compareDocumentPosition(group2)).toBe(
      Node.DOCUMENT_POSITION_CONTAINED_BY | Node.DOCUMENT_POSITION_FOLLOWING,
    );
    expect(group2.compareDocumentPosition(group1)).toBe(
      Node.DOCUMENT_POSITION_CONTAINS | Node.DOCUMENT_POSITION_PRECEDING,
    );
    expect(group4.compareDocumentPosition(group2)).toBe(
      Node.DOCUMENT_POSITION_PRECEDING,
    );
    expect(group2.compareDocumentPosition(group4)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );

    // query children & parent
    expect(group1.contain(group2)).toBeTruthy();
    expect(group1.contains(group3)).toBeTruthy();
    expect(group1.hasChildNodes()).toBeTruthy();
    expect(group1.childElementCount).toBe(2);
    expect(group1.childNodes.length).toBe(2);
    expect(group1.children.length).toBe(2);
    expect(group1.firstElementChild).toBe(group2);
    expect(group1.firstChild).toBe(group2);
    expect(group1.lastElementChild).toBe(group4);
    expect(group1.lastChild).toBe(group4);
    expect(group2.parentNode).toBe(group1);
    expect(group2.parentElement).toBe(group1);
    expect(group1.parentNode).toBeNull();
    expect(group3.parentNode).toBe(group2);
    expect(group4.firstChild).toBeNull();
    expect(group4.lastChild).toBeNull();
    expect(group3.getRootNode()).toBe(group1);
    expect(group3.getAncestor(1)).toBe(group2);
    expect(group3.getAncestor(2)).toBe(group1);
    expect(group3.getAncestor(3)).toBeNull();

    // 1 -> 5
    group1.appendChild(group5, 1);
    expect(group1.contains(group5)).toBeTruthy();
    expect(group1.childNodes.length).toBe(3);
    expect(group1.childNodes[1]).toBe(group5);
    expect(group1.firstChild).toBe(group2);
    expect(group1.lastChild).toBe(group4);

    // insert in a batch with after
    const group6 = new Element();
    group6.name = 'group6';
    const group7 = new Element();
    group7.name = 'group7';
    group5.after(group6, group7);
    expect(group1.childNodes.length).toBe(5);
    expect(group5.nextSibling).toBe(group6);
    expect(group6.previousSibling).toBe(group5);
    expect(group6.nextSibling).toBe(group7);
    expect(group7.nextSibling).toBe(group4);
    // expect(group6.getAttribute('name')).toBe('group6');
    expect(group6.matches('[name=group6]')).toBeTruthy();
    expect(group6.matches('[name=group7]')).toBeFalsy();
    expect(group6.matches('.c')).toBeFalsy();
    expect(group6.matches('#c')).toBeFalsy();
    expect(group7.matches('[name=group7]')).toBeTruthy();
    expect(group6.closest('[name=group6]')).toBe(group6);

    // remove group6 & group7
    group6.remove();
    group7.remove();
    expect(group1.childNodes.length).toBe(3);
    group5.before(group6, group7);
    expect(group1.childNodes.length).toBe(5);
    expect(group6.nextSibling).toBe(group7);
    expect(group7.nextSibling).toBe(group5);
  });

  it('should append & prepend correctly', () => {
    const group1 = new Element();
    const group2 = new Element();
    const group3 = new Element();
    const group4 = new Element();
    const group5 = new Element();

    group1.append(group2, group3);
    expect(group1.childNodes.length).toBe(2);
    expect(group1.firstChild).toBe(group2);
    expect(group1.lastChild).toBe(group3);

    group1.prepend(group4, group5);
    expect(group1.childNodes.length).toBe(4);
    expect(group1.firstChild).toBe(group4);
    expect(group1.lastChild).toBe(group3);
  });

  it('should insertBefore correctly', () => {
    const group1 = new Element();
    const group2 = new Element();
    const group3 = new Element();
    const group4 = new Element();
    const group5 = new Element();

    // 2, 4, 3
    group1.append(group2, group3);
    group1.insertBefore(group4, group3);
    expect(group1.childNodes.length).toBe(3);
    expect(group1.firstChild).toBe(group2);
    expect(group1.childNodes[1]).toBe(group4);
    expect(group1.lastChild).toBe(group3);
    group1.removeChildren();
    expect(group1.childNodes.length).toBe(0);

    // 4, 2, 3
    group1.append(group2, group3);
    group1.insertBefore(group4, group2);
    expect(group1.childNodes.length).toBe(3);
    expect(group1.firstChild).toBe(group4);
    expect(group1.childNodes[1]).toBe(group2);
    expect(group1.lastChild).toBe(group3);
    group1.removeChildren();
    expect(group1.childNodes.length).toBe(0);

    // 2, 3, 4 -> 2, 4, 3
    group1.append(group2, group3, group4);
    group1.insertBefore(group4, group3);
    expect(group1.childNodes.length).toBe(3);
    expect(group1.firstChild).toBe(group2);
    expect(group1.childNodes[1]).toBe(group4);
    expect(group1.lastChild).toBe(group3);
    group1.removeChildren();
    expect(group1.childNodes.length).toBe(0);

    // 2, 3, 4
    group1.append(group2, group3);
    group1.insertBefore(group4, null);
    expect(group1.childNodes.length).toBe(3);
    expect(group1.firstChild).toBe(group2);
    expect(group1.childNodes[1]).toBe(group3);
    expect(group1.lastChild).toBe(group4);
    group1.removeChildren();
    expect(group1.childNodes.length).toBe(0);

    // 2, 3, 4
    group1.append(group2, group3);
    group1.insertBefore(group4, group5); // non-existed node
    expect(group1.childNodes.length).toBe(3);
    expect(group1.firstChild).toBe(group2);
    expect(group1.childNodes[1]).toBe(group3);
    expect(group1.lastChild).toBe(group4);
    group1.removeChildren();
    expect(group1.childNodes.length).toBe(0);
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
    expect(group1.childNodes.length).toBe(3);
    expect(group5.nextSibling).toBe(group6);
    expect(group6.nextSibling).toBe(group4);

    group1.replaceChild(group7, group6);
    expect(group6.destroyed).toBeFalsy();
    expect(group1.childNodes.length).toBe(3);
    expect(group5.nextSibling).toBe(group7);
    expect(group7.nextSibling).toBe(group4);

    // clear
    group1.replaceChildren();
    expect(group1.childNodes.length).toBe(0);
  });

  it('should querySelector correctly', () => {
    const group1 = new Element();
    const group2 = new Element();
    group2.id = 'group2';
    group2.className = 'group2-classname1 group2-classname2';
    expect(group2.classList).toStrictEqual([
      'group2-classname1',
      'group2-classname2',
    ]);

    const group3 = new Element();
    group3.id = 'group3';

    group1.append(group2, group3);

    // query by id
    expect(group1.querySelector('#group2')).toBe(group2);
    expect(group1.querySelector('#group3')).toBe(group3);

    expect(group1.querySelector('.group2-classname1')).toBe(group2);
    expect(group1.querySelector('.group2-classname2')).toBe(group2);
  });
});
