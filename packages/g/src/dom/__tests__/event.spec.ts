import chai, { expect } from 'chai';
// @ts-ignore
import chaiAlmost from 'chai-almost';
// @ts-ignore
import sinon from 'sinon';
// @ts-ignore
import sinonChai from 'sinon-chai';
import {
  Group,
  Canvas,
  Circle,
  Rect,
  DisplayObject,
  CustomEvent,
  ElementEvent,
  MutationEvent,
  MutationObserver,
  MutationRecord,
} from '../../../lib';
import { Renderer as CanvasRenderer } from '@antv/g-canvas';
import { sleep } from '../../__tests__/utils';

let addedNodes: DisplayObject[] = [];
let removedNodes: DisplayObject[] = [];
function mergeRecords(records: MutationRecord[]) {
  records.forEach(function (record) {
    if (record.addedNodes) addedNodes.push.apply(addedNodes, record.addedNodes);
    if (record.removedNodes) removedNodes.push.apply(removedNodes, record.removedNodes);
  });
}

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
  afterEach(() => {
    canvas.removeChildren();
  });

  afterAll(() => {
    canvas.destroy();
  });

  it('should emit Inserted & ChildInserted event correctly', () => {
    const group = new Group();
    canvas.appendChild(group);

    const childInsertedCallback = (e) => {
      // expect(e.view).eqls(canvas);
      expect(e.detail.child).eqls(childGroup);
    };
    const insertedCallback = (e: MutationEvent) => {
      expect(e.target).eqls(childGroup);
      expect(e.relatedNode).eqls(group);
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
      // expect(e.detail.child).eqls(childGroup);
    };
    const removedCallbackSpy = sinon.spy();
    const removedCallback = (e: MutationEvent) => {
      // expect(e.relatedNode).eqls(group);
    };
    const destroyCallbackSpy = sinon.spy();
    const destroyCallback = (e) => {
      // expect(e.target).eqls(childGroup);
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

  it('should emit attribute-changed event correctly', async () => {
    const circle = new Circle({
      style: {
        r: 10,
      },
    });
    canvas.appendChild(circle);

    const attributeChangedCallback = sinon.spy();
    circle.addEventListener(ElementEvent.ATTR_MODIFIED, attributeChangedCallback);

    // should not emit if value unchanged
    circle.setAttribute('r', 10);
    // @ts-ignore
    expect(attributeChangedCallback).to.have.not.been.called;

    // trigger attribute changed
    circle.style.r = 20;
    // @ts-ignore
    expect(attributeChangedCallback).to.have.been.called;

    const attributeModifiedCallback = function (e: MutationEvent) {
      // @see https://github.com/antvis/g/issues/929
      expect(this).eqls(e.currentTarget);
      expect(e.type).eqls(ElementEvent.ATTR_MODIFIED);
      expect(e.attrChange).eqls(MutationEvent.MODIFICATION);
      expect(e.attrName).eqls('r');
      expect(e.prevValue).eqls(20);
      expect(e.newValue).eqls(30);
      expect(e.prevParsedValue).eqls({ unit: 'px', value: 20 });
      expect(e.newParsedValue).eqls({ unit: 'px', value: 30 });
    };
    circle.addEventListener(ElementEvent.ATTR_MODIFIED, attributeModifiedCallback);

    // use mutation observer
    const config = { attributes: true, childList: true, subtree: true };
    const observer = new MutationObserver((mutationsList, observer) => {
      for (const mutation of mutationsList) {
        if (mutation.type === 'attributes') {
          expect(mutation.target).eqls(circle);
          expect(mutation.attributeName).eqls('r');
          expect(mutation.attributeNamespace).eqls('g');
          expect(mutation.oldValue).to.be.null;
        }
      }
    });
    observer.observe(circle, config);

    // trigger attribute changed
    circle.attr('r', 30);
    // @ts-ignore
    expect(attributeChangedCallback).to.have.been.called;

    await sleep(500);
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

  it('should record childList mutations when appendChild correctly', () => {
    const group1 = new Group();
    const group2 = new Group();
    const group3 = new Group();

    canvas.appendChild(group1);

    const observer = new MutationObserver(() => {});
    observer.observe(group1, { childList: true });

    group1.appendChild(group2);
    group1.appendChild(group3);

    const records = observer.takeRecords();
    expect(records.length).to.eqls(2);

    expect(records[0].type).to.eqls('childList');
    expect(records[0].target).to.eqls(group1);
    expect(records[0].addedNodes.length).to.eqls(1);
    expect(records[0].addedNodes[0]).to.eqls(group2);

    expect(records[1].type).to.eqls('childList');
    expect(records[1].target).to.eqls(group1);
    expect(records[1].addedNodes.length).to.eqls(1);
    expect(records[1].addedNodes[0]).to.eqls(group3);
    expect(records[1].previousSibling).to.eqls(group2);
  });

  it('should record childList mutations when removeChild correctly', () => {
    const div = new Group();
    const a = new Group();
    const b = new Group();
    const c = new Group();

    canvas.appendChild(div);
    div.appendChild(a);
    div.appendChild(b);
    div.appendChild(c);

    const observer = new MutationObserver(() => {});
    observer.observe(div, { childList: true });

    div.removeChild(b);
    div.removeChild(a);

    const records = observer.takeRecords();
    expect(records.length).to.eqls(2);

    expect(records[0].type).to.eqls('childList');
    expect(records[0].target).to.eqls(div);
    expect(records[0].removedNodes.length).to.eqls(1);
    expect(records[0].removedNodes[0]).to.eqls(b);
    expect(records[0].nextSibling).to.eqls(c);
    expect(records[0].previousSibling).to.eqls(a);

    expect(records[1].type).to.eqls('childList');
    expect(records[1].target).to.eqls(div);
    expect(records[1].removedNodes.length).to.eqls(1);
    expect(records[1].removedNodes[0]).to.eqls(a);
    expect(records[1].nextSibling).to.eqls(c);
  });

  // @see https://github.com/googlearchive/MutationObservers/blob/master/test/childList.js#L137
  it('should record childList mutations when removeChild correctly', () => {
    const div = new Group();
    const a = new Group();
    const b = new Group();

    canvas.appendChild(div);
    const observer = new MutationObserver(() => {});
    observer.observe(div, { childList: true });

    div.appendChild(a);
    div.insertBefore(b, a);
    div.removeChild(b);

    const records = observer.takeRecords();
    expect(records.length).to.eqls(3);

    expect(records[0].type).to.eqls('childList');
    expect(records[0].target).to.eqls(div);
    expect(records[0].addedNodes.length).to.eqls(1);
    expect(records[0].addedNodes[0]).to.eqls(a);

    expect(records[1].type).to.eqls('childList');
    expect(records[1].target).to.eqls(div);
    expect(records[1].addedNodes.length).to.eqls(1);
    expect(records[1].addedNodes[0]).to.eqls(b);
    expect(records[1].nextSibling).to.eqls(a);

    expect(records[2].type).to.eqls('childList');
    expect(records[2].target).to.eqls(div);
    expect(records[2].removedNodes.length).to.eqls(1);
    expect(records[2].removedNodes[0]).to.eqls(b);
    expect(records[2].nextSibling).to.eqls(a);
  });

  it('should record childList but not subtree mutations correctly', () => {
    const div = new Group();
    const child = new Group();
    const a = new Group();
    const b = new Group();

    canvas.appendChild(div);
    div.appendChild(child);
    const observer = new MutationObserver(() => {});
    observer.observe(child, { childList: true });

    child.appendChild(a);
    child.insertBefore(b, a);
    child.removeChild(b);

    const records = observer.takeRecords();
    expect(records.length).to.eqls(3);

    expect(records[0].type).to.eqls('childList');
    expect(records[0].target).to.eqls(child);
    expect(records[0].addedNodes.length).to.eqls(1);
    expect(records[0].addedNodes[0]).to.eqls(a);

    expect(records[1].type).to.eqls('childList');
    expect(records[1].target).to.eqls(child);
    expect(records[1].addedNodes.length).to.eqls(1);
    expect(records[1].addedNodes[0]).to.eqls(b);
    expect(records[1].nextSibling).to.eqls(a);

    expect(records[2].type).to.eqls('childList');
    expect(records[2].target).to.eqls(child);
    expect(records[2].removedNodes.length).to.eqls(1);
    expect(records[2].removedNodes[0]).to.eqls(b);
    expect(records[2].nextSibling).to.eqls(a);
  });

  it('should record childList & subtree mutations correctly', () => {
    const div = new Group();
    const child = new Group();
    const a = new Group();
    const b = new Group();

    canvas.appendChild(div);
    div.appendChild(child);
    const observer = new MutationObserver(() => {});
    observer.observe(div, {
      childList: true,
      subtree: true,
    });
    observer.observe(child, {
      childList: true,
    });

    child.appendChild(a);
    div.appendChild(b);

    const records = observer.takeRecords();
    expect(records.length).to.eqls(2);

    expect(records[0].type).to.eqls('childList');
    expect(records[0].target).to.eqls(child);
    expect(records[0].addedNodes.length).to.eqls(1);
    expect(records[0].addedNodes[0]).to.eqls(a);

    expect(records[1].type).to.eqls('childList');
    expect(records[1].target).to.eqls(div);
    expect(records[1].addedNodes.length).to.eqls(1);
    expect(records[1].addedNodes[0]).to.eqls(b);
    expect(records[1].previousSibling).to.eqls(child);
  });

  it('should remove all children', () => {
    const div = new Group();
    const a = new Group();
    const b = new Group();
    const c = new Group();

    canvas.appendChild(div);
    div.appendChild(a);
    div.appendChild(b);
    div.appendChild(c);

    const observer = new MutationObserver(() => {});
    observer.observe(div, {
      childList: true,
    });

    div.removeChildren();

    const records = observer.takeRecords();
    mergeRecords(records);

    expect(addedNodes.length).to.eqls(0);
    expect(removedNodes.length).to.eqls(3);
    expect(removedNodes[0]).to.eqls(a);
    expect(removedNodes[1]).to.eqls(b);
    expect(removedNodes[2]).to.eqls(c);
  });
});
