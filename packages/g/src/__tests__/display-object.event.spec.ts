import chai, { expect } from 'chai';
// @ts-ignore
import chaiAlmost from 'chai-almost';
// @ts-ignore
import sinon from 'sinon';
// @ts-ignore
import sinonChai from 'sinon-chai';
import { Group, Canvas, Circle, Rect, CustomEvent, DISPLAY_OBJECT_EVENT } from '../';
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

describe('DisplayObject Lifecyle Event API', () => {
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
    group.addEventListener(DISPLAY_OBJECT_EVENT.ChildRemoved, childRemovedCallback);

    const childGroup = new Group();
    const removedCallback = sinon.spy();
    childGroup.addEventListener(DISPLAY_OBJECT_EVENT.Removed, removedCallback);
    const destroyChangedCallback = sinon.spy();
    childGroup.addEventListener(DISPLAY_OBJECT_EVENT.Destroy, destroyChangedCallback);
    group.appendChild(childGroup);
    group.removeChild(childGroup, false);

    // @ts-ignore
    expect(childRemovedCallback).to.have.been.calledWith(childGroup);
    // @ts-ignore
    expect(removedCallback).to.have.been.calledWith(group);
    // @ts-ignore
    expect(destroyChangedCallback).to.have.not.been.called;

    // append again
    group.appendChild(childGroup);
    group.removeChild(childGroup, true);
    // @ts-ignore
    expect(destroyChangedCallback).to.have.been.called;
  });

  it('should emit attribute-changed event correctly', () => {
    const circle = new Circle({
      style: {
        r: 10,
      },
    });

    const attributeChangedCallback = sinon.spy();
    circle.addEventListener(DISPLAY_OBJECT_EVENT.AttributeChanged, attributeChangedCallback);

    // should not emit if value unchanged
    circle.setAttribute('r', 10);
    // @ts-ignore
    expect(attributeChangedCallback).to.have.not.been.called;

    // trigger attribute changed
    circle.style.r = 20;
    // @ts-ignore
    expect(attributeChangedCallback).to.have.been.calledWith('r', 10, 20, circle);

    // trigger attribute changed
    circle.attr('r', 30);
    // @ts-ignore
    expect(attributeChangedCallback).to.have.been.calledWith('r', 20, 30, circle);
  });

  it('should emit destroy event correctly', () => {
    const circle = new Circle({
      style: {
        r: 10,
      },
    });

    const destroyChangedCallback = sinon.spy();
    circle.addEventListener(DISPLAY_OBJECT_EVENT.Destroy, destroyChangedCallback);

    circle.destroy();
    // @ts-ignore
    expect(destroyChangedCallback).to.have.been.called;
  });
});

describe('Custom Event API', () => {
  afterEach(() => {
    canvas.removeChildren();
  });

  it('should dispatch custom event in delegation correctly', () => {
    const ul = new Group({
      id: 'ul',
    });
    const li1 = new Rect({
      id: 'li1',
      style: {
        x: 200,
        y: 100,
        width: 300,
        height: 100,
        fill: '#1890FF',
      },
    });
    const li2 = new Rect({
      id: 'li2',
      style: {
        x: 200,
        y: 300,
        width: 300,
        height: 100,
        fill: '#1890FF',
      },
    });

    canvas.appendChild(ul);
    ul.appendChild(li1);
    ul.appendChild(li2);

    const event = new CustomEvent('build', { detail: { prop1: 'xx' } });
    // delegate to parent
    ul.addEventListener('build', (e) => {
      expect(e.target).to.be.eqls(li1);
      // @ts-ignore
      expect(e.detail).to.be.eqls({ prop1: 'xx' });
    });

    li1.dispatchEvent(event);
    li1.emit('build', { prop1: 'xx' });
  });

  it('should compatible with G 3.0 in delegation correctly', () => {
    const ul = new Group({
      id: 'ul',
    });
    const li1 = new Rect({
      id: 'li1',
      name: 'test-name',
      style: {
        x: 200,
        y: 100,
        width: 300,
        height: 100,
        fill: '#1890FF',
      },
    });
    const li2 = new Rect({
      id: 'li2',
      name: 'test-name2',
      style: {
        x: 200,
        y: 300,
        width: 300,
        height: 100,
        fill: '#1890FF',
      },
    });

    canvas.appendChild(ul);
    ul.appendChild(li1);
    ul.appendChild(li2);

    const callback = sinon.spy();
    ul.addEventListener('test-name:click', callback);
    li2.emit('click', {});
    // @ts-ignore
    expect(callback).to.have.been.not.called;

    li1.emit('click', {});
    // @ts-ignore
    expect(callback).to.have.been.called;
  });
});
