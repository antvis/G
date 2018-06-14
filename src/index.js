module.exports = {
  // renderers
  svg: require('./svg/index'),
  canvas: require('./canvas/index'),
  // utils
  CommonUtil: require('./util/common'),
  DomUtil: require('./util/dom'),
  MatrixUtil: require('./util/matrix'),
  PathUtil: require('./util/path'),
  // version, etc.
  version: '2.1.0'
};
