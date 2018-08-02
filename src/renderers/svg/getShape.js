const TAG_MAP = {
  svg: 'svg',
  circle: 'circle',
  rect: 'rect',
  text: 'text',
  path: 'path',
  foreignObject: 'foreignObject',
  polygon: 'polygon',
  ellipse: 'ellipse',
  image: 'image'
};

module.exports = function getShape(x, y, e) {
  const target = e.target || e.srcElement;
  let id = target.id;
  if (!id || !TAG_MAP[target.tagName]) {
    let parent = target.parentNode;
    while (parent && !TAG_MAP[parent.tagName]) {
      parent = parent.parentNode;
    }
    id = parent.id;
  }
  if (this._attrs.id === id) {
    return this;
  }
  return this.find(item => {
    return item._attrs && item._attrs.id === id;
  });
};
