/**
 * @fileoverview defs
 * @author dengfuping_develop@163.com
 */

import { uniqueId } from '@antv/util';

class Defs {
  id: string;
  defaultArrow: {};
  children: any[];
  el: SVGDefsElement;
  canvas: SVGSVGElement;

  constructor(canvas) {
    const el = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const id = uniqueId('defs_');
    el.id = id;
    canvas.appendChild(el);
    this.children = [];
    this.defaultArrow = {};
    this.el = el;
    this.canvas = canvas;
  }
  find(type, attr) {
    const children = this.children;
    let result = null;
    for (let i = 0; i < children.length; i++) {
      if (children[i].match(type, attr)) {
        result = children[i].id;
        break;
      }
    }
    return result;
  }
  findById(id) {
    const children = this.children;
    let flag = null;
    for (let i = 0; i < children.length; i++) {
      if (children[i].id === id) {
        flag = children[i];
        break;
      }
    }
    return flag;
  }
  add(item) {
    this.children.push(item);
    item.canvas = this.canvas;
    item.parent = this;
  }
}

export default Defs;
