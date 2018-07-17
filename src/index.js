module.exports = {
  Canvas: require('./canvas'),
  Group: require('./core/group'),
  Shape: require('./core/shape'),
  Rect: require('./shapes/rect'),
  Circle: require('./shapes/circle'),
  Ellipse: require('./shapes/ellipse'),
  Path: require('./shapes/path'),
  Text: require('./shapes/text'),
  Line: require('./shapes/line'),
  Image: require('./shapes/image'),
  Polygon: require('./shapes/polygon'),
  Polyline: require('./shapes/polyline'),
  Arc: require('./shapes/arc'),
  Fan: require('./shapes/fan'),
  Marker: require('./shapes/marker'),
  Dom: require('./shapes/dom'),
  PathSegment: require('./shapes/util/path-segment'),
  // utils
  CommonUtil: require('./util/common'),
  DomUtil: require('./util/dom'),
  MatrixUtil: require('./util/matrix'),
  PathUtil: require('./util/path'),
  Event: require('./event'),
  // version, etc.
  version: '3.0.0-beta.7'
};
