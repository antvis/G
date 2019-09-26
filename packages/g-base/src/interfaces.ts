import { ShapeCfg, GroupCfg, ClipCfg, Point, ChangeType, AnimateCfg, ElementAttrs, OnFrame } from './types';
import BBox from './bbox';

export interface ICtor<T> {
  new (cfg: any): T;
}

/**
 * @interface IObserable
 * 可以绑定事件的接口
 */
export interface IObservable {
  /**
   * 绑定事件
   * @param {string}   eventName 事件名
   * @param {Function} callback  回调函数
   */
  on(eventName: string, callback: Function);
  /**
   * 移除事件
   */
  off();
  /**
   * 移除事件
   * @param {string} eventName 事件名
   */
  off(eventName: string);
  /**
   * 移除事件
   * @param {string}   eventName 事件名
   * @param {Function} callback  回调函数
   */
  off(eventName: string, callback: Function);
  /**
   * 触发事件, trigger 的别名函数
   * @param {string} eventName 事件名称
   * @param {object} args 参数
   */
  emit(eventName: string, eventObject: object);
  /**
   * 触发事件
   * @param {string} eventName 事件名称
   * @param {object} args 参数
   */
  trigger(eventName: string, eventObject: object);
}

/**
 * @interface IBase
 * 所有图形类公共的接口，提供 get,set 方法
 */
export interface IBase extends IObservable {
  /**
   * 获取属性值
   * @param  {string} name 属性名
   * @return {any} 属性值
   */
  get(name: string): any;
  /**
   * 设置属性值
   * @param {string} name  属性名称
   * @param {any}    value 属性值
   */
  set(name: string, value: any);

  /**
   * 是否销毁
   * @type {boolean}
   */
  destroyed: boolean;

  /**
   * 销毁对象
   */
  destroy();
}

/**
 * @interface
 * 图形元素的基类
 */
export interface IElement extends IBase {
  /**
   * 获取父元素
   * @return {IContainer} 父元素一般是 Group 或者是 Canvas
   */
  getParent(): IContainer;

  /**
   * 获取所属的 Canvas
   * @return {ICanvas} Canvas 对象
   */
  getCanvas(): ICanvas;

  /**
   * 当引擎画布变化时，可以调用这个方法，告知 canvas 图形属性发生了改变
   * 这个方法一般不要直接调用，在实现 element 的继承类时可以复写
   * @param {ChangeType} changeType 改变的类型
   */
  onCanvasChange(changeType: ChangeType);

  /**
   * 是否是分组
   * @return {boolean} 是否是分组
   */
  isGroup(): boolean;
  /**
   * 从父元素中移除
   * @param {boolean} destroy 是否同时销毁
   */
  remove(destroy);
  /**
   * 获取全量的图形属性
   */
  attr();
  /**
   * 获取图形属性
   * @param {string} name 图形属性名
   * @returns 图形属性值
   */
  attr(name: string): any;
  /**
   * 设置图形属性
   * @param {string} name  图形属性名
   * @param {any}    value 图形属性值
   */
  attr(name: string, value: any);
  /**
   * 设置图形属性
   * @param {object} attrs 图形属性配置项，键值对方式
   */
  attr(attrs: object);
  /**
   * 获取包围盒，这个包围盒是相对于图形元素自己，不会计算 matrix
   * @returns {BBox} 包围盒
   */
  getBBox(): BBox;
  /**
   * 获取图形元素相对画布的包围盒，会计算从顶层到当前的 matrix
   * @returns {BBox} 包围盒
   */
  getCanvasBBox(): BBox;
  /**
   * 复制对象
   */
  clone(): IElement;
  /**
   * 显示
   */
  show();
  /**
   * 隐藏
   */
  hide();
  /**
   * 最前面
   */
  toFront();
  /**
   * 最后面
   */
  toBack();
  /**
   * 清除掉所有平移、旋转和缩放
   */
  resetMatrix();
  /**
   * 获取 transform 后的矩阵
   * @return {number[]} 矩阵
   */
  getMatrix(): number[];
  /**
   * 设置 transform 的矩阵
   * @param {number[]} m 应用到图形元素的矩阵
   */
  setMatrix(m: number[]);
  /**
   * 将向量应用设置的矩阵
   * @param {number[]} v 向量
   */
  applyToMatrix(v: number[]);
  /**
   * 根据设置的矩阵，将向量转换相对于图形/分组的位置
   * @param {number[]} v 向量
   */
  invertFromMatrix(v: number[]);

  /**
   * 是否处于动画暂停状态
   * @return {boolean} 是否处于动画暂停状态
   */
  isAnimatePaused();

  /**
   * 执行动画
   * @param {ElementAttrs} toAttrs 动画最终状态
   * @param {number}       duration 动画执行时间
   * @param {string}       easing 动画缓动效果
   * @param {function}     callback 动画执行后的回调
   * @param {number}       delay 动画延迟时间
   */
  animate(toAttrs: ElementAttrs, duration: number, easing?: string, callback?: Function, delay?: number);

  /**
   * 执行动画
   * @param {OnFrame}  onFrame  自定义帧动画函数
   * @param {number}   duration 动画执行时间
   * @param {string}   easing   动画缓动效果
   * @param {function} callback 动画执行后的回调
   * @param {number}   delay    动画延迟时间
   */
  animate(onFrame: OnFrame, duration: number, easing?: string, callback?: Function, delay?: number);

  /**
   * 执行动画
   * @param {ElementAttrs} toAttrs 动画最终状态
   * @param {AnimateCfg}   cfg     动画配置
   */
  animate(toAttrs, cfg: AnimateCfg);

  /**
   * 执行动画
   * @param {OnFrame}    onFrame 自定义帧动画函数
   * @param {AnimateCfg} cfg     动画配置
   */
  animate(onFrame, cfg: AnimateCfg);

  /**
   * 停止图形的动画
   * @param {boolean} toEnd 是否到动画的最终状态
   */
  stopAnimate(toEnd?: boolean);

  /**
   * 暂停图形的动画
   */
  pauseAnimate();

  /**
   * 重启暂停的动画
   */
  resumeAnimate();

  /**
   * 设置 clip ，会在内部转换成对应的图形
   * @param {ClipCfg} clipCfg 配置项
   */
  setClip(clipCfg: ClipCfg);

  /**
   * 获取 clip ，clip 对象是一个 Shape
   * @returns {IShape} clip 的 Shape
   */
  getClip(): IShape;

  /**
   * 指定的点是否被裁剪掉
   * @param  {number}  refX 相对于图形的坐标 x
   * @param  {number}  refY 相对于图形的坐标 Y
   * @return {boolean} 是否被裁剪
   */
  isClipped(refX: number, refY: number): boolean;
}

export interface IContainer extends IBase {
  /**
   * 添加图形
   * @param {ShapeCfg} cfg  图形配置项
   * @returns 添加的图形对象
   */
  addShape(cfg: ShapeCfg): IShape;
  /**
   * 添加图形
   * @param {string} type 图形类型
   * @param {ShapeCfg} cfg  图形配置项
   * @returns 添加的图形对象
   */
  addShape(type: string, cfg: ShapeCfg): IShape;

  /**
   * 容器是否是 Canvas 画布
   */
  isCanvas();

  /**
   * 获取 Shape 的基类
   * @return {IShape} Shape 的基类，用作工厂方法来获取类实例
   */
  getShapeBase(): ICtor<IShape>;

  /**
   * 获取 Group 的基类，用于添加默认的 Group
   * @return {IGroup} group 类型
   */
  getGroupBase(): ICtor<IGroup>;
  /**
   * 添加图形分组，增加一个默认的 Group
   * @returns 添加的图形分组
   */
  addGroup(): IGroup;
  /**
   * 添加图形分组，并设置配置项
   * @param {GroupCfg} cfg 图形分组的配置项
   * @returns 添加的图形分组
   */
  addGroup(cfg: GroupCfg): IGroup;
  /**
   * 添加图形分组，指定类型
   * @param {IGroup} classConstructor 图形分组的构造函数
   * @param {GroupCfg} cfg 图形分组配置项
   * @returns 添加的图形分组
   */
  addGroup(classConstructor: IGroup, cfg: GroupCfg): IGroup;
  /**
   * 根据 x,y 获取对应的图形
   * @param {number} x x 坐标
   * @param {number} y y 坐标
   * @returns 添加的图形分组
   */
  getShape(x: number, y: number): IShape;
  /**
   * 添加图形元素，已经在外面构造好的类
   * @param {IElement} element 图形元素（图形或者分组）
   */
  add(element: IElement);
  /**
   * 获取父元素
   * @return {IContainer} 父元素一般是 Group 或者是 Canvas
   */
  getParent(): IContainer;
  /**
   * 获取所有的子元素
   * @return {IElement[]} 子元素的集合
   */
  getChildren(): IElement[];
  /**
   * 子元素按照 zIndex 进行排序
   */
  sort();
  /**
   * 清理所有的子元素
   */
  clear();
}

export interface IGroup extends IElement, IContainer {
  /**
   * 是否是实体分组，即对应实际的渲染元素
   * @return {boolean} 是否是实体分组
   */
  isEntityGroup(): boolean;
}

export interface IShape extends IElement {
  /**
   * 图形拾取
   * @param {number} x x 坐标
   * @param {number} y y 坐标
   * @returns 是否已被拾取
   */
  isHit(x: number, y: number): boolean;
  /**
   * 是否用于 clip, 默认为 false
   * @return {boolean} 图形是否用于 clip
   */
  isClipShape(): boolean;
}

/**
 * @interface ICanvas
 * 画布，图形的容器
 */
export interface ICanvas extends IContainer {
  /**
   * 为了兼容持续向上查找 parent
   * @return {IContainer} 返回元素的父容器，在 canvas 中始终是 null
   */
  getParent(): IContainer;
  /**
   * 改变画布大小
   * @param {number} width  宽度
   * @param {number} height 高度
   */
  changeSize(width: number, height: number);
  /**
   * 将窗口坐标转变成 canvas 坐标
   * @param  {number} clientX 窗口 x 坐标
   * @param  {number} clientY 窗口 y 坐标
   * @return {object} canvas坐标
   */
  getPointByClient(clientX: number, clientY: number): Point;

  /**
   * 将 canvas 坐标转换成窗口坐标
   * @param {number} x canvas 上的 x 坐标
   * @param {number} y canvas 上的 y 坐标
   * @returns {object} 窗口坐标
   */
  getClientByPoint(x: number, y: number): Point;

  /**
   * 绘制
   */
  draw();
}
