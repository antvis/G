import { toArray } from '@antv/util';

export function createSVGElement(type: string): SVGElement {
  return document.createElementNS('http://www.w3.org/2000/svg', type);
}

// /**
//  * 对 dom 元素进行排序
//  * @param {IElement} element  元素
//  * @param {sorter}   function 排序函数
//  */
//  export function sortDom(element: IElement, sorter: (a: IElement, b: IElement) => number) {
//   const el = element.get('el');
//   const childList = toArray(el.children).sort(sorter);
//   // create empty fragment
//   const fragment = document.createDocumentFragment();
//   childList.forEach((child) => {
//     fragment.appendChild(child);
//   });
//   el.appendChild(fragment);
// }

/**
 * 将 dom 元素移动到父元素下的指定位置
 * @param {SVGElement} element     dom 元素
 * @param {number}     targetIndex 目标位置(从 0 开始)
 */
export function moveTo(element: SVGElement, targetIndex: number) {
  const parentNode = element.parentNode;
  if (parentNode) {
    const siblings = Array.from(parentNode.childNodes).filter(
      // 要求为元素节点，且不能为 defs 节点
      (node: Node) => node.nodeType === 1 && node.nodeName.toLowerCase() !== 'defs'
    );
    // 获取目标节点
    const target = siblings[targetIndex];
    const currentIndex = siblings.indexOf(element);
    // 如果目标节点存在
    if (target) {
      // 当前索引 > 目标索引，直接插入到目标节点之前即可
      if (currentIndex > targetIndex) {
        parentNode.insertBefore(element, target);
      } else if (currentIndex < targetIndex) {
        // 当前索引 < 目标索引
        // 获取目标节点的下一个节点
        const targetNext = siblings[targetIndex + 1];
        // 如果目标节点的下一个节点存在，插入到该节点之前
        if (targetNext) {
          parentNode.insertBefore(element, targetNext);
        } else {
          // 如果该节点不存在，则追加到末尾
          parentNode.appendChild(element);
        }
      }
    } else {
      parentNode.appendChild(element);
    }
  }
}
