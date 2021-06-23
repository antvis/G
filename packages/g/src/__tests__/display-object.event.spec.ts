import chai, { expect } from 'chai';
// @ts-ignore
import chaiAlmost from 'chai-almost';
// @ts-ignore
import sinon from 'sinon';
// @ts-ignore
import sinonChai from 'sinon-chai';
import { Group } from '..';
import { DISPLAY_OBJECT_EVENT } from '../DisplayObject';
import { Circle } from '../shapes-export';

chai.use(chaiAlmost());
chai.use(sinonChai);

describe('DisplayObject Event API', () => {
  it('should emit inserted event correctly', () => {
    const group = new Group();

    const childInsertedCallback = sinon.spy();
    group.on(DISPLAY_OBJECT_EVENT.ChildInserted, childInsertedCallback);

    const childGroup = new Group();
    const insertedCallback = sinon.spy();
    childGroup.on(DISPLAY_OBJECT_EVENT.Inserted, insertedCallback);
    group.appendChild(childGroup);

    // @ts-ignore
    expect(childInsertedCallback).to.have.been.calledWith(childGroup);
    // @ts-ignore
    expect(insertedCallback).to.have.been.calledWith(group);
  });

  it('should emit removed event correctly', () => {
    const group = new Group();

    const childRemovedCallback = sinon.spy();
    group.on(DISPLAY_OBJECT_EVENT.ChildRemoved, childRemovedCallback);

    const childGroup = new Group();
    const removedCallback = sinon.spy();
    childGroup.on(DISPLAY_OBJECT_EVENT.Removed, removedCallback);
    const destroyChangedCallback = sinon.spy();
    childGroup.on(DISPLAY_OBJECT_EVENT.Destroy, destroyChangedCallback);
    group.appendChild(childGroup);
    group.removeChild(childGroup);

    // @ts-ignore
    expect(childRemovedCallback).to.have.been.calledWith(childGroup);
    // @ts-ignore
    expect(removedCallback).to.have.been.calledWith(group);
    // @ts-ignore
    expect(destroyChangedCallback).to.have.not.been.called;

    // // append again
    // group.appendChild(childGroup);
    // group.removeChild(childGroup, true);
    // // @ts-ignore
    // expect(destroyChangedCallback).to.have.been.called;
  });

  it('should emit attribute-changed event correctly', () => {
    const circle = new Circle({
      attrs: {
        r: 10,
      }
    });

    const attributeChangedCallback = sinon.spy();
    circle.on(DISPLAY_OBJECT_EVENT.AttributeChanged, attributeChangedCallback);

    // should not emit if value unchanged
    circle.setAttribute('r', 10);
    // @ts-ignore
    expect(attributeChangedCallback).to.have.not.been.called;

    // trigger attribute changed
    circle.setAttribute('r', 20);
    // @ts-ignore
    expect(attributeChangedCallback).to.have.been.calledWith('r', 20);
  });

  it('should emit destroy event correctly', () => {
    const circle = new Circle({
      attrs: {
        r: 10,
      }
    });

    const destroyChangedCallback = sinon.spy();
    circle.on(DISPLAY_OBJECT_EVENT.Destroy, destroyChangedCallback);

    circle.destroy();
    // @ts-ignore
    expect(destroyChangedCallback).to.have.been.called;
  });
});
