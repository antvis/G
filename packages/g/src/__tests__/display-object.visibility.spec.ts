import { expect } from 'chai';
import { Group } from '..';

describe('DisplayObject Visibility', () => {
  it('should toggle child\'s visibility correctly', () => {
    const group1 = new Group({
      id: 'id1',
      name: 'group1',
      style: {
        visibility: 'visible',
      }
    });
    const group2 = new Group({
      id: 'id2',
      name: 'group2',
      style: {
        visibility: 'hidden',
      }
    });
    const group3 = new Group({
      id: 'id3',
      name: 'group3',
    });
    const group4 = new Group({
      id: 'id4',
      name: 'group4',
    });

    // 1 -> 2
    // 1 -> 3
    // 1 -> 4
    group1.appendChild(group2);
    group1.appendChild(group3);
    group1.appendChild(group4);

    expect(group1.isVisible()).to.be.true;

    // show group2
    expect(group2.isVisible()).to.be.false;
    group2.show();
    group2.style.visibility = 'visible';
    expect(group2.isVisible()).to.be.true;

    // hide group2
    group2.hide();
    group2.style.visibility = 'hidden';
    expect(group2.isVisible()).to.be.false;

    // hide group1
    group1.hide();
    expect(group1.isVisible()).to.be.false;
    expect(group2.isVisible()).to.be.false;
    expect(group3.isVisible()).to.be.false;
    expect(group4.isVisible()).to.be.false;
  });
});
