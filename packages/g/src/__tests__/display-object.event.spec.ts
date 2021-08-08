import chai, { expect } from 'chai';
// @ts-ignore
import chaiAlmost from 'chai-almost';
// @ts-ignore
import sinon from 'sinon';
// @ts-ignore
import sinonChai from 'sinon-chai';
import { Group, Canvas, Circle, DISPLAY_OBJECT_EVENT } from '..';
import { Renderer as CanvasRenderer } from '@antv/g-canvas';

chai.use(chaiAlmost());
chai.use(sinonChai);

const $container = document.createElement('div');
$container.id = 'container';
document.body.prepend($container);

// create a canvas
const canvas = new Canvas({
  container: 'container',
  width: 600,
  height: 500,
  renderer: new CanvasRenderer(),
});

describe('DisplayObject Event API', () => {
  it('should emit inserted event correctly', () => {
    const group = new Group();

    const childInsertedCallback = sinon.spy();
    const childInsertedCallback2 = sinon.spy();
    group.addEventListener(DISPLAY_OBJECT_EVENT.ChildInserted, childInsertedCallback);
    group.on(DISPLAY_OBJECT_EVENT.ChildInserted, childInsertedCallback2);

    const childGroup = new Group();
    const insertedCallback = sinon.spy();
    childGroup.addEventListener(DISPLAY_OBJECT_EVENT.Inserted, insertedCallback);
    group.appendChild(childGroup);

    // @ts-ignore
    expect(childInsertedCallback).to.have.been.calledWith(childGroup);
    // @ts-ignore
    expect(childInsertedCallback2).to.have.been.calledWith(childGroup);
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

  // it('should emit attribute-changed event correctly', () => {
  //   const circle = new Circle({
  //     attrs: {
  //       r: 10,
  //     }
  //   });

  //   const attributeChangedCallback = sinon.spy();
  //   circle.on(DISPLAY_OBJECT_EVENT.AttributeChanged, attributeChangedCallback);

  //   // should not emit if value unchanged
  //   circle.setAttribute('r', 10);
  //   // @ts-ignore
  //   expect(attributeChangedCallback).to.have.not.been.called;

  //   // trigger attribute changed
  //   circle.setAttribute('r', 20);
  //   // @ts-ignore
  //   expect(attributeChangedCallback).to.have.been.calledWith('r', 20);
  // });

  // it('should emit destroy event correctly', () => {
  //   const circle = new Circle({
  //     attrs: {
  //       r: 10,
  //     }
  //   });

  //   const destroyChangedCallback = sinon.spy();
  //   circle.on(DISPLAY_OBJECT_EVENT.Destroy, destroyChangedCallback);

  //   circle.destroy();
  //   // @ts-ignore
  //   expect(destroyChangedCallback).to.have.been.called;
  // });
});
