import { SHAPE_TO_TAGS, SVG_ATTR_MAP } from '../constant';

export function createDom(model, index?) {
  const type = SHAPE_TO_TAGS[model.type];
  const attrs = model.attrs;
  const parent = model.cfg.parent;
  if (!type) {
    throw new Error(`the type ${model.type} is not supported by svg`);
  }
  const shape = document.createElementNS('http://www.w3.org/2000/svg', type);
  if (model.cfg.id) {
    shape.id = model.cfg.id;
  }
  model.cfg.el = shape;
  if (parent) {
    let parentNode = parent.cfg.el;
    while (!parentNode) {
      const newParent = parent.cfg.parent;
      parentNode = newParent && newParent.cfg.el;
    }
    if (typeof index === 'undefined') {
      parentNode.appendChild(shape);
    } else {
      const childNodes = parent.cfg.el.childNodes;
      // svg下天然有defs作为子节点，svg下子元素index需要+1
      if (parentNode.tagName === 'svg') {
        index += 1;
      }
      if (childNodes.length <= index) {
        parentNode.appendChild(shape);
      } else {
        parentNode.insertBefore(shape, childNodes[index]);
      }
    }
  }
  model.cfg.attrs = {};
  return shape;
}

export function setShadow(model, context) {
  const el = model.cfg.el;
  const attrs = model.attr();
  const cfg = {
    dx: attrs.shadowOffsetX,
    dy: attrs.shadowOffsetY,
    blur: attrs.shadowBlur,
    color: attrs.shadowColor,
  };
  if (!cfg.dx && !cfg.dy && !cfg.blur && !cfg.color) {
    el.removeAttribute('filter');
  } else {
    let id = context.find('filter', cfg);
    if (!id) {
      id = context.addShadow(cfg);
    }
    el.setAttribute('filter', `url(#${id})`);
  }
}

export function setTransform(model) {
  const { matrix } = model.attr();
  const el = model.cfg.el;
  let transform: any = [];
  for (let i = 0; i < 9; i += 3) {
    transform.push(`${matrix[i]},${matrix[i + 1]}`);
  }
  transform = transform.join(',');
  if (transform.indexOf('NaN') === -1) {
    el.setAttribute('transform', `matrix(${transform})`);
  } else {
    console.warn('invalid matrix:', matrix);
  }
}

export function setClip(model, context) {
  const { clip } = this.attr();
  const el = model.cfg.el;
  if (!clip) {
    el.removeAttribute('clip-path');
  } else if (clip && !el.hasAttribute('clip-path')) {
    createDom(model);
    const id = context.addClip(clip);
    el.setAttribute('clip-path', `url(#${id})`);
  }
}
