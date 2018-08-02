module.exports = function getShape(x, y, e) {
  const target = e.target || e.srcElement;
  const id = target.id;
  if (this._attrs.id === id) {
    return this;
  }
  return this.find(item => {
    return item.attrs && item._attrs.id === id;
  });
};
