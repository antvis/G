/**
 * @fileoverview 操作 Group 的一些方法，便于进行单元测试
 * @author dxq613@gmail.com
 */
import { IGroup, IElement } from '../interfaces';
import { isString, each } from '@antv/util';

const GroupUtil = {
  /**
   * 获取 Group 的第一个元素
   * @param  {IGroup}   group Group 对象
   * @return {IElement} 第一个元素
   */
  getFirst(group: IGroup): IElement {
    return group.getChildren()[0];
  },
  /**
   * 获取 Group 的最后一个元素
   * @param  {IGroup}   group Group 对象
   * @return {IElement} 元素
   */
  getLast(group: IGroup): IElement {
    const children = group.getChildren();
    return children[children.length - 1];
  },
  /**
   * 子元素的数量
   * @param  {IGroup} group Group 对象
   * @return {number} 子元素数量
   */
  getCount(group: IGroup): number {
    return group.getChildren().length;
  },
  /**
   * 查找所有匹配的元素
   * @param  {IGroup}          group Group 对象
   * @param  {Function}        fn    匹配函数
   * @return {IElement[]} 元素数组
   */
  findAll(group: IGroup, fn: Function): IElement[] {
    let rst: IElement[] = [];
    const children = group.getChildren();
    each(children, (element: IElement) => {
      if (fn(element)) {
        rst.push(element);
      }
      if (element.isGroup()) {
        rst = rst.concat(GroupUtil.findAll(element as IGroup, fn));
      }
    });
    return rst;
  },
  /**
   * 根据 ID 查找元素
   * @param {IGroup} group Group 对象
   * @param {string} id 元素 id
   * @return {IElement|null} 元素
   */
  findById(group: IGroup, id: string): IElement {
    return this.find(group, (element) => {
      return element.get('id') === id;
    });
  },
  /**
   * 查找元素，找到第一个返回
   * @param  {IGroup}   group Group 对象
   * @param  {Function} fn    匹配函数
   * @return {IElement|null} 元素，可以为空
   */
  find(group: IGroup, fn: Function): IElement {
    let rst: IElement = null;
    const children = group.getChildren();
    each(children, (element: IElement) => {
      if (fn(element)) {
        rst = element;
      } else if (element.isGroup()) {
        rst = GroupUtil.find(element as IGroup, fn);
      }
      if (rst) {
        return false;
      }
    });
    return rst;
  },
};

export default GroupUtil;
