import { Renderer as CanvasRenderer } from '../../../packages/g-svg/src';
import {
  Canvas,
  Circle,
  CustomEvent,
  DisplayObject,
  ElementEvent,
  Group,
  MutationEvent,
  MutationObserver,
  MutationRecord,
  Rect,
} from '../../../packages/g/src';

const addedNodes: DisplayObject[] = [];
const removedNodes: DisplayObject[] = [];
function mergeRecords(records: MutationRecord[]) {
  records.forEach(function (record) {
    if (record.addedNodes) addedNodes.push(...record.addedNodes);
    if (record.removedNodes) removedNodes.push(...record.removedNodes);
  });
}

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
    canvas.destroyChildren();
  });

  afterAll(() => {
    canvas.destroy();
  });

  it('should emit Inserted & ChildInserted event correctly', async () => {
    const group = new Group();
    await canvas.ready;
    canvas.appendChild(group);

    const childGroup = new Group();

    // const childInsertedCallback = (e) => {
    //   // expect(e.view).toBe(canvas);
    //   expect(e.detail.child).toBe(childGroup);
    // };
    const insertedCallback = (e: MutationEvent) => {
      expect(e.target).toBe(childGroup);
      expect(e.relatedNode).toBe(group);
    };
    // group.addEventListener(ElementEvent.CHILD_INSERTED, childInsertedCallback);
    // group.on(ElementEvent.CHILD_INSERTED, childInsertedCallback);
    group.addEventListener(ElementEvent.INSERTED, insertedCallback);

    canvas.addEventListener(ElementEvent.INSERTED, insertedCallback);

    group.appendChild(childGroup);

    canvas.removeEventListener(ElementEvent.INSERTED, insertedCallback);

    group.destroy();
  });

  it('should emit Removed & ChildRemoved event correctly', async () => {
    const group = new Group();
    await canvas.ready;
    canvas.appendChild(group);

    // const childRemovedCallbackSpy = jest.fn();
    // const childRemovedCallback = (e) => {
    //   // expect(e.detail.child).toBe(childGroup);
    // };
    const removedCallbackSpy = jest.fn();
    // const removedCallback = (e: MutationEvent) => {
    //   // expect(e.relatedNode).toBe(group);
    // };
    const destroyCallbackSpy = jest.fn();
    // const destroyCallback = (e) => {
    //   // expect(e.target).toBe(childGroup);
    // };
    // group.addEventListener(ElementEvent.CHILD_REMOVED, childRemovedCallback);
    // group.addEventListener(ElementEvent.REMOVED, removedCallback);
    // group.addEventListener(ElementEvent.DESTROY, destroyCallback);

    // group.addEventListener(ElementEvent.CHILD_REMOVED, childRemovedCallbackSpy);
    group.addEventListener(ElementEvent.REMOVED, removedCallbackSpy);
    group.addEventListener(ElementEvent.DESTROY, destroyCallbackSpy);

    const childGroup = new Group();
    group.appendChild(childGroup);
    group.removeChild(childGroup);

    // expect(childRemovedCallbackSpy).to.have.been.called;
    expect(removedCallbackSpy).toHaveBeenCalled();
    expect(destroyCallbackSpy).not.toHaveBeenCalled();

    // append again
    group.appendChild(childGroup);
    childGroup.destroy();

    expect(destroyCallbackSpy).toHaveBeenCalled();
  });

  it('should emit attribute-changed event correctly', async () => {
    const circle = new Circle({
      style: {
        r: 10,
      },
    });
    await canvas.ready;
    canvas.appendChild(circle);

    const attributeChangedCallback = jest.fn();
    canvas.addEventListener(
      ElementEvent.ATTR_MODIFIED,
      attributeChangedCallback,
    );

    // should not emit if value unchanged
    circle.setAttribute('r', 10);
    expect(attributeChangedCallback).not.toHaveBeenCalled();

    // trigger attribute changed
    circle.style.r = 20;
    expect(attributeChangedCallback).toHaveBeenCalled();

    await new Promise((resolve) => {
      const attributeModifiedCallback = function (e: MutationEvent) {
        // @see https://github.com/antvis/g/issues/929
        expect(this).toBe(e.currentTarget);
        expect(circle).toBe(e.target);
        expect(e.type).toBe(ElementEvent.ATTR_MODIFIED);
        expect(e.attrChange).toBe(MutationEvent.MODIFICATION);
        expect(e.attrName).toBe('r');
        expect(e.prevValue).toBe(20);
        expect(e.newValue).toBe(30);
        expect(e.prevParsedValue).toBe(20);
        expect(e.newParsedValue).toBe(30);

        resolve(undefined);
      };
      canvas.addEventListener(
        ElementEvent.ATTR_MODIFIED,
        attributeModifiedCallback,
      );

      // use mutation observer
      const config = { attributes: true, childList: true, subtree: true };
      const observer = new MutationObserver((mutationsList, observer) => {
        for (const mutation of mutationsList) {
          if (mutation.type === 'attributes') {
            expect(mutation.target).toBe(circle);
            expect(mutation.attributeName).toBe('r');
            expect(mutation.attributeNamespace).toBe('g');
            expect(mutation.oldValue).toBeNull();
          }
        }
      });
      observer.observe(circle, config);

      // trigger attribute changed
      circle.attr('r', 30);
      expect(attributeChangedCallback).toHaveBeenCalled();
    });
  });

  it('should emit destroy event correctly', async () => {
    const circle = new Circle({
      style: {
        r: 10,
      },
    });
    await canvas.ready;
    canvas.appendChild(circle);

    const destroyChangedCallback = jest.fn();
    circle.addEventListener(ElementEvent.DESTROY, destroyChangedCallback);

    circle.destroy();
    expect(destroyChangedCallback).toHaveBeenCalled();
  });

  it('should dispatch custom event in delegation correctly', async () => {
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

    await canvas.ready;
    canvas.appendChild(ul);
    ul.appendChild(li1);
    ul.appendChild(li2);

    const event = new CustomEvent('build', { detail: { prop1: 'xx' } });
    // delegate to parent
    ul.addEventListener('build', (e) => {
      expect(e.target).toBe(li1);
      expect(e.detail).toStrictEqual({ prop1: 'xx' });
    });

    li1.dispatchEvent(event);
    li1.emit('build', { prop1: 'xx' });
  });

  it.skip('should record childList mutations when appendChild correctly', async () => {
    const group1 = new Group();
    const group2 = new Group();
    const group3 = new Group();

    await canvas.ready;
    canvas.appendChild(group1);

    const observer = new MutationObserver(() => {});
    observer.observe(group1, { childList: true });

    group1.appendChild(group2);
    group1.appendChild(group3);

    const records = observer.takeRecords();
    expect(records.length).toBe(2);

    expect(records[0].type).toBe('childList');
    expect(records[0].target).toBe(group1);
    expect(records[0].addedNodes.length).toBe(1);
    expect(records[0].addedNodes[0]).toBe(group2);

    expect(records[1].type).toBe('childList');
    expect(records[1].target).toBe(group1);
    expect(records[1].addedNodes.length).toBe(1);
    expect(records[1].addedNodes[0]).toBe(group3);
    expect(records[1].previousSibling).toBe(group2);
  });

  it('should record childList mutations when removeChild correctly', async () => {
    const div = new Group();
    const a = new Group();
    const b = new Group();
    const c = new Group();

    await canvas.ready;
    canvas.appendChild(div);
    div.appendChild(a);
    div.appendChild(b);
    div.appendChild(c);

    const observer = new MutationObserver(() => {});
    observer.observe(div, { childList: true });

    div.removeChild(b);
    div.removeChild(a);

    const records = observer.takeRecords();
    expect(records.length).toBe(2);

    expect(records[0].type).toBe('childList');
    expect(records[0].target).toBe(div);
    expect(records[0].removedNodes.length).toBe(1);
    expect(records[0].removedNodes[0]).toBe(b);
    expect(records[0].nextSibling).toBe(c);
    expect(records[0].previousSibling).toBe(a);

    expect(records[1].type).toBe('childList');
    expect(records[1].target).toBe(div);
    expect(records[1].removedNodes.length).toBe(1);
    expect(records[1].removedNodes[0]).toBe(a);
    expect(records[1].nextSibling).toBe(c);
  });

  // @see https://github.com/googlearchive/MutationObservers/blob/master/test/childList.js#L137
  it.skip('should record childList mutations when removeChild correctly', async () => {
    const div = new Group();
    const a = new Group();
    const b = new Group();

    await canvas.ready;
    canvas.appendChild(div);
    const observer = new MutationObserver(() => {});
    observer.observe(div, { childList: true });

    div.appendChild(a);
    div.insertBefore(b, a);
    div.removeChild(b);

    const records = observer.takeRecords();
    expect(records.length).toBe(3);

    expect(records[0].type).toBe('childList');
    expect(records[0].target).toBe(div);
    expect(records[0].addedNodes.length).toBe(1);
    expect(records[0].addedNodes[0]).toBe(a);

    expect(records[1].type).toBe('childList');
    expect(records[1].target).toBe(div);
    expect(records[1].addedNodes.length).toBe(1);
    expect(records[1].addedNodes[0]).toBe(b);
    expect(records[1].nextSibling).toBe(a);

    expect(records[2].type).toBe('childList');
    expect(records[2].target).toBe(div);
    expect(records[2].removedNodes.length).toBe(1);
    expect(records[2].removedNodes[0]).toBe(b);
    expect(records[2].nextSibling).toBe(a);
  });

  it.skip('should record childList but not subtree mutations correctly', async () => {
    const div = new Group();
    const child = new Group();
    const a = new Group();
    const b = new Group();

    await canvas.ready;
    canvas.appendChild(div);
    div.appendChild(child);
    const observer = new MutationObserver(() => {});
    observer.observe(child, { childList: true });

    child.appendChild(a);
    child.insertBefore(b, a);
    child.removeChild(b);

    const records = observer.takeRecords();
    expect(records.length).toBe(3);

    expect(records[0].type).toBe('childList');
    expect(records[0].target).toBe(child);
    expect(records[0].addedNodes.length).toBe(1);
    expect(records[0].addedNodes[0]).toBe(a);

    expect(records[1].type).toBe('childList');
    expect(records[1].target).toBe(child);
    expect(records[1].addedNodes.length).toBe(1);
    expect(records[1].addedNodes[0]).toBe(b);
    expect(records[1].nextSibling).toBe(a);

    expect(records[2].type).toBe('childList');
    expect(records[2].target).toBe(child);
    expect(records[2].removedNodes.length).toBe(1);
    expect(records[2].removedNodes[0]).toBe(b);
    expect(records[2].nextSibling).toBe(a);
  });

  it.skip('should record childList & subtree mutations correctly', async () => {
    const div = new Group();
    const child = new Group();
    const a = new Group();
    const b = new Group();

    await canvas.ready;
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
    expect(records.length).toBe(2);

    expect(records[0].type).toBe('childList');
    expect(records[0].target).toBe(child);
    expect(records[0].addedNodes.length).toBe(1);
    expect(records[0].addedNodes[0]).toBe(a);

    expect(records[1].type).toBe('childList');
    expect(records[1].target).toBe(div);
    expect(records[1].addedNodes.length).toBe(1);
    expect(records[1].addedNodes[0]).toBe(b);
    expect(records[1].previousSibling).toBe(child);
  });

  it('should remove all children', async () => {
    const div = new Group();
    const a = new Group();
    const b = new Group();
    const c = new Group();

    await canvas.ready;
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

    expect(addedNodes.length).toBe(0);
    expect(removedNodes.length).toBe(3);
    expect(removedNodes[0]).toBe(c);
    expect(removedNodes[1]).toBe(b);
    expect(removedNodes[2]).toBe(a);
  });
});
