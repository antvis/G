module.exports = function getShape(x, y, e) {
  const id = e.srcElement.id;
  if (this._attrs.id === id) {
    return this;
  }
  return this.find(item => {
    return item._attrs.id === id;
  });
};
