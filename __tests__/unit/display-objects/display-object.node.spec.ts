import { Renderer as CanvasRenderer } from '../../../packages/g-svg/src';
import type { DisplayObjectConfig } from '../../../packages/g/src';
import {
  Canvas,
  Circle,
  CustomElement,
  DisplayObject,
  Group,
  Shape,
} from '../../../packages/g/src';

const $container = document.createElement('div');
$container.id = 'container';
document.body.prepend($container);

const renderer = new CanvasRenderer();
// create a canvas
const canvas = new Canvas({
  container: 'container',
  width: 600,
  height: 500,
  renderer,
});

describe('DisplayObject Node API', () => {
  afterEach(() => {
    canvas.destroyChildren();
  });

  afterAll(() => {
    canvas.destroy();
  });

  it('should update transform with its parent group', () => {
    const group1 = new DisplayObject({});
    const group2 = new DisplayObject({});

    group1.setPosition(0, 0);

    expect(group1.getPosition()).toStrictEqual([0, 0, 0]);
    expect(group2.getPosition()).toStrictEqual([0, 0, 0]);
    expect(group1.getLocalPosition()).toStrictEqual([0, 0, 0]);
    expect(group2.getLocalPosition()).toStrictEqual([0, 0, 0]);

    // group1 -> group2
    group1.add(group2);

    // translate group1
    group1.translate([10, 0, 0]);

    // group2's world transform should be the same with group1
    expect(group1.getPosition()).toStrictEqual([10, 0, 0]);
    expect(group2.getPosition()).toStrictEqual([10, 0, 0]);
    expect(group1.getLocalPosition()).toStrictEqual([10, 0, 0]);
    expect(group2.getLocalPosition()).toStrictEqual([0, 0, 0]);

    // now move group2 to (20, 0, 0) in local space
    group2.translateLocal([10, 0, 0]);

    // group1's position (10, 0, 0)
    // group2's position (20, 0, 0)
    expect(group1.getPosition()).toStrictEqual([10, 0, 0]);
    expect(group2.getPosition()).toStrictEqual([20, 0, 0]);

    // move group1 to (10, 10, 10)
    group1.move(10, 10, 10);
    group1.move([10, 10, 10]);
    group1.moveTo(10, 10, 10);
    group1.moveTo([10, 10, 10]);
    group1.setPosition(10, 10, 10);
    group1.setPosition([10, 10, 10]);
    // set group2 to origin in local space
    group2.setLocalPosition(0, 0, 0);
    group2.setLocalPosition(0, 0);
    group2.setLocalPosition([0, 0, 0]);
    group2.setLocalPosition([0, 0]);

    expect(group1.getPosition()).toStrictEqual([10, 10, 10]);
    expect(group2.getPosition()).toStrictEqual([10, 10, 10]);
  });

  it('should update scaling with its parent group', () => {
    const group1 = new DisplayObject({});
    const group2 = new DisplayObject({});

    expect(group1.getScale()).toStrictEqual([1, 1, 1]);
    expect(group2.getScale()).toStrictEqual([1, 1, 1]);
    expect(group1.getLocalScale()).toStrictEqual([1, 1, 1]);

    // group1 -> group2
    group1.add(group2);

    // scale group1
    group1.scale(10);
    group1.scale([1, 1, 1]);
    group1.scale([1, 1]);

    // group2's world transform should be the same with group1
    expect(group1.getScale()).toStrictEqual([10, 10, 10]);
    expect(group2.getScale()).toStrictEqual([10, 10, 10]);

    // now scale group2 in local space
    group2.setLocalScale(2);
    group2.setLocalScale([2, 2, 2]);

    // group1's scaling (10)
    // group2's scaling (20)
    expect(group1.getScale()).toStrictEqual([10, 10, 10]);
    expect(group2.getScale()).toStrictEqual([20, 20, 20]);

    // remove group2 from group1
    group1.removeChild(group2);
    group1.removeChildren();

    expect(group1.getScale()).toStrictEqual([10, 10, 10]);
    // should not keep scaling when detached
    // @see https://github.com/antvis/g/issues/935
    expect(group2.getScale()).toStrictEqual([2, 2, 2]);
  });

  it('should update rotation with its parent group', () => {
    const group1 = new Group();
    const group2 = new Group();
    // group1 -> group2
    group1.appendChild(group2);

    group1.rotateLocal(30);

    // use almost, allows a tolerance of 1 x 10-6.
    expect(group1.getEulerAngles()).toBeCloseTo(30);
    expect(group1.getLocalEulerAngles()).toBeCloseTo(30);
    expect(group2.getEulerAngles()).toBeCloseTo(30);
  });

  it('should query child correctly', () => {
    const group1 = new Group({
      id: 'id1',
      name: 'group1',
    });
    const group2 = new Group({
      id: 'id2',
      name: 'group2',
      class: 'c1 c2', // use class alias of className
    });
    const group3 = new Group({
      id: 'id3',
      name: 'group3',
      class: 'c1 c2 c3',
    });
    const group4 = new Group({
      id: 'id4',
      name: 'group4',
      className: 'className4',
    });

    // 1 -> 2 -> 3
    // 1 -> 4
    group1.add(group2);
    group2.add(group3);
    group1.add(group4);

    // query children & parent
    expect(group1.contain(group2)).toBeTruthy();
    expect(group1.contains(group3)).toBeTruthy();
    expect(group1.getCount()).toBe(2);
    expect(group1.getChildren().length).toBe(2);
    expect(group1.getFirst()).toBe(group2);
    expect(group1.getLast()).toBe(group4);
    expect(group1.getChildByIndex(1)).toBe(group4);
    expect(group2.getParent()).toBe(group1);
    expect(group1.getParent()).toBeNull();
    expect(group3.getParent()).toBe(group2);
    expect(group4.getFirst()).toBeNull();
    expect(group4.getLast()).toBeNull();
    expect(group1.getAttribute('class')).toBeUndefined();
    expect(group1.className).toBe('');
    expect(group1.classList).toStrictEqual([]);
    expect(group2.className).toBe('c1 c2');
    expect(group2.classList).toStrictEqual(['c1', 'c2']);
    expect(group4.getAttribute('class')).toBe('className4');
    expect(group4.className).toBe('className4');
    expect(group4.classList).toStrictEqual(['className4']);
    expect(group3.className).toBe('c1 c2 c3');
    expect(group3.classList).toStrictEqual(['c1', 'c2', 'c3']);
    expect(group2.matches('[name=group2]')).toBeTruthy();

    group3.className = 'c1 c2';
    expect(group3.classList).toStrictEqual(['c1', 'c2']);

    group3.setAttribute('class', 'c1 c2 c3');
    expect(group3.classList).toStrictEqual(['c1', 'c2', 'c3']);

    group3.setAttribute('class', '');
    expect(group3.classList).toStrictEqual([]);

    group3.removeAttribute('class');
    expect(group3.getAttribute('class')).toBeUndefined();

    // search in scene graph
    expect(
      group1.find((group) => {
        // @ts-ignore
        return group.get('name') === 'group4';
      }),
    ).toBe(group4);
    expect(
      group1.find((group) => {
        // @ts-ignore
        return group.get('name') === 'group5';
      }),
    ).toBeNull();
    expect(
      group1.find(() => {
        return true;
      }),
    ).toBe(group4);

    expect(
      group1.findAll(() => {
        return true;
      }).length,
    ).toBe(3);

    expect(group1.getElementsByName('group4').length).toBe(1);
    expect(group1.getElementsByName('group4')[0]).toBe(group4);

    expect(group1.getElementById('id4')).toBe(group4);
    expect(group1.getElementById('id10')).toBeNull();

    expect(group1.getElementsByClassName('className4').length).toBe(1);
    expect(group1.getElementsByClassName('className4')[0]).toBe(group4);
    expect(group1.getElementsByClassName('className10')).toStrictEqual([]);

    expect(group1.getElementsByTagName(Shape.GROUP).length).toBe(3);
    expect(group1.getElementsByTagName(Shape.CIRCLE).length).toBe(0);
  });

  it('should remove children recursively', () => {
    const group1 = new Group({
      id: 'id1',
      name: 'group1',
    });
    const group2 = new Group({
      id: 'id2',
      name: 'group2',
    });
    const group3 = new Group({
      id: 'id3',
      name: 'group3',
    });
    const group4 = new Group({
      id: 'id4',
      name: 'group4',
      className: 'className4',
    });

    // 1 -> 2 -> 3
    // 1 -> 4
    group1.appendChild(group2);
    group2.appendChild(group3);
    group1.appendChild(group4);

    group1.removeChildren();
    expect(group1.children.length).toBe(0);
    expect(group2.destroyed).toBeFalsy();
    expect(group3.destroyed).toBeFalsy();

    group1.appendChild(group2);
    group2.appendChild(group3);
    group1.appendChild(group4);
    // remove
    group4.remove();
    expect(group4.destroyed).toBeFalsy();
    expect(group1.children.length).toBe(1);

    // re-append
    group1.appendChild(group4);
    expect(group1.children.length).toBe(2);

    group4.remove();
    expect(group1.children.length).toBe(1);

    group1.appendChild(group2);
    group2.appendChild(group3);
    group1.appendChild(group4);
    [...group1.children].forEach((child) => child.remove());
    expect(group1.children.length).toBe(0);
  });

  it('should destroy children recursively', () => {
    const group1 = new Group({
      id: 'id1',
      name: 'group1',
    });
    const group2 = new Group({
      id: 'id2',
      name: 'group2',
    });
    const group3 = new Group({
      id: 'id3',
      name: 'group3',
    });
    const group4 = new Group({
      id: 'id4',
      name: 'group4',
      className: 'className4',
    });

    // 1 -> 2 -> 3
    // 1 -> 4
    group1.appendChild(group2);
    group2.appendChild(group3);
    group1.appendChild(group4);

    group1.destroyChildren();
    expect(group1.children.length).toBe(0);
    expect(group1.destroyed).toBeFalsy();
    expect(group2.destroyed).toBeTruthy();
    expect(group3.destroyed).toBeTruthy();
    expect(group4.destroyed).toBeTruthy();
  });

  it('should set attr & style correctly', () => {
    const group = new Group({
      style: {
        width: 1,
        height: 1,
      },
    });

    expect(group.style.getPropertyValue('width')).toBe(1);
    expect(group.style.getPropertyValue('height')).toBe(1);

    group.style.setProperty('width', 2);
    expect(group.style.getPropertyValue('width')).toBe(2);

    group.style.removeProperty('width');
    expect(group.style.getPropertyValue('width')).toBeUndefined();
  });

  it('should (deep) cloneNode correctly', () => {
    const group1 = new Group({
      id: 'id1',
      name: 'group1',
      className: 'c1',
      style: {
        // @ts-ignore
        fontSize: 10,
      },
    });
    group1.setPosition(100, 100);

    let cloned = group1.cloneNode();
    expect(cloned.id).toBe(group1.id);
    expect(cloned.name).toBe(group1.name);
    expect(cloned.className).toBe(group1.className);
    expect(cloned.getPosition()).toStrictEqual(group1.getPosition());
    expect(cloned.style.fontSize).toBe(group1.style.fontSize);

    // deep clone
    const group2 = new Group({
      id: 'id2',
      name: 'group2',
      className: 'c2',
      style: {
        // @ts-ignore
        fontSize: 20,
        transform: 'translate(100, 100)',
      },
    });
    group1.appendChild(group2);
    cloned = group1.cloneNode(true);
    expect(cloned.id).toBe(group1.id);
    expect(cloned.name).toBe(group1.name);
    expect(cloned.className).toBe(group1.className);
    expect(cloned.getPosition()).toStrictEqual(group1.getPosition());
    expect(cloned.style.fontSize).toBe(group1.style.fontSize);
    expect(cloned.children.length).toBe(1);
    expect(cloned.children[0].id).toBe(group2.id);
    expect(cloned.children[0].name).toBe(group2.name);
    expect(cloned.children[0].className).toBe(group2.className);
    expect((cloned.children[0] as DisplayObject).getPosition()).toStrictEqual(
      group2.getPosition(),
    );
    expect(cloned.children[0].style.fontSize).toBe(group2.style.fontSize);
    expect(cloned.children[0].style.transform).toBe(group2.style.transform);
  });

  it('should (deep) cloneNode for custom elements correctly', async () => {
    interface AProps {
      size: number;
      circle: Circle;
    }
    class ElementA extends CustomElement<AProps> {
      constructor(options: DisplayObjectConfig<AProps>) {
        super(options);
      }
      connectedCallback() {
        const { circle } = this.style;
        this.appendChild(circle);
      }
      disconnectedCallback() {}
      attributeChangedCallback<Key extends never>(
        name: Key,
        oldValue: any,
        newValue: any,
      ) {}
    }

    await canvas.ready;

    const circle = new Circle({
      name: 'testname',
      id: 'testid',
      className: 'testclassname',
      style: {
        fill: 'red',
        r: 10,
      },
    });
    const a = new ElementA({
      style: {
        size: 10,
        circle,
      },
    });

    // before appending to canvas
    let cloned = a.cloneNode(true);
    expect(cloned.style.size).toBe(10);
    expect(cloned.style.circle).not.toBe(circle);
    expect(cloned.style.circle.entity).not.toBe(circle.entity);
    expect(cloned.childNodes.length).toBe(0);

    // after appending to canvas
    canvas.appendChild(a);
    cloned = a.cloneNode(true);

    expect(cloned.style.size).toBe(10);
    expect(cloned.style.circle).not.toBe(circle);
    expect(cloned.style.circle.entity).not.toBe(circle.entity);
    expect(cloned.childNodes.length).toBe(1);
    expect((cloned.childNodes[0] as Circle).name).toBe('testname');
    expect((cloned.childNodes[0] as Circle).id).toBe('testid');
    expect((cloned.childNodes[0] as Circle).className).toBe('testclassname');
    expect((cloned.childNodes[0] as Circle).style.fill).toBe('red');
    expect((cloned.childNodes[0] as Circle).style.r).toBe(10);
  });
});
