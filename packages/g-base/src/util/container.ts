/**
 * @fileoverview 添加 shape 和 Group 的方法，因为 Canvas 和 Group 都需要，所以在这里实现
 * @author dxq613@gmail.com
 */
import { IGroup, IElement, IShape, IContainer } from '../interfaces';
import { ShapeCfg, GroupCfg } from '../types';
import { upperFirst, isFunction, isObject, each } from '@antv/util';

const SHAPE_MAP = {};
const INDEX = '_INDEX';

function findShape(children: IElement[], x: number, y: number) {
  let rst;
  for (let i = children.length - 1; i >= 0; i--) {
    const child = children[i];
    if (child.get('visible') && child.get('capture')) {
      if (child.isGroup()) {
        rst = getShape(child as IGroup, x, y);
      } else if ((child as IShape).isHit(x, y)) {
        rst = child;
      }
    }
    if (rst) {
      break;
    }
  }
  return rst;
}
/**
 * 添加图形
 * @param {IContainer}   container   分组
 * @param {string} type 图形类型
 * @param {ShapeCfg} cfg  图形配置项
 * @returns 添加的图形对象
 */
function addShape(container: IContainer, type: string, cfg: ShapeCfg): IShape {
  const canvas = container.get('canvas');
  let shapeType = SHAPE_MAP[type];
  if (!shapeType) {
    shapeType = upperFirst(type);
    SHAPE_MAP[type] = shapeType;
  }
  cfg['canvas'] = canvas;
  cfg['type'] = type;
  const ShapeBase = container.getShapeBase();
  const rst = new ShapeBase[shapeType](cfg);
  add(container, rst);
  return rst;
}

function addGroup(container: IContainer, groupClass?: any, cfg?: GroupCfg): IGroup {
  const canvas = container.get('canvas');
  let rst;
  if (isFunction(groupClass)) {
    if (cfg) {
      cfg.canvas = canvas;
      cfg.parent = container;
      rst = new groupClass(cfg);
    } else {
      rst = new groupClass({
        canvas,
        parent: container,
      });
    }
  } else {
    const tmpCfg = groupClass;
    const TmpGroupClass = container.getGroupBase();
    rst = new TmpGroupClass(tmpCfg);
  }
  add(container, rst);
  return rst;
}
/**
 * 添加元素
 * @param {IContainer}   container   分组
 * @param {IElement} element 图形元素
 */
function add(container: IContainer, element: IElement) {
  const parent = container.get('canvas');
  const children = container.getChildren();
  if (parent) {
    removeChild(container, element, false);
  }
  const cfg = this._cfg;
  element.set('parent', container);
  element.set('canvas', container.get('canvas'));
  children.push(element);
}

function contains(container: IContainer, element: IElement): boolean {
  const children = container.getChildren();
  return children.indexOf(element) >= 0;
}

function removeChild(container: IContainer, element: IElement, destroy: boolean = true) {
  if (contains(container, element)) {
    element.remove(destroy);
  }
}

function getShape(container: IContainer, x: number, y: number): IShape {
  const clip = container.get('clip') as IShape;
  const children = container.getChildren();
  let rst;
  if (clip) {
    const v = [ x, y, 1 ];
    if (clip.isHit(v[0], v[1])) {
      rst = findShape(children, x, y);
    }
  } else {
    rst = findShape(children, x, y);
  }
  return rst;
}

function clear(container: IContainer) {
  if (container.get('destroyed')) {
    return;
  }
  const children = container.getChildren();
  for (let i = children.length - 1; i >= 0; i--) {
    children[i].remove(true);
  }
  container.set('children', []);
  return this;
}

function getComparer(compare: Function) {
  return function (left, right) {
    const result = compare(left, right);
    return result === 0 ? left[INDEX] - right[INDEX] : result;
  };
}

function sort(container) {
  const children = container.get('children');
  // 稳定排序
  each(children, (child, index) => {
    child[INDEX] = index;
    return child;
  });

  children.sort(getComparer((obj1, obj2) => {
    return obj1.get('zIndex') - obj2.get('zIndex');
  }));

  return this;
}

export default {
  addShape,
  addGroup,
  add,
  getShape,
  clear,
  sort,
  contains,
  removeChild,
};
