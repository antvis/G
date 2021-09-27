import chai, { expect } from 'chai';
// @ts-ignore
import chaiAlmost from 'chai-almost';
// @ts-ignore
import sinon from 'sinon';
// @ts-ignore
import sinonChai from 'sinon-chai';
import { Group, Canvas, Circle, Rect, CustomEvent, ElementEvent } from '../../';
import { Renderer as CanvasRenderer } from '../../../../g-canvas';

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

describe('Event API', () => {
  afterAll(() => {
    canvas.destroy();
  });

  it('should emit Inserted & ChildInserted event correctly', () => {
    const group = new Group();
    canvas.appendChild(group);

    const childInsertedCallback = (e) => {
      expect(e.detail.child).eqls(childGroup);
    };
    const insertedCallback = (e) => {
      expect(e.detail.parent).eqls(group);
    };
    group.addEventListener(ElementEvent.CHILD_INSERTED, childInsertedCallback);
    group.on(ElementEvent.CHILD_INSERTED, childInsertedCallback);
    group.addEventListener(ElementEvent.INSERTED, insertedCallback);

    canvas.addEventListener(ElementEvent.INSERTED, insertedCallback);

    const childGroup = new Group();
    group.appendChild(childGroup);

    canvas.removeEventListener(ElementEvent.INSERTED, insertedCallback);

    group.destroy();
  });

  it('should emit Removed & ChildRemoved event correctly', () => {
    const group = new Group();
    canvas.appendChild(group);

    const childRemovedCallbackSpy = sinon.spy();
    const childRemovedCallback = (e) => {
      expect(e.detail.child).eqls(childGroup);
    };
    const removedCallbackSpy = sinon.spy();
    const removedCallback = (e) => {
      expect(e.detail.parent).eqls(group);
    };
    const destroyCallbackSpy = sinon.spy();
    const destroyCallback = (e) => {
      expect(e.target).eqls(childGroup);
    };
    group.addEventListener(ElementEvent.CHILD_REMOVED, childRemovedCallback);
    group.addEventListener(ElementEvent.REMOVED, removedCallback);
    group.addEventListener(ElementEvent.DESTROY, destroyCallback);

    group.addEventListener(ElementEvent.CHILD_REMOVED, childRemovedCallbackSpy);
    group.addEventListener(ElementEvent.REMOVED, removedCallbackSpy);
    group.addEventListener(ElementEvent.DESTROY, destroyCallbackSpy);

    const childGroup = new Group();
    group.appendChild(childGroup);
    group.removeChild(childGroup, false);

    // @ts-ignore
    expect(childRemovedCallbackSpy).to.have.been.called;
    // @ts-ignore
    expect(removedCallbackSpy).to.have.been.called;
    // @ts-ignore
    expect(destroyCallbackSpy).to.have.not.been.called;

    // append again
    group.appendChild(childGroup);
    group.removeChild(childGroup, true);

    // @ts-ignore
    expect(destroyCallbackSpy).to.have.been.called;
  });

  it('should emit attribute-changed event correctly', () => {
    const circle = new Circle({
      style: {
        r: 10,
      },
    });
    canvas.appendChild(circle);

    const attributeChangedCallback = sinon.spy();
    circle.addEventListener(ElementEvent.ATTRIBUTE_CHANGED, attributeChangedCallback);

    // should not emit if value unchanged
    circle.setAttribute('r', 10);
    // @ts-ignore
    expect(attributeChangedCallback).to.have.not.been.called;

    // trigger attribute changed
    circle.style.r = 20;
    // @ts-ignore
    expect(attributeChangedCallback).to.have.been.called;

    // trigger attribute changed
    circle.attr('r', 30);
    // @ts-ignore
    expect(attributeChangedCallback).to.have.been.called;
  });

  it('should emit destroy event correctly', () => {
    const circle = new Circle({
      style: {
        r: 10,
      },
    });
    canvas.appendChild(circle);

    const destroyChangedCallback = sinon.spy();
    circle.addEventListener(ElementEvent.DESTROY, destroyChangedCallback);

    circle.destroy();
    // @ts-ignore
    expect(destroyChangedCallback).to.have.been.called;
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
