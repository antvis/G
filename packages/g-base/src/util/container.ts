/**
 * @fileoverview 添加 shape 和 Group 的方法，因为 Canvas 和 Group 都需要，所以在这里实现
 * @author dxq613@gmail.com
 */
import { IGroup, IElement, IShape, IContainer, ICanvas, IBase } from '../interfaces';
import { ShapeCfg, GroupCfg } from '../types';
import Timeline from '../animate/timeline';
import { upperFirst, isFunction, isObject, each, removeFromArray } from './util';

const SHAPE_MAP = {};
const INDEX = '_INDEX';

function isAllowCapture(element: IBase): boolean {
  return element.get('visible') && element.get('capture');
}

function findShape(children: IElement[], x: number, y: number) {
  let rst = null;
  for (let i = children.length - 1; i >= 0; i--) {
    const child = children[i];
    if (isAllowCapture(child)) {
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

function getCanvas(container: IContainer) {
  let canvas;
  if (container.isCanvas()) {
    canvas = container;
  } else {
    canvas = (container as IGroup).getCanvas();
  }
  return canvas;
}

/**
 * 添加图形
 * @param {IContainer}   container   group 或者 canvas
 * @param {string} type 图形类型
 * @param {ShapeCfg} cfg  图形配置项
 * @returns 添加的图形对象
 */
function addShape(container: IContainer, cfg: ShapeCfg): IShape {
  const type = cfg.type;
  let shapeType = SHAPE_MAP[type];
  if (!shapeType) {
    shapeType = upperFirst(type);
    SHAPE_MAP[type] = shapeType;
  }
  // const canvas = getCanvas(container);
  // cfg['canvas'] = canvas; // 在 add 函数里面已经添加
  // cfg['type'] = type;
  const ShapeBase = container.getShapeBase();
  const rst = new ShapeBase[shapeType](cfg);
  add(container, rst);
  return rst;
}
/**
 * 添加图形分组，并设置配置项
 * @param {IContainer} container 容器，group 或者 canvas
 * @param {GroupCfg} cfg 图形分组的配置项
 * @returns 添加的图形分组
 */
function addGroup(container: IContainer, groupClass?: any, cfg?: GroupCfg): IGroup {
  // const canvas = getCanvas(container);
  let rst;
  if (isFunction(groupClass)) {
    if (cfg) {
      // cfg.canvas = canvas; // 这两个变量在 add 函数中都添加，这里就不写了
      // cfg.parent = container;
      rst = new groupClass(cfg);
    } else {
      rst = new groupClass({
        // canvas,
        parent: container,
      });
    }
  } else {
    const tmpCfg = groupClass || {};
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
  const canvas = getCanvas(container);
  const children = container.getChildren();
  const timeline = container.get('timeline');
  const preParent = element.getParent();
  if (preParent) {
    removeChild(preParent, element, false);
  }
  element.set('parent', container);
  if (canvas) {
    setCanvas(element, canvas);
  }
  if (timeline) {
    setTimeline(element, timeline);
  }
  children.push(element);
}

/**
 * 设置 canvas
 * @param {IElement} element 元素
 * @param {ICanvas}  canvas  画布
 */
function setCanvas(element: IElement, canvas: ICanvas) {
  element.set('canvas', canvas);
  if (element.isGroup()) {
    const children = element.get('children');
    if (children.length) {
      children.forEach((child) => {
        setCanvas(child, canvas);
      });
    }
  }
}

/**
 * 设置 timeline
 * @param {IElement} element  元素
 * @param {Timeline} timeline 时间轴
 */
function setTimeline(element: IElement, timeline: Timeline) {
  element.set('timeline', timeline);
  if (element.isGroup()) {
    const children = element.get('children');
    if (children.length) {
      children.forEach((child) => {
        setTimeline(child, timeline);
      });
    }
  }
}

function contains(container: IContainer, element: IElement): boolean {
  const children = container.getChildren();
  return children.indexOf(element) >= 0;
}

function removeChild(container: IContainer, element: IElement, destroy: boolean = true) {
  // 不再调用 element.remove() 方法，会出现循环调用
  if (destroy) {
    element.destroy();
  } else {
    element.set('parent', null);
    element.set('canvas', null);
  }
  removeFromArray(container.getChildren(), element);
}

function getShape(container: IContainer, x: number, y: number): IShape {
  // 如果不支持拾取，则直接返回
  if (!isAllowCapture(container)) {
    return null;
  }
  const children = container.getChildren();
  let rst;
  // 如果容器是 group
  if (!container.isCanvas()) {
    const v = [x, y, 1];
    const group = container as IGroup;
    // 将 x, y 转换成对应于 group 的局部坐标
    group.invertFromMatrix(v);
    if (!group.isClipped(v[0], v[1])) {
      rst = findShape(children, v[0], v[1]);
    }
  } else {
    rst = findShape(children, x, y);
  }
  return rst;
}

function clear(container: IContainer) {
  if (container.destroyed) {
    return;
  }
  const children = container.getChildren();
  for (let i = children.length - 1; i >= 0; i--) {
    children[i].destroy(); // 销毁子元素
  }
  container.set('children', []);
  return this;
}

function getComparer(compare: Function) {
  return function(left, right) {
    const result = compare(left, right);
    return result === 0 ? left[INDEX] - right[INDEX] : result;
  };
}

/**
 * 对容器的子元素进行分组
 * @param {IContainer} container 容器
 */
function sort(container: IContainer) {
  const children = container.getChildren();
  // 稳定排序
  each(children, (child, index) => {
    child[INDEX] = index;
    return child;
  });

  children.sort(
    getComparer((obj1, obj2) => {
      return obj1.get('zIndex') - obj2.get('zIndex');
    })
  );

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
