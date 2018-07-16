module.exports = function getShape(x, y, e) {
  const id = e.srcElement.id;
  return this.findById(id);
};
